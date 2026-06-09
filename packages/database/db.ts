import "server-only";

import type { AppLogger, LoggerBindings } from "@repo/logger";
import { createLogger, logQuery } from "@repo/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.ts";
import { databaseSchema } from "./schema.ts";

const databaseLogger = createLogger("database");

type DatabaseClient = ReturnType<typeof postgres>;

const resolveDatabaseUrl = (): string => loadDatabaseKeys().DATABASE_URL;

const createDatabaseClient = (): DatabaseClient =>
  postgres(resolveDatabaseUrl(), { prepare: false });

let cachedClient: DatabaseClient | null = null;

const getDatabaseClient = (): DatabaseClient =>
  (cachedClient ??= createDatabaseClient());

const createDatabaseInstance = () =>
  drizzle(getDatabaseClient(), {
    schema: databaseSchema,
  });

type DatabaseInstance = ReturnType<typeof createDatabaseInstance>;

let cachedDatabase: DatabaseInstance | null = null;

export const getDatabase = (): DatabaseInstance =>
  (cachedDatabase ??= createDatabaseInstance());

const bindProxyValue = <TValue>(owner: object, value: TValue): TValue => {
  if (typeof value === "function") {
    return value.bind(owner) as TValue;
  }

  return value;
};

const clientProxyTarget = (() => undefined) as unknown as DatabaseClient;

export type TimedDatabaseQueryOptions = {
  logger?: AppLogger;
  metadata?: LoggerBindings;
  operation: string;
  resource: string;
};

// Supabase's shared pooler requires prepared statements to be disabled.
export const client = new Proxy(clientProxyTarget, {
  apply(_target, thisArg, args) {
    return Reflect.apply(
      getDatabaseClient() as unknown as (...input: unknown[]) => unknown,
      thisArg,
      args
    );
  },
  get(_target, property) {
    const resolvedClient = getDatabaseClient() as unknown as Record<
      PropertyKey,
      unknown
    >;

    return bindProxyValue(
      resolvedClient,
      Reflect.get(resolvedClient, property)
    );
  },
});

export const database = new Proxy({} as DatabaseInstance, {
  get(_target, property) {
    const resolvedDatabase = getDatabase();

    return bindProxyValue(
      resolvedDatabase,
      Reflect.get(resolvedDatabase, property)
    );
  },
});

export const timeDatabaseQuery = async <T>(
  run: () => Promise<T>,
  options: TimedDatabaseQueryOptions
): Promise<T> => {
  const logger = options.logger ?? databaseLogger;
  const startedAt = Date.now();

  try {
    const result = await run();

    logQuery({
      durationMs: Date.now() - startedAt,
      logger,
      operation: options.operation,
      resource: options.resource,
      ...options.metadata,
    });

    return result;
  } catch (error) {
    logger.error(
      {
        durationMs: Date.now() - startedAt,
        error,
        operation: options.operation,
        resource: options.resource,
        ...options.metadata,
      },
      "database query failed"
    );

    throw error;
  }
};

export const pingDatabase = (): Promise<unknown> =>
  timeDatabaseQuery(() => getDatabaseClient()`SELECT 1`, {
    operation: "healthcheck",
    resource: "postgres",
  });

export * from "./schema.ts";
