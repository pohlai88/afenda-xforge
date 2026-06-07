import { listAuditEvents } from "@repo/audit";
import { requireActiveTenantAccess } from "@repo/auth/server";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type { AuditEvent, AuditEventList, AuditListQuery } from "./contract.ts";

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

const serializeAuditEvent = (event: AuditEventRecord): AuditEvent => ({
  action: event.action,
  actorId: event.actorId,
  after: event.after,
  before: event.before,
  companyId: event.companyId ?? null,
  createdAt: event.createdAt.toISOString(),
  grantId: event.grantId ?? null,
  id: event.id,
  metadata: event.metadata ?? null,
  reason: event.reason,
  requestId: event.requestId,
  targetId: event.targetId,
  targetType: event.targetType,
  tenantId: event.tenantId,
});

export const listAuditEventsForTenant = async (
  query: AuditListQuery
): Promise<AuditEventList> => {
  const access = await resolveAuditAccess();

  requirePermission(createAuditPermissionContext(access, "audit.list"), {
    allOf: [permissionCatalog.audit.read],
  });

  const result = await listAuditEvents({
    actorId: query.actorId,
    action: query.action,
    companyId: query.companyId,
    from: query.from,
    limit: query.limit,
    offset: query.offset,
    requestId: query.requestId,
    targetId: query.targetId,
    targetType: query.targetType,
    tenantId: access.tenantId,
    to: query.to,
  });

  return {
    items: result.events.map(serializeAuditEvent),
    limit: query.limit,
    offset: query.offset,
    total: result.total,
  };
};
