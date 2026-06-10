import "server-only";

import { requireActiveTenantAccess } from "@repo/auth/server";
import { getRequestContext } from "@repo/logger";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";

export const requireSystemAdminModuleConsoleAccess = async (): Promise<{
  grantedPermissions: string[];
  role: string;
  tenantId: string;
  userId: string;
  operationId?: string;
  requestId?: string;
}> => {
  const access = await requireActiveTenantAccess();
  const grantedPermissions = resolvePermissionsForTenantRole(
    access.membership.role
  );
  const requestContext = getRequestContext();

  requirePermission(
    {
      action: "system-admin.module-consoles.read",
      actorId: access.user.id,
      grantedPermissions,
      resource: "system-admin.module-consoles",
      tenantId: access.membership.tenantId,
    },
    {
      allOf: [permissionCatalog.systemAdmin.moduleConsolesRead],
    }
  );

  return {
    grantedPermissions,
    operationId: requestContext?.operationId,
    requestId: requestContext?.requestId,
    role: access.membership.role,
    tenantId: access.membership.tenantId,
    userId: access.user.id,
  };
};
