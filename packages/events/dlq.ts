import type { BaseEvent, RetryPolicy } from "./types.ts";

export interface DLQEntry<TPayload = unknown> {
  consumerName: string;
  error: {
    code?: string;
    message: string;
    stack?: string;
  };
  firstFailedAt: string;
  id: string;
  lastFailedAt: string;
  maxRetries: number;
  metadata?: Record<string, unknown>;
  originalEvent: BaseEvent<TPayload>;
  retryCount: number;
  status: "discarded" | "pending" | "replayed" | "retrying";
  subject: string;
}

export interface DLQStats {
  byConsumer: Record<string, number>;
  discarded: number;
  newestEntry?: string;
  oldestEntry?: string;
  pending: number;
  replayed: number;
  retrying: number;
  topErrors: Array<{ count: number; message: string }>;
  total: number;
}

export const RETRY_POLICIES: Record<string, RetryPolicy> = {
  critical: {
    backoffMultiplier: 3,
    baseDelayMs: 500,
    maxDelayMs: 300_000,
    maxRetries: 10,
  },
  default: {
    backoffMultiplier: 2,
    baseDelayMs: 1000,
    maxDelayMs: 60_000,
    maxRetries: 5,
  },
  fireAndForget: {
    backoffMultiplier: 1,
    baseDelayMs: 5000,
    maxDelayMs: 5000,
    maxRetries: 1,
  },
  idempotent: {
    backoffMultiplier: 2,
    baseDelayMs: 2000,
    maxDelayMs: 30_000,
    maxRetries: 3,
  },
};

export const calculateRetryDelay = (
  attempt: number,
  policy: RetryPolicy
): number => {
  const baseDelay =
    policy.baseDelayMs * policy.backoffMultiplier ** Math.max(attempt - 1, 0);
  const cappedDelay = Math.min(baseDelay, policy.maxDelayMs);
  const jitter = cappedDelay * 0.2 * (Math.random() * 2 - 1);

  return Math.round(cappedDelay + jitter);
};

export const shouldRetry = (retryCount: number, policy: RetryPolicy): boolean =>
  retryCount < policy.maxRetries;

export class DeadLetterQueue {
  private readonly entries = new Map<string, DLQEntry>();

  private readonly maxSize: number;

  constructor(maxSize = 10_000) {
    this.maxSize = maxSize;
  }

  add<TPayload>(params: {
    consumerName: string;
    error: Error;
    event: BaseEvent<TPayload>;
    maxRetries: number;
    metadata?: Record<string, unknown>;
    retryCount: number;
    subject: string;
  }): DLQEntry<TPayload> {
    const now = new Date().toISOString();
    const existing = this.entries.get(params.event.id);

    if (existing) {
      existing.error = {
        code: (params.error as { code?: string }).code,
        message: params.error.message,
        stack: params.error.stack,
      };
      existing.lastFailedAt = now;
      existing.retryCount = params.retryCount;
      return existing as DLQEntry<TPayload>;
    }

    if (this.entries.size >= this.maxSize) {
      const oldestKey = this.entries.keys().next().value;

      if (oldestKey) {
        this.entries.delete(oldestKey);
      }
    }

    const entry: DLQEntry<TPayload> = {
      consumerName: params.consumerName,
      error: {
        code: (params.error as { code?: string }).code,
        message: params.error.message,
        stack: params.error.stack,
      },
      firstFailedAt: now,
      id: `dlq_${params.event.id}`,
      lastFailedAt: now,
      maxRetries: params.maxRetries,
      metadata: params.metadata,
      originalEvent: params.event,
      retryCount: params.retryCount,
      status: "pending",
      subject: params.subject,
    };

    this.entries.set(params.event.id, entry);

    return entry;
  }

  discard(eventId: string): void {
    const entry = this.entries.get(eventId);

    if (entry) {
      entry.status = "discarded";
    }
  }

  get(eventId: string): DLQEntry | undefined {
    return this.entries.get(eventId);
  }

  getStats(): DLQStats {
    const entries = [...this.entries.values()];
    const byConsumer: Record<string, number> = {};
    const topErrorsMap = new Map<string, number>();
    let pending = 0;
    let replayed = 0;
    let retrying = 0;
    let discarded = 0;

    for (const entry of entries) {
      byConsumer[entry.consumerName] =
        (byConsumer[entry.consumerName] ?? 0) + 1;
      topErrorsMap.set(
        entry.error.message,
        (topErrorsMap.get(entry.error.message) ?? 0) + 1
      );

      switch (entry.status) {
        case "discarded":
          discarded += 1;
          break;
        case "pending":
          pending += 1;
          break;
        case "replayed":
          replayed += 1;
          break;
        case "retrying":
          retrying += 1;
          break;
        default:
          break;
      }
    }

    const sorted = [...entries].sort(
      (left, right) =>
        new Date(left.firstFailedAt).getTime() -
        new Date(right.firstFailedAt).getTime()
    );

    return {
      byConsumer,
      discarded,
      newestEntry: sorted.at(-1)?.firstFailedAt,
      oldestEntry: sorted[0]?.firstFailedAt,
      pending,
      replayed,
      retrying,
      topErrors: [...topErrorsMap.entries()]
        .map(([message, count]) => ({ count, message }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 10),
      total: entries.length,
    };
  }

  list(
    options: {
      consumerName?: string;
      limit?: number;
      offset?: number;
      status?: DLQEntry["status"];
      subject?: string;
    } = {}
  ): { entries: DLQEntry[]; total: number } {
    let entries = [...this.entries.values()];

    if (options.status) {
      entries = entries.filter((entry) => entry.status === options.status);
    }

    if (options.consumerName) {
      entries = entries.filter(
        (entry) => entry.consumerName === options.consumerName
      );
    }

    if (options.subject) {
      const subject = options.subject;
      entries = entries.filter((entry) => entry.subject.startsWith(subject));
    }

    entries.sort(
      (left, right) =>
        new Date(right.lastFailedAt).getTime() -
        new Date(left.lastFailedAt).getTime()
    );

    const offset = options.offset ?? 0;
    const limit = options.limit ?? 50;

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
    };
  }

  markForReplay(eventId: string): DLQEntry | undefined {
    const entry = this.entries.get(eventId);

    if (entry) {
      entry.status = "retrying";
    }

    return entry;
  }

  markReplayed(eventId: string): void {
    const entry = this.entries.get(eventId);

    if (entry) {
      entry.status = "replayed";
    }
  }

  purge(statuses: DLQEntry["status"][] = ["discarded", "replayed"]): number {
    let count = 0;

    for (const [key, entry] of this.entries.entries()) {
      if (statuses.includes(entry.status)) {
        this.entries.delete(key);
        count += 1;
      }
    }

    return count;
  }
}

let dlqInstance: DeadLetterQueue | null = null;

export const getDLQ = (): DeadLetterQueue => {
  dlqInstance ??= new DeadLetterQueue();
  return dlqInstance;
};
