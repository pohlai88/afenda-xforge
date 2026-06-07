import { exportAuditEvents } from "@repo/audit";
import { requireActiveTenantAccess } from "@repo/auth/server";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import { auditExportQuerySchema } from "./contract.ts";

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

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const query = auditExportQuerySchema.parse(
    Object.fromEntries(url.searchParams.entries())
  );
  const access = await resolveAuditAccess();

  requirePermission(createAuditPermissionContext(access, "audit.export"), {
    allOf: [permissionCatalog.audit.read],
  });

  const payload = await exportAuditEvents({
    actorId: query.actorId,
    action: query.action,
    companyId: query.companyId,
    format: query.format,
    from: query.from,
    offset: 0,
    requestId: query.requestId,
    targetId: query.targetId,
    targetType: query.targetType,
    tenantId: access.tenantId,
    to: query.to,
    limit: 1000,
  });

  return new Response(payload, {
    headers: {
      "content-disposition":
        query.format === "csv"
          ? 'attachment; filename="audit-events.csv"'
          : 'attachment; filename="audit-events.json"',
      "content-type":
        query.format === "csv"
          ? "text/csv; charset=utf-8"
          : "application/json; charset=utf-8",
    },
  });
};
