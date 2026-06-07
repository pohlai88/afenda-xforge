import { createEventBus } from "./event-bus.ts";
import type { BaseEvent, PublishOptions } from "./types.ts";

export const publish = <TPayload>(
  subject: string,
  payload: TPayload,
  context: {
    source?: string;
    tenantId: string;
    userId: string;
  } & PublishOptions
): Promise<BaseEvent<TPayload>> => {
  const bus = createEventBus({
    module: context.source ?? "unknown",
  });

  return bus.publish(subject, payload, {
    causationId: context.causationId,
    correlationId: context.correlationId,
    idempotencyKey: context.idempotencyKey,
    metadata: context.metadata,
    tenantId: context.tenantId,
    userId: context.userId,
  });
};

export const publishBatch = <TPayload>(
  events: Array<{ payload: TPayload; subject: string }>,
  context: {
    source?: string;
    tenantId: string;
    userId: string;
  } & PublishOptions
): Promise<BaseEvent<TPayload>[]> => {
  const bus = createEventBus({
    module: context.source ?? "unknown",
  });

  return bus.publishBatch(
    events.map((event) => ({
      eventType: event.subject,
      payload: event.payload,
    })),
    {
      causationId: context.causationId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      metadata: context.metadata,
      tenantId: context.tenantId,
      userId: context.userId,
    }
  );
};
