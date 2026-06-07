import "server-only";

import type { AppLogger } from "@repo/logger";
import { createLogger, logEvent } from "@repo/logger";
import type { JsMsg } from "nats";
import type { z } from "zod";
import {
  ensureConsumer,
  getJetStream,
  resolveStreamName,
} from "./connection.ts";
import {
  calculateRetryDelay,
  getDLQ,
  RETRY_POLICIES,
  shouldRetry,
} from "./dlq.ts";
import type {
  BaseEvent,
  EventBusConfig,
  PublishOptions,
  RetryPolicy,
  SubscriptionHandle,
  SubscriptionOptions,
  TypedEventHandler,
} from "./types.ts";
import {
  createVersionedEnvelope,
  getIdempotencyStore,
  getSchemaRegistry,
  processIncomingEvent,
} from "./versioning.ts";

type MsgInfo = {
  deliveryCount?: number;
  redeliveryCount?: number;
};

const getDeliveryCount = (message: JsMsg): number => {
  const info = (message as unknown as { info?: MsgInfo }).info;
  return info?.redeliveryCount ?? info?.deliveryCount ?? 0;
};

export class EventBus {
  private readonly config: EventBusConfig;

  private readonly logger: AppLogger;

  constructor(config: EventBusConfig) {
    this.config = config;
    this.logger = createLogger("events.bus", {
      module: config.module,
    });
  }

  async publish<TPayload>(
    eventType: string,
    payload: TPayload,
    context: {
      metadata?: Record<string, unknown>;
      tenantId: string;
      userId: string;
    } & PublishOptions
  ): Promise<BaseEvent<TPayload>> {
    const event = createVersionedEnvelope({
      causationId: context.causationId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      metadata: context.metadata,
      payload,
      source: this.config.module,
      tenantId: context.tenantId,
      type: eventType,
      userId: context.userId,
    });

    const jetstream = await getJetStream();
    const ack = await jetstream.publish(
      eventType,
      new TextEncoder().encode(JSON.stringify(event)),
      {
        msgID: event.id,
      }
    );

    logEvent({
      action: "publish",
      eventId: event.id,
      logger: this.logger,
      sequence: ack.seq,
      streamName: ack.stream,
      subject: eventType,
    });

    return event;
  }

  async publishBatch<TPayload>(
    events: Array<{ eventType: string; payload: TPayload }>,
    context: {
      metadata?: Record<string, unknown>;
      tenantId: string;
      userId: string;
    } & PublishOptions
  ): Promise<BaseEvent<TPayload>[]> {
    const correlationId = context.correlationId;
    const publishedEvents: BaseEvent<TPayload>[] = [];

    for (const [index, event] of events.entries()) {
      publishedEvents.push(
        await this.publish(event.eventType, event.payload, {
          ...context,
          causationId:
            index === 0 ? context.causationId : publishedEvents.at(-1)?.id,
          correlationId,
        })
      );
    }

    return publishedEvents;
  }

  async subscribe<TSchema extends z.ZodType>(
    eventType: string,
    handler: TypedEventHandler<TSchema>,
    options: SubscriptionOptions = {}
  ): Promise<SubscriptionHandle> {
    const registry = getSchemaRegistry();
    const streamName = options.streamName ?? resolveStreamName(eventType);

    if (!streamName) {
      throw new Error(
        `Unable to resolve a stream for subject "${eventType}". Pass streamName or ensure streams first.`
      );
    }

    const consumerName =
      options.consumerName ??
      `${this.config.module}-${eventType.replace(/[^a-zA-Z0-9]+/g, "-")}`;
    const maxRetries =
      options.maxRetries ??
      this.config.retryPolicy?.maxRetries ??
      RETRY_POLICIES.default.maxRetries;
    const retryPolicy: RetryPolicy =
      this.config.retryPolicy ?? RETRY_POLICIES.default;
    const ackWaitMs = options.ackWaitMs ?? 30_000;
    const startFrom = options.startFrom ?? "new";

    await ensureConsumer({
      ackWaitMs,
      consumerName,
      maxRetries,
      startFrom,
      streamName,
      subject: eventType,
    });

    const jetstream = await getJetStream();
    const consumer = await jetstream.consumers.get(streamName, consumerName);
    const messages = await consumer.consume();
    let running = true;

    const runSubscription = async (): Promise<void> => {
      for await (const message of messages) {
        if (!running) {
          break;
        }

        await this.processMessage({
          consumerName,
          eventType,
          handler,
          message,
          onError: options.onError,
          registry,
          retryPolicy,
          streamName,
          tenantId: options.tenantId,
        });
      }
    };

    runSubscription().catch((error: unknown) => {
      this.logger.error(
        { error, streamName, subject: eventType },
        "subscription loop failed"
      );
    });

    logEvent({
      action: "subscribe",
      consumerName,
      logger: this.logger,
      streamName,
      subject: eventType,
    });

    return {
      unsubscribe: (): Promise<void> => {
        running = false;
        messages.stop();
        return Promise.resolve();
      },
    };
  }

  private async handleProcessingError(params: {
    consumerName: string;
    error: Error;
    event: BaseEvent;
    eventType: string;
    message: JsMsg;
    onError?: (error: Error, event: BaseEvent) => Promise<void>;
    retryPolicy: RetryPolicy;
    streamName: string;
  }): Promise<void> {
    const deliveryCount = getDeliveryCount(params.message);

    getDLQ().add({
      consumerName: params.consumerName,
      error: params.error,
      event: params.event,
      maxRetries: params.retryPolicy.maxRetries,
      retryCount: deliveryCount,
      subject: params.eventType,
    });

    if (params.onError) {
      await params.onError(params.error, params.event);
    }

    if (params.event.idempotencyKey) {
      getIdempotencyStore().record(
        params.event.idempotencyKey,
        params.event.id,
        "error"
      );
    }

    if (shouldRetry(deliveryCount, params.retryPolicy)) {
      params.message.nak(
        calculateRetryDelay(deliveryCount + 1, params.retryPolicy)
      );
    } else {
      params.message.term();
    }

    logEvent({
      action: "nack",
      error: params.error.message,
      eventId: params.event.id,
      logger: this.logger,
      streamName: params.streamName,
      subject: params.eventType,
    });
  }

  private async processMessage<TSchema extends z.ZodType>(params: {
    consumerName: string;
    eventType: string;
    handler: TypedEventHandler<TSchema>;
    message: JsMsg;
    onError?: (error: Error, event: BaseEvent) => Promise<void>;
    registry: ReturnType<typeof getSchemaRegistry>;
    retryPolicy: RetryPolicy;
    streamName: string;
    tenantId?: string;
  }): Promise<void> {
    const event = JSON.parse(
      new TextDecoder().decode(params.message.data)
    ) as BaseEvent;

    if (params.tenantId && event.tenantId !== params.tenantId) {
      params.message.ack();
      return;
    }

    try {
      const processed = processIncomingEvent(event, {
        checkIdempotency: true,
      });

      if (processed.isDuplicate) {
        params.message.ack();
        return;
      }

      const schema = params.registry.getLatestSchema(event.type);
      const validatedPayload = schema?.schema
        ? schema.schema.parse(processed.data)
        : processed.data;

      const nextEvent = {
        ...event,
        payload: validatedPayload,
        version: processed.version,
      } as BaseEvent;

      await params.handler(nextEvent as Parameters<typeof params.handler>[0]);

      if (nextEvent.idempotencyKey) {
        getIdempotencyStore().record(
          nextEvent.idempotencyKey,
          nextEvent.id,
          "success"
        );
      }

      params.message.ack();

      logEvent({
        action: "handle",
        eventId: nextEvent.id,
        logger: this.logger,
        streamName: params.streamName,
        subject: params.eventType,
      });
    } catch (error) {
      await this.handleProcessingError({
        consumerName: params.consumerName,
        error: error instanceof Error ? error : new Error(String(error)),
        event,
        eventType: params.eventType,
        message: params.message,
        onError: params.onError,
        retryPolicy: params.retryPolicy,
        streamName: params.streamName,
      });
    }
  }
}

export const createEventBus = (config: EventBusConfig): EventBus =>
  new EventBus(config);
