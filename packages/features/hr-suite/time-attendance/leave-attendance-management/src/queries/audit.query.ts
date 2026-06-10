import "server-only";

import type {
  LamAuditEvent,
  ListLamAuditTrailQuery,
} from "../contracts/index.ts";
import { listLamAuditTrailQuerySchema } from "../contracts/index.ts";
import { projectLamAuditTrailEvents } from "../projector/audit-trail.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  filterByCompany,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
  readAuditTrailContext,
} from "./shared.ts";

export async function listLamAuditTrailRecords(
  query: ListLamAuditTrailQuery = {},
  context?: LamReadContext
): Promise<readonly LamAuditEvent[]> {
  const parsed = listLamAuditTrailQuerySchema.parse(query);
  const ctx = readAuditTrailContext(context);

  if (!ctx.canRead) {
    return [];
  }

  const state = await loadLamRepository({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
  });
  const term = normalizeSearchTerm(parsed.search ?? undefined);
  const events = ctx.canViewSensitive
    ? state.auditEvents
    : state.auditEvents.map((entry) => ({
        ...entry,
        before: undefined,
        after: undefined,
      }));

  return paginate(
    projectLamAuditTrailEvents(
      filterByCompany(events, ctx.companyId ?? undefined)
        .filter((entry) =>
          parsed.entityType ? entry.entityType === parsed.entityType : true
        )
        .filter((entry) =>
          parsed.action ? entry.action === parsed.action : true
        )
        .filter((entry) =>
          parsed.actorId ? entry.actorId === parsed.actorId : true
        )
        .filter((entry) =>
          parsed.entityId ? entry.entityId === parsed.entityId : true
        )
        .filter((entry) =>
          parsed.dateFrom
            ? entry.createdAt.getTime() >= parsed.dateFrom.getTime()
            : true
        )
        .filter((entry) =>
          parsed.dateTo
            ? entry.createdAt.getTime() <= parsed.dateTo.getTime()
            : true
        )
        .filter((entry) =>
          matchesSearch(
            [entry.action, entry.summary ?? "", entry.reason ?? ""],
            term
          )
        )
    ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamAuditTrailRecordById(
  auditEventId: string,
  context?: LamReadContext
): Promise<LamAuditEvent | null> {
  const ctx = readAuditTrailContext(context);
  if (!ctx.canRead) {
    return null;
  }

  const state = await loadLamRepository({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
  });
  const event = filterByCompany(
    state.auditEvents,
    ctx.companyId ?? undefined
  ).find((entry) => entry.id === auditEventId);

  if (!event) {
    return null;
  }

  const [projected] = projectLamAuditTrailEvents([event]);
  if (!projected) {
    return null;
  }

  if (ctx.canViewSensitive) {
    return projected;
  }

  return {
    ...projected,
    before: undefined,
    after: undefined,
  };
}
