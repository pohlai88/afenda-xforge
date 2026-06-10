import "server-only";

import type { Audit7W1HEventInput } from "@repo/audit";
import type { LamAuditEvent } from "./schema.ts";

type LamAuditPersistenceScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

const toAuditRecord = (value: unknown): Record<string, unknown> => {
  if (value instanceof Date) {
    return { value: value.toISOString() };
  }

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

export const mapLamAuditEventToCanonicalInput = (
  event: LamAuditEvent,
  scope: LamAuditPersistenceScope
): Audit7W1HEventInput => ({
  tenantId: scope.tenantId?.trim() ?? "",
  companyId: event.companyId?.trim() || undefined,
  actorId: event.actorId?.trim() || "system",
  action: event.action,
  targetType: event.entityType,
  targetId: event.entityId,
  summary: event.summary?.trim() || undefined,
  reason: event.reason?.trim() || undefined,
  before: toAuditRecord(event.before),
  after: toAuditRecord(event.after),
  metadata: event.metadata,
  module: "lam",
  occurredAt: event.createdAt,
});
