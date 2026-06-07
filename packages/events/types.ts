import type { z } from "zod";

export type EventSource = string;

export type EventMetadata = Record<string, unknown>;

export interface BaseEvent<TPayload = unknown> {
  causationId?: string;
  correlationId: string;
  id: string;
  idempotencyKey?: string;
  metadata?: EventMetadata;
  payload: TPayload;
  source: EventSource;
  tenantId: string;
  timestamp: string;
  type: string;
  userId: string;
  version: number;
}

export type EventHandler<TPayload = unknown> = (
  event: BaseEvent<TPayload>
) => Promise<void>;

export type TypedEventHandler<TSchema extends z.ZodType> = (
  event: BaseEvent<z.infer<TSchema>>
) => Promise<void>;

export interface StreamDefinition {
  discard?: "new" | "old";
  maxAgeMs?: number;
  maxBytes?: number;
  metadata?: EventMetadata;
  name: string;
  replicas?: number;
  retention?: "interest" | "limits" | "workqueue";
  storage?: "file" | "memory";
  subjects: string[];
}

export interface EventBusConfig {
  connectionOptions?: Record<string, unknown>;
  module: EventSource;
  natsUrl?: string;
  retryPolicy?: RetryPolicy;
}

export interface PublishOptions {
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: EventMetadata;
}

export interface SubscriptionOptions {
  ackWaitMs?: number;
  consumerName?: string;
  maxRetries?: number;
  onError?: (error: Error, event: BaseEvent) => Promise<void>;
  startFrom?: "all" | "new";
  streamName?: string;
  tenantId?: string;
}

export interface RetryPolicy {
  backoffMultiplier: number;
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
}

export interface SubscriptionHandle {
  unsubscribe: () => Promise<void>;
}
