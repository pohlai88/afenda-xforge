import "server-only";

import { auditEvents, database, timeDatabaseQuery } from "@repo/database";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import type {
  AuditEvent,
  AuditExportFormat,
  AuditQueryOptions,
  AuditQueryResult,
} from "./contract.ts";

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

const buildAuditWhereClause = (
  options: AuditQueryOptions
): ReturnType<typeof and> => {
  const filters = [eq(auditEvents.tenantId, options.tenantId)];

  if (options.companyId !== undefined) {
    filters.push(
      options.companyId === null
        ? isNull(auditEvents.companyId)
        : eq(auditEvents.companyId, options.companyId)
    );
  }

  if (options.actorId) {
    filters.push(eq(auditEvents.actorId, options.actorId));
  }

  if (options.action) {
    filters.push(eq(auditEvents.action, options.action));
  }

  if (options.targetType) {
    filters.push(eq(auditEvents.targetType, options.targetType));
  }

  if (options.targetId) {
    filters.push(eq(auditEvents.targetId, options.targetId));
  }

  if (options.requestId) {
    filters.push(eq(auditEvents.requestId, options.requestId));
  }

  if (options.from) {
    filters.push(gte(auditEvents.createdAt, options.from));
  }

  if (options.to) {
    filters.push(lte(auditEvents.createdAt, options.to));
  }

  return and(...filters);
};

export const listAuditEvents = async (
  options: AuditQueryOptions
): Promise<AuditQueryResult> => {
  const whereClause = buildAuditWhereClause(options);
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = options.offset ?? DEFAULT_OFFSET;

  const [events, totals] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(auditEvents)
          .where(whereClause)
          .orderBy(desc(auditEvents.createdAt))
          .limit(limit)
          .offset(offset),
      {
        operation: "select",
        resource: "audit_events",
        metadata: {
          tenantId: options.tenantId,
        },
      }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select({
            total: sql<number>`count(*)::int`,
          })
          .from(auditEvents)
          .where(whereClause),
      {
        operation: "select",
        resource: "audit_events",
        metadata: {
          tenantId: options.tenantId,
        },
      }
    ),
  ]);

  return {
    events: events as AuditEvent[],
    total: totals[0]?.total ?? 0,
  };
};

export const getAuditEventsForTarget = (
  options: Omit<AuditQueryOptions, "action" | "actorId" | "requestId"> & {
    targetType: string;
    targetId: string;
  }
): Promise<AuditQueryResult> => listAuditEvents(options);

export const getAuditEventsForRequest = (
  options: Omit<
    AuditQueryOptions,
    "action" | "actorId" | "targetType" | "targetId"
  > & {
    requestId: string;
  }
): Promise<AuditQueryResult> => listAuditEvents(options);

export const getAuditEventsForActor = (
  options: Omit<AuditQueryOptions, "targetType" | "targetId" | "requestId"> & {
    actorId: string;
  }
): Promise<AuditQueryResult> => listAuditEvents(options);

export const countAuditEventsByAction = async (
  options: Omit<
    AuditQueryOptions,
    "action" | "targetType" | "targetId" | "requestId" | "limit" | "offset"
  >
): Promise<Record<string, number>> => {
  const whereClause = buildAuditWhereClause(options);

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          action: auditEvents.action,
          total: sql<number>`count(*)::int`,
        })
        .from(auditEvents)
        .where(whereClause)
        .groupBy(auditEvents.action),
    {
      operation: "select",
      resource: "audit_events",
      metadata: {
        tenantId: options.tenantId,
      },
    }
  );

  return Object.fromEntries(rows.map((row) => [row.action, row.total]));
};

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  let text: string;

  if (typeof value === "string") {
    text = value;
  } else if (value instanceof Date) {
    text = value.toISOString();
  } else {
    text = JSON.stringify(value);
  }

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const formatAuditEventRows = (events: AuditEvent[]): Record<string, string>[] =>
  events.map((event) => ({
    action: event.action,
    actorId: event.actorId,
    after: JSON.stringify(event.after),
    before: JSON.stringify(event.before),
    companyId: event.companyId ?? "",
    createdAt: event.createdAt.toISOString(),
    grantId: event.grantId ?? "",
    id: event.id,
    metadata: event.metadata ? JSON.stringify(event.metadata) : "",
    reason: event.reason,
    requestId: event.requestId,
    targetId: event.targetId,
    targetType: event.targetType,
    tenantId: event.tenantId,
  }));

export const exportAuditEvents = async (
  options: AuditQueryOptions & {
    format: AuditExportFormat;
  }
): Promise<string> => {
  const result = await listAuditEvents(options);

  if (options.format === "json") {
    return JSON.stringify(
      {
        items: result.events,
        limit: options.limit ?? DEFAULT_LIMIT,
        offset: options.offset ?? DEFAULT_OFFSET,
        total: result.total,
      },
      null,
      2
    );
  }

  const rows = formatAuditEventRows(result.events);
  const headers = Object.keys(rows[0] ?? {});

  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");
};
