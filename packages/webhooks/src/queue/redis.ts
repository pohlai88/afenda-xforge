import "server-only";

import type { XForgeRedisClient } from "@repo/redis";

import type { DeadLetterRecord } from "../dead-letter/contract.ts";
import type { WebhookCircuitBreaker } from "../outbound/circuit-breaker.ts";
import type { WebhookQueueMessage } from "./contract.ts";

const DEFAULT_WEBHOOK_QUEUE_PREFIX = "xforge:webhooks";
const DEFAULT_IDEMPOTENCY_TTL_SECONDS = 60 * 60;

export type WebhookRedisKeys = Readonly<{
  circuitBreakerState: (provider: string) => string;
  deadLetterRecord: (deadLetterId: string) => string;
  deadLetterSet: string;
  idempotency: (idempotencyKey: string) => string;
  queueRecord: (deliveryId: string) => string;
  queueSet: string;
}>;

export const createWebhookRedisKeys = (
  tenantId: string,
  prefix = DEFAULT_WEBHOOK_QUEUE_PREFIX
): WebhookRedisKeys => {
  if (!tenantId.trim()) {
    throw new Error("Webhook Redis keys require tenantId");
  }

  const tenantPrefix = `${prefix}:${tenantId}`;

  return {
    circuitBreakerState: (provider: string): string =>
      `${tenantPrefix}:circuit:${provider}`,
    deadLetterRecord: (deadLetterId: string): string =>
      `${tenantPrefix}:dead-letter:${deadLetterId}`,
    deadLetterSet: `${tenantPrefix}:dead-letter`,
    idempotency: (idempotencyKey: string): string =>
      `${tenantPrefix}:idempotency:${idempotencyKey}`,
    queueRecord: (deliveryId: string): string =>
      `${tenantPrefix}:queue:${deliveryId}`,
    queueSet: `${tenantPrefix}:queue`,
  };
};

const serialize = (value: unknown): string => JSON.stringify(value);

const parseWebhookQueueMessage = (value: string): WebhookQueueMessage => {
  const parsed = JSON.parse(value) as WebhookQueueMessage;

  if (!(parsed.deliveryId && parsed.provider && parsed.envelope?.tenantId)) {
    throw new Error("Invalid queued webhook message");
  }

  return parsed;
};

const parseDeadLetterRecord = (value: string): DeadLetterRecord => {
  const parsed = JSON.parse(value) as DeadLetterRecord;

  if (!(parsed.deadLetterId && parsed.provider && parsed.envelope?.tenantId)) {
    throw new Error("Invalid dead-letter record");
  }

  return parsed;
};

const parseCircuitBreakerState = (value: string): WebhookCircuitBreaker => {
  const parsed = JSON.parse(value) as WebhookCircuitBreaker;

  if (!("state" in parsed && "failureCount" in parsed)) {
    throw new Error("Invalid circuit-breaker state");
  }

  return parsed;
};

export const enqueueWebhookQueueMessage = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  message: WebhookQueueMessage
): Promise<void> => {
  await client.set(keys.queueRecord(message.deliveryId), serialize(message));
  await client.zAdd(keys.queueSet, {
    score: message.availableAt,
    value: message.deliveryId,
  });
};

export const claimReadyWebhookQueueMessage = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  now = Date.now()
): Promise<WebhookQueueMessage | null> => {
  const deliveryIds = await client.zRangeByScore(keys.queueSet, 0, now, {
    LIMIT: {
      count: 1,
      offset: 0,
    },
  });
  const deliveryId = deliveryIds[0];

  if (!deliveryId) {
    return null;
  }

  await client.zRem(keys.queueSet, deliveryId);

  const serializedMessage = await client.get(keys.queueRecord(deliveryId));

  if (!serializedMessage) {
    return null;
  }

  return parseWebhookQueueMessage(serializedMessage);
};

export const acknowledgeWebhookQueueMessage = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  deliveryId: string
): Promise<void> => {
  await client.del(keys.queueRecord(deliveryId));
};

export const storeDeadLetterRecord = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  record: DeadLetterRecord
): Promise<void> => {
  await client.set(
    keys.deadLetterRecord(record.deadLetterId),
    serialize(record)
  );
  await client.zAdd(keys.deadLetterSet, {
    score: Date.parse(record.lastFailedAt),
    value: record.deadLetterId,
  });
};

export const getDeadLetterRecord = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  deadLetterId: string
): Promise<DeadLetterRecord | null> => {
  const serializedRecord = await client.get(
    keys.deadLetterRecord(deadLetterId)
  );

  return serializedRecord ? parseDeadLetterRecord(serializedRecord) : null;
};

export const updateDeadLetterRecord = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  record: DeadLetterRecord
): Promise<void> => {
  await client.set(
    keys.deadLetterRecord(record.deadLetterId),
    serialize(record)
  );
};

export const discardDeadLetterRecord = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  deadLetterId: string
): Promise<void> => {
  await client.zRem(keys.deadLetterSet, deadLetterId);
  await client.del(keys.deadLetterRecord(deadLetterId));
};

export const claimWebhookIdempotencyKey = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  idempotencyKey: string,
  ttlSeconds = DEFAULT_IDEMPOTENCY_TTL_SECONDS
): Promise<boolean> => {
  const result = await client.set(keys.idempotency(idempotencyKey), "1", {
    EX: ttlSeconds,
    NX: true,
  });

  return result === "OK";
};

export const getCircuitBreakerState = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  provider: string
): Promise<WebhookCircuitBreaker | null> => {
  const serializedState = await client.get(keys.circuitBreakerState(provider));

  return serializedState ? parseCircuitBreakerState(serializedState) : null;
};

export const setCircuitBreakerState = async (
  client: XForgeRedisClient,
  keys: WebhookRedisKeys,
  provider: string,
  state: WebhookCircuitBreaker
): Promise<void> => {
  await client.set(keys.circuitBreakerState(provider), serialize(state));
};
