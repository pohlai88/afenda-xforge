import { requireActiveTenantAccess } from "@repo/auth/server";
import type { SystemAdminScope } from "@repo/features-system-admin-control-plane/schema";
import { resolvePermissionsForTenantRole } from "@repo/permissions";
import { resolveOptionalCompanyId } from "../../../_runtime-access.ts";

export const requireSystemAdminScope = async (
  request: Request
): Promise<SystemAdminScope> => {
  const access = await requireActiveTenantAccess();
  const companyId = await resolveOptionalCompanyId();

  return {
    companyId,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    requestId: request.headers.get("x-request-id")?.trim() || undefined,
    tenantId: access.membership.tenantId,
    userId: access.user.id,
  };
};
