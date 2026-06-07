import "server-only";

import type { AppLogger, LoggerBindings } from "@repo/logger";
import { createLogger, logQuery } from "@repo/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.ts";
import {
  auditEvents,
  auditEventsRelations,
  companies,
  companiesRelations,
  companyGrants,
  companyGrantsRelations,
  customers,
  customersRelations,
  notificationInbox,
  notificationInboxRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
  xforge,
} from "./schema.ts";

const connectionString: string = loadDatabaseKeys().DATABASE_URL;
const schema: typeof import("./schema.ts") = {
  auditEvents,
  auditEventsRelations,
  xforge,
  companyGrants,
  companyGrantsRelations,
  customers,
  customersRelations,
  notificationInbox,
  notificationInboxRelations,
  companies,
  companiesRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
};
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
  schema,
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
