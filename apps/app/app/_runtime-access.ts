import "server-only";

import {
  requireActiveCompanyAccess,
  requireActiveTenantAccess,
} from "@repo/auth/server";
import { getRequestContext } from "@repo/logger";
import type { PermissionContext } from "@repo/permissions";
import { resolvePermissionsForTenantRole } from "@repo/permissions";

export type RuntimeTenantAccess = {
  actorId: string;
  grantedPermissions: string[];
  role: string;
  operationId?: string;
  requestId?: string;
  tenantId: string;
  userEmail: string | null;
};

export type RuntimeCompanyAccess = RuntimeTenantAccess & {
  companyId: string;
  companyName: string;
  grantId: string;
};

export const resolveRuntimeTenantAccess =
  async (): Promise<RuntimeTenantAccess> => {
    const access = await requireActiveTenantAccess();
    const requestContext = getRequestContext();

    return {
      actorId: access.user.id,
      grantedPermissions: resolvePermissionsForTenantRole(
        access.membership.role
      ),
      operationId: requestContext?.operationId,
      role: access.membership.role,
      requestId: requestContext?.requestId,
      tenantId: access.membership.tenantId,
      userEmail: access.user.email ?? null,
    };
  };

export const resolveRuntimeCompanyAccess =
  async (): Promise<RuntimeCompanyAccess> => {
    const access = await requireActiveCompanyAccess();
    const requestContext = getRequestContext();

    return {
      actorId: access.user.id,
      companyId: access.company.companyId,
      companyName: access.company.companyName,
      grantedPermissions: resolvePermissionsForTenantRole(
        access.membership.role
      ),
      grantId: access.company.grantId,
      operationId: requestContext?.operationId,
      role: access.membership.role,
      requestId: requestContext?.requestId,
      tenantId: access.membership.tenantId,
      userEmail: access.user.email ?? null,
    };
  };

export const createRuntimePermissionContext = (
  access: RuntimeTenantAccess | RuntimeCompanyAccess,
  action: string,
  resource: string
): PermissionContext => ({
  action,
  actorId: access.actorId,
  companyId: "companyId" in access ? access.companyId : undefined,
  grantedPermissions: access.grantedPermissions,
  resource,
  tenantId: access.tenantId,
});
