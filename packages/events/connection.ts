import "server-only";

import { ConfigurationError } from "@repo/errors";
import { createLogger, logEvent } from "@repo/logger";
import type { JetStreamClient, JetStreamManager, NatsConnection } from "nats";
import {
  AckPolicy,
  connect,
  DeliverPolicy,
  DiscardPolicy,
  RetentionPolicy,
  StorageType,
  StringCodec,
} from "nats";
import { loadEventsKeys } from "./keys.ts";
import type { StreamDefinition } from "./types.ts";

const logger = createLogger("events.connection");

const codec = StringCodec();

let connection: NatsConnection | null = null;
let jetstream: JetStreamClient | null = null;
let jetstreamManager: JetStreamManager | null = null;
let registeredStreams: StreamDefinition[] = [];

const getRetentionPolicy = (
  retention: StreamDefinition["retention"]
): RetentionPolicy => {
  if (retention === "interest") {
    return RetentionPolicy.Interest;
  }

  if (retention === "workqueue") {
    return RetentionPolicy.Workqueue;
  }

  return RetentionPolicy.Limits;
};

const getConnectionName = (): string => {
  const { NATS_CLIENT_NAME_PREFIX } = loadEventsKeys();
  return `${NATS_CLIENT_NAME_PREFIX}-${process.env.NODE_ENV ?? "development"}`;
};

export const sc: ReturnType<typeof StringCodec> = codec;

export const getRegisteredStreams = (): StreamDefinition[] => [
  ...registeredStreams,
];

export const registerStreams = (streams: StreamDefinition[]): void => {
  registeredStreams = [...streams];
};

export const resolveStreamName = (subject: string): string | null => {
  for (const stream of registeredStreams) {
    if (
      stream.subjects.some((pattern) =>
        pattern.endsWith(">")
          ? subject.startsWith(pattern.slice(0, -1))
          : pattern === subject
      )
    ) {
      return stream.name;
    }
  }

  return null;
};

export const getConnection = async (): Promise<NatsConnection> => {
  if (connection && !connection.isClosed()) {
    return connection;
  }

  const { NATS_PING_INTERVAL_MS, NATS_RECONNECT_TIME_WAIT_MS, NATS_URL } =
    loadEventsKeys();

  if (!NATS_URL) {
    throw new ConfigurationError(
      "NATS_URL is required to create the shared events connection"
    );
  }

  connection = await connect({
    maxReconnectAttempts: -1,
    name: getConnectionName(),
    pingInterval: NATS_PING_INTERVAL_MS,
    reconnect: true,
    reconnectTimeWait: NATS_RECONNECT_TIME_WAIT_MS,
    servers: NATS_URL,
  });

  const monitorConnection = async (): Promise<void> => {
    if (!connection) {
      return;
    }

    for await (const status of connection.status()) {
      switch (status.type) {
        case "disconnect":
          logger.warn({ status }, "events connection disconnected");
          break;
        case "error":
          logger.error({ status }, "events connection error");
          break;
        case "reconnect":
          logger.info({ status }, "events connection reconnected");
          break;
        default:
          break;
      }
    }
  };

  monitorConnection().catch((error: unknown) => {
    logger.error({ error }, "events connection monitor failed");
  });

  return connection;
};

export const getJetStream = async (): Promise<JetStreamClient> => {
  jetstream ??= (await getConnection()).jetstream();
  return jetstream;
};

export const getJetStreamManager = async (): Promise<JetStreamManager> => {
  jetstreamManager ??= await (await getConnection()).jetstreamManager();
  return jetstreamManager;
};

export const ensureStreams = async (
  streams: StreamDefinition[]
): Promise<void> => {
  const { NATS_DEFAULT_STREAM_MAX_AGE_MS, NATS_DEFAULT_STREAM_MAX_BYTES } =
    loadEventsKeys();

  const manager = await getJetStreamManager();

  for (const stream of streams) {
    try {
      await manager.streams.info(stream.name);
    } catch {
      await manager.streams.add({
        discard:
          stream.discard === "new" ? DiscardPolicy.New : DiscardPolicy.Old,
        max_age:
          (stream.maxAgeMs ?? NATS_DEFAULT_STREAM_MAX_AGE_MS) * 1_000_000,
        max_bytes: stream.maxBytes ?? NATS_DEFAULT_STREAM_MAX_BYTES,
        name: stream.name,
        num_replicas: stream.replicas ?? 1,
        retention: getRetentionPolicy(stream.retention),
        storage:
          stream.storage === "memory" ? StorageType.Memory : StorageType.File,
        subjects: stream.subjects,
      });

      logEvent({
        action: "subscribe",
        logger,
        streamName: stream.name,
        subject: stream.subjects.join(","),
      });
    }
  }

  registerStreams(streams);
};

export const ensureConsumer = async (options: {
  ackWaitMs: number;
  consumerName: string;
  maxRetries: number;
  startFrom: "all" | "new";
  streamName: string;
  subject: string;
}): Promise<void> => {
  const manager = await getJetStreamManager();

  try {
    await manager.consumers.info(options.streamName, options.consumerName);
  } catch {
    await manager.consumers.add(options.streamName, {
      ack_policy: AckPolicy.Explicit,
      ack_wait: options.ackWaitMs * 1_000_000,
      deliver_policy:
        options.startFrom === "all" ? DeliverPolicy.All : DeliverPolicy.New,
      durable_name: options.consumerName,
      filter_subject: options.subject,
      max_deliver: options.maxRetries + 1,
    });
  }
};

export const closeConnection = async (): Promise<void> => {
  if (connection && !connection.isClosed()) {
    await connection.drain();
  }

  connection = null;
  jetstream = null;
  jetstreamManager = null;
};
