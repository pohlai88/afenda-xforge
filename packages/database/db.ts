import "server-only";

import type { AppLogger, LoggerBindings } from "@repo/logger";
import { createLogger, logQuery } from "@repo/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.ts";
import { databaseSchema } from "./schema.ts";

const connectionString: string = loadDatabaseKeys().DATABASE_URL;
const databaseLogger = createLogger("database");

export type TimedDatabaseQueryOptions = {
  logger?: AppLogger;
  metadata?: LoggerBindings;
  operation: string;
  resource: string;
};

// Supabase's shared pooler requires prepared statements to be disabled.
export const client = postgres(connectionString, { prepare: false });

export const database = drizzle(client, {
  schema: databaseSchema,
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
  timeDatabaseQuery(() => client`SELECT 1`, {
    operation: "healthcheck",
    resource: "postgres",
  });

export * from "./schema.ts";
