import { generateId } from "@repo/shared";
import type { z } from "zod";
import type { BaseEvent } from "./types.ts";

export interface EventSchema<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  description: string;
  schema?: TSchema;
  type: string;
  upMigrate?: (data: unknown) => z.infer<TSchema>;
  version: number;
}

export interface IdempotencyRecord {
  eventId: string;
  expiresAt: number;
  key: string;
  processedAt: string;
  result: "error" | "success";
}

class EventSchemaRegistry {
  private readonly schemas = new Map<string, Map<number, EventSchema>>();

  register<TSchema extends z.ZodTypeAny>(schema: EventSchema<TSchema>): void {
    if (!this.schemas.has(schema.type)) {
      this.schemas.set(schema.type, new Map());
    }

    this.schemas.get(schema.type)?.set(schema.version, schema);
  }

  getLatestVersion(type: string): number {
    const versions = this.schemas.get(type);

    if (!versions || versions.size === 0) {
      return 1;
    }

    return Math.max(...versions.keys());
  }

  getSchema(type: string, version: number): EventSchema | undefined {
    return this.schemas.get(type)?.get(version);
  }

  getLatestSchema(type: string): EventSchema | undefined {
    return this.getSchema(type, this.getLatestVersion(type));
  }

  migrate<TPayload>(
    type: string,
    data: unknown,
    fromVersion: number
  ): { data: TPayload; version: number } {
    const versions = this.schemas.get(type);

    if (!versions) {
      return { data: data as TPayload, version: fromVersion };
    }

    const latestVersion = this.getLatestVersion(type);
    let currentData = data;

    for (
      let version = fromVersion + 1;
      version <= latestVersion;
      version += 1
    ) {
      const schema = versions.get(version);

      if (schema?.upMigrate) {
        currentData = schema.upMigrate(currentData);
      }
    }

    return { data: currentData as TPayload, version: latestVersion };
  }

  validate(type: string, version: number, data: unknown): unknown {
    const schema = this.getSchema(type, version);

    if (!schema?.schema) {
      return data;
    }

    return schema.schema.parse(data);
  }

  catalog(): Array<{
    description: string;
    latestVersion: number;
    type: string;
    versions: number[];
  }> {
    return [...this.schemas.entries()]
      .map(([type, versions]) => {
        const versionNumbers = [...versions.keys()].sort(
          (left, right) => left - right
        );
        const latestVersion = Math.max(...versionNumbers);

        return {
          description: versions.get(latestVersion)?.description ?? "",
          latestVersion,
          type,
          versions: versionNumbers,
        };
      })
      .sort((left, right) => left.type.localeCompare(right.type));
  }
}

let registryInstance: EventSchemaRegistry | null = null;

export const getSchemaRegistry = (): EventSchemaRegistry => {
  registryInstance ??= new EventSchemaRegistry();
  return registryInstance;
};

export class IdempotencyStore {
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private readonly defaultTTLMs: number;

  private readonly maxSize: number;

  private readonly records = new Map<string, IdempotencyRecord>();

  constructor(options: { defaultTTLMs?: number; maxSize?: number } = {}) {
    this.defaultTTLMs = options.defaultTTLMs ?? 24 * 60 * 60 * 1000;
    this.maxSize = options.maxSize ?? 50_000;
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    this.cleanupTimer.unref?.();
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.records.entries()) {
      if (record.expiresAt <= now) {
        this.records.delete(key);
        cleaned += 1;
      }
    }

    return cleaned;
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.records.clear();
  }

  get(key: string): IdempotencyRecord | undefined {
    const record = this.records.get(key);

    if (!record) {
      return;
    }

    if (Date.now() > record.expiresAt) {
      this.records.delete(key);
      return;
    }

    return record;
  }

  isDuplicate(key: string): boolean {
    return Boolean(this.get(key));
  }

  record(
    key: string,
    eventId: string,
    result: "error" | "success",
    ttlMs?: number
  ): void {
    if (this.records.size >= this.maxSize) {
      const oldestKey = this.records.keys().next().value;

      if (oldestKey) {
        this.records.delete(oldestKey);
      }
    }

    this.records.set(key, {
      eventId,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTLMs),
      key,
      processedAt: new Date().toISOString(),
      result,
    });
  }

  get size(): number {
    return this.records.size;
  }
}

let idempotencyStoreInstance: IdempotencyStore | null = null;

export const getIdempotencyStore = (): IdempotencyStore => {
  idempotencyStoreInstance ??= new IdempotencyStore();
  return idempotencyStoreInstance;
};

export const generateCorrelationId = (): string => generateId("cor");

export const generateCausationId = (parentEventId = ""): string =>
  parentEventId;

export const createVersionedEnvelope = <TPayload>(params: {
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  payload: TPayload;
  source: string;
  tenantId: string;
  type: string;
  userId: string;
}): BaseEvent<TPayload> => {
  const registry = getSchemaRegistry();
  const version = registry.getLatestVersion(params.type);
  const validatedPayload = registry.validate(
    params.type,
    version,
    params.payload
  ) as TPayload;

  return {
    causationId: params.causationId,
    correlationId: params.correlationId ?? generateCorrelationId(),
    id: generateId("evt"),
    idempotencyKey: params.idempotencyKey,
    metadata: params.metadata,
    payload: validatedPayload,
    source: params.source,
    tenantId: params.tenantId,
    timestamp: new Date().toISOString(),
    type: params.type,
    userId: params.userId,
    version,
  };
};

export const processIncomingEvent = <TPayload>(
  event: BaseEvent<TPayload>,
  options: { checkIdempotency?: boolean } = {}
): { data: TPayload; isDuplicate: boolean; version: number } => {
  const registry = getSchemaRegistry();

  if (options.checkIdempotency && event.idempotencyKey) {
    const store = getIdempotencyStore();

    if (store.isDuplicate(event.idempotencyKey)) {
      return {
        data: event.payload,
        isDuplicate: true,
        version: event.version,
      };
    }
  }

  const latestVersion = registry.getLatestVersion(event.type);

  if (event.version < latestVersion) {
    const migrated = registry.migrate<TPayload>(
      event.type,
      event.payload,
      event.version
    );

    return {
      data: migrated.data,
      isDuplicate: false,
      version: migrated.version,
    };
  }

  return {
    data: registry.validate(
      event.type,
      event.version,
      event.payload
    ) as TPayload,
    isDuplicate: false,
    version: event.version,
  };
};
