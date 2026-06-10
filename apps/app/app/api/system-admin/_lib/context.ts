import { requireActiveTenantAccess } from "@repo/auth/server";
import type { SystemAdminScope } from "@repo/features-system-admin-control-plane/schema";
import { resolvePermissionsForTenantRole } from "@repo/permissions";

export const requireSystemAdminScope = async (
  request: Request
): Promise<SystemAdminScope> => {
  const access = await requireActiveTenantAccess();

  return {
    companyId: request.headers.get("x-company-id")?.trim() || undefined,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    requestId: request.headers.get("x-request-id")?.trim() || undefined,
    tenantId: access.membership.tenantId,
    userId: access.user.id,
  };
};
