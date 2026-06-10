import "server-only";

import { requireActiveCompanyAccess } from "@repo/auth/server";
import { getRequestContext } from "@repo/logger";
import { listActiveModuleConsoleOperatorAssignmentsForScope } from "@repo/features-system-admin-control-plane/server";
import {
  HR_CONSOLE_ID,
  listHrDelegationGrantSnapshots,
  resolveModuleConsoleAccess,
  type HrConsoleScope,
} from "@repo/features-hr-suite-hr-console/server";
import { resolvePermissionsForTenantRole } from "@repo/permissions";
import { ensureModuleConsoleRegistry } from "./module-console-registry.ts";

export const createHrConsoleScope = async (): Promise<HrConsoleScope> => {
  const access = await requireActiveCompanyAccess();
  const requestContext = getRequestContext();

  return {
    companyId: access.company.companyId,
    grantedPermissions: resolvePermissionsForTenantRole(
      access.membership.role
    ),
    operationId: requestContext?.operationId,
    requestId: requestContext?.requestId,
    tenantId: access.membership.tenantId,
    tenantRole: access.membership.role,
    userId: access.user.id,
  };
};

export const loadHrConsoleOperatorAssignments = async (
  scope: HrConsoleScope
) => {
  ensureModuleConsoleRegistry();

  return listActiveModuleConsoleOperatorAssignmentsForScope(scope.tenantId, {
    companyId: scope.companyId,
    consoleId: HR_CONSOLE_ID,
  });
};

export const resolveHrConsoleAccessForRequest = async () => {
  const scope = await createHrConsoleScope();
  const operatorAssignments = await loadHrConsoleOperatorAssignments(scope);
  const delegationGrants = await listHrDelegationGrantSnapshots(
    scope.tenantId,
    scope.companyId
  );

  const access = resolveModuleConsoleAccess({
    actorId: scope.userId,
    companyId: scope.companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants,
    operatorAssignments,
    tenantRole: scope.tenantRole,
    tenantRoleCaps: scope.grantedPermissions,
  });

  return {
    access,
    operatorAssignments,
    scope: {
      ...scope,
      grantedPermissions: [...access.grantedCapabilities],
    },
  };
};

export const createLamContextFromHrConsoleAccess = (
  scope: HrConsoleScope,
  access: Awaited<
    ReturnType<typeof resolveHrConsoleAccessForRequest>
  >["access"]
) => ({
  actorId: scope.userId,
  canRead: access.grantedCapabilities.some((capability) =>
    capability.startsWith("hr.lam.")
  ),
  canViewSensitive: false,
  canWrite: access.canDomainWrite,
  companyId: scope.companyId,
  grantedCapabilities: access.grantedCapabilities.filter((capability) =>
    capability.startsWith("hr.lam.")
  ),
  tenantId: scope.tenantId,
});
