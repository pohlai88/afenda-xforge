import "server-only";

import { auditEvents, database, timeDatabaseQuery } from "@repo/database";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import type {
  AuditEvent,
  AuditExportFormat,
  AuditQueryOptions,
  AuditQueryResult,
} from "./contract.ts";

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

type AuditColumn = Parameters<typeof eq>[0];

const trimToNull = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildAuditTargetLabel = (event: AuditEvent): string =>
  trimToNull(event.targetDisplayName) ??
  `${event.targetType}:${event.targetId}`;

const buildAuditSummary = (event: AuditEvent): string =>
  trimToNull(event.summary) ??
  `${event.action} executed against ${buildAuditTargetLabel(event)}.`;

const appendStringFilter = (
  filters: SQL[],
  column: AuditColumn,
  value: string | undefined
): void => {
  if (value) {
    filters.push(eq(column, value));
  }
};

const appendNullableStringFilter = (
  filters: SQL[],
  column: AuditColumn,
  value: string | null | undefined
): void => {
  if (value === undefined) {
    return;
  }

  filters.push(value === null ? isNull(column) : eq(column, value));
};

const appendDateFilter = (
  filters: SQL[],
  column: AuditColumn,
  value: Date | undefined,
  direction: "from" | "to"
): void => {
  if (!value) {
    return;
  }

  filters.push(direction === "from" ? gte(column, value) : lte(column, value));
};

const hydrateAuditEvent = (event: AuditEvent): AuditEvent => ({
  ...event,
  actorRole: trimToNull(event.actorRole),
  actorType: event.actorType ?? "user",
  approvalId: trimToNull(event.approvalId),
  channel: event.channel ?? null,
  companyId: event.companyId ?? null,
  diff: Array.isArray(event.diff) ? event.diff : [],
  grantId: event.grantId ?? null,
  metadata: event.metadata ?? {},
  module: trimToNull(event.module) ?? event.action.split(".")[0] ?? null,
  outcome: event.outcome ?? "success",
  operationId: trimToNull(event.operationId) ?? event.requestId,
  occurredAt: event.occurredAt ?? event.createdAt,
  policyReference: trimToNull(event.policyReference),
  reason: trimToNull(event.reason) ?? buildAuditSummary(event),
  route: trimToNull(event.route),
  subjectId: trimToNull(event.subjectId),
  subjectType: trimToNull(event.subjectType),
  summary: buildAuditSummary(event),
  surface: trimToNull(event.surface),
  targetDisplayName: trimToNull(event.targetDisplayName),
  before: event.before ?? {},
  after: event.after ?? {},
});

const buildAuditWhereClause = (
  options: AuditQueryOptions
): ReturnType<typeof and> => {
  const filters = [eq(auditEvents.tenantId, options.tenantId)];
  appendNullableStringFilter(filters, auditEvents.companyId, options.companyId);
  appendStringFilter(filters, auditEvents.actorId, options.actorId);
  appendStringFilter(filters, auditEvents.actorType, options.actorType);
  appendStringFilter(filters, auditEvents.actorRole, options.actorRole);
  appendStringFilter(filters, auditEvents.module, options.module);
  appendStringFilter(filters, auditEvents.surface, options.surface);
  appendStringFilter(filters, auditEvents.route, options.route);
  appendStringFilter(filters, auditEvents.subjectType, options.subjectType);
  appendStringFilter(filters, auditEvents.subjectId, options.subjectId);
  appendStringFilter(filters, auditEvents.action, options.action);
  appendStringFilter(filters, auditEvents.summary, options.summary);
  appendStringFilter(filters, auditEvents.outcome, options.outcome);
  appendStringFilter(filters, auditEvents.targetType, options.targetType);
  appendStringFilter(filters, auditEvents.targetId, options.targetId);
  appendStringFilter(
    filters,
    auditEvents.targetDisplayName,
    options.targetDisplayName
  );
  appendStringFilter(filters, auditEvents.channel, options.channel);
  appendStringFilter(filters, auditEvents.requestId, options.requestId);
  appendStringFilter(filters, auditEvents.operationId, options.operationId);
  appendDateFilter(filters, auditEvents.occurredAt, options.from, "from");
  appendDateFilter(filters, auditEvents.occurredAt, options.to, "to");

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
          .orderBy(
            desc(auditEvents.occurredAt),
            desc(auditEvents.createdAt),
            desc(auditEvents.id)
          )
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
    events: (events as AuditEvent[]).map(hydrateAuditEvent),
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

const AUDIT_EXPORT_HEADERS = [
  "action",
  "actorId",
  "actorRole",
  "actorType",
  "after",
  "approvalId",
  "before",
  "channel",
  "companyId",
  "createdAt",
  "diff",
  "grantId",
  "id",
  "metadata",
  "module",
  "outcome",
  "operationId",
  "occurredAt",
  "policyReference",
  "reason",
  "requestId",
  "route",
  "subjectId",
  "subjectType",
  "summary",
  "surface",
  "targetDisplayName",
  "targetId",
  "targetType",
  "tenantId",
] as const;

const formatAuditEventRows = (events: AuditEvent[]): Record<string, string>[] =>
  events.map((event) => ({
    action: event.action,
    actorId: event.actorId,
    actorRole: event.actorRole ?? "",
    actorType: event.actorType,
    after: JSON.stringify(event.after),
    approvalId: event.approvalId ?? "",
    before: JSON.stringify(event.before),
    channel: event.channel ?? "",
    companyId: event.companyId ?? "",
    createdAt: event.createdAt.toISOString(),
    diff: JSON.stringify(event.diff),
    grantId: event.grantId ?? "",
    id: event.id,
    metadata: event.metadata ? JSON.stringify(event.metadata) : "",
    module: event.module ?? "",
    outcome: event.outcome,
    operationId: event.operationId ?? "",
    occurredAt: event.occurredAt.toISOString(),
    policyReference: event.policyReference ?? "",
    reason: event.reason,
    requestId: event.requestId,
    route: event.route ?? "",
    subjectId: event.subjectId ?? "",
    subjectType: event.subjectType ?? "",
    summary: event.summary,
    surface: event.surface ?? "",
    targetDisplayName: event.targetDisplayName ?? "",
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
  const headers = AUDIT_EXPORT_HEADERS;

  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");
};
