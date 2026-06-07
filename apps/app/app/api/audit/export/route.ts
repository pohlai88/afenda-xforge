import { exportAuditEvents } from "@repo/audit";
import { requireActiveTenantAccess } from "@repo/auth/server";
import { createLogger, withRequestLogging } from "@repo/logger";
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

const auditExportLogger = createLogger("app.api.audit.export");

const auditExportRoute = withRequestLogging(
  async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const query = auditExportQuerySchema.parse(
      Object.fromEntries(url.searchParams.entries())
    );
    const access = await resolveAuditAccess();

    requirePermission(createAuditPermissionContext(access, "audit.export"), {
      allOf: [permissionCatalog.audit.read],
    });

    const { format, ...filters } = query;
    const payload = await exportAuditEvents({
      tenantId: access.tenantId,
      ...filters,
      format,
      limit: 1000,
      offset: 0,
    });

    return new Response(payload, {
      headers: {
        "content-disposition":
          format === "csv"
            ? 'attachment; filename="audit-events.csv"'
            : 'attachment; filename="audit-events.json"',
        "content-type":
          format === "csv"
            ? "text/csv; charset=utf-8"
            : "application/json; charset=utf-8",
      },
    });
  },
  {
    logger: auditExportLogger,
    metricsApp: "app",
  }
);

export const GET: typeof auditExportRoute = auditExportRoute;
