import { exportAuditEvents, listAuditEvents } from "@repo/audit";
import { requireActiveTenantAccess } from "@repo/auth/server";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type { AuditEvent, AuditEventList, AuditListQuery } from "./contract.ts";
import type { AuditExportQuery } from "./export/contract.ts";

type AuditAccess = {
  actorId: string;
  grantedPermissions: string[];
  tenantId: string;
};

const resolveAuditAccess = async (): Promise<AuditAccess> => {
  const access = await requireActiveTenantAccess();

  return {
    actorId: access.user.id,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    tenantId: access.membership.tenantId,
  };
};

const createAuditPermissionContext = (
  access: AuditAccess,
  action: string
): PermissionContext => ({
  action,
  actorId: access.actorId,
  grantedPermissions: access.grantedPermissions,
  resource: "audit",
  tenantId: access.tenantId,
});

type AuditEventRecord = Awaited<
  ReturnType<typeof listAuditEvents>
>["events"][number];

const trimToNull = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildAuditSummary = (event: AuditEventRecord): string => {
  const summary = trimToNull(event.summary);
  if (summary) {
    return summary;
  }

  const targetLabel =
    trimToNull(event.targetDisplayName) ??
    `${event.targetType}:${event.targetId}`;

  return `${event.action} executed against ${targetLabel}.`;
};

const serializeAuditEvent = (event: AuditEventRecord): AuditEvent => ({
  action: event.action,
  actorId: event.actorId,
  actorRole: trimToNull(event.actorRole),
  actorType: event.actorType ?? "user",
  after: event.after ?? {},
  approvalId: trimToNull(event.approvalId),
  before: event.before ?? {},
  channel: event.channel ?? null,
  companyId: trimToNull(event.companyId),
  createdAt: event.createdAt.toISOString(),
  diff: Array.isArray(event.diff) ? event.diff : [],
  grantId: trimToNull(event.grantId),
  id: event.id,
  metadata: event.metadata ?? {},
  module: trimToNull(event.module) ?? event.action.split(".")[0] ?? null,
  outcome: event.outcome ?? "success",
  operationId: trimToNull(event.operationId) ?? event.requestId,
  occurredAt: (event.occurredAt ?? event.createdAt).toISOString(),
  policyReference: trimToNull(event.policyReference),
  reason: trimToNull(event.reason) ?? buildAuditSummary(event),
  requestId: event.requestId,
  route: trimToNull(event.route),
  subjectId: trimToNull(event.subjectId),
  subjectType: trimToNull(event.subjectType),
  summary: buildAuditSummary(event),
  surface: trimToNull(event.surface),
  targetDisplayName: trimToNull(event.targetDisplayName),
  targetId: event.targetId,
  targetType: event.targetType,
  tenantId: event.tenantId,
});

export const exportAuditEventsForTenant = async (
  query: AuditExportQuery
): Promise<string> => {
  const access = await resolveAuditAccess();

  requirePermission(createAuditPermissionContext(access, "audit.export"), {
    allOf: [permissionCatalog.audit.read],
  });

  const { format, ...filters } = query;

  return exportAuditEvents({
    tenantId: access.tenantId,
    ...filters,
    format,
    limit: 1000,
    offset: 0,
  });
};

export const listAuditEventsForTenant = async (
  query: AuditListQuery
): Promise<AuditEventList> => {
  const access = await resolveAuditAccess();

  requirePermission(createAuditPermissionContext(access, "audit.list"), {
    allOf: [permissionCatalog.audit.read],
  });

  const result = await listAuditEvents({
    tenantId: access.tenantId,
    ...query,
  });

  return {
    items: result.events.map(serializeAuditEvent),
    limit: query.limit,
    offset: query.offset,
    total: result.total,
  };
};
