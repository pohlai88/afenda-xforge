import "server-only";

import { ForbiddenError } from "@repo/errors";
import { listActiveModuleConsoleOperatorAssignmentsForScope } from "@repo/features-system-admin-control-plane/server";
import {
  HR_CONSOLE_ID,
  listHrDelegationGrantSnapshots,
  resolveModuleConsoleAccess,
  type HrConsoleScope,
} from "@repo/features-hr-suite-hr-console/server";
import type {
  LamPolicyCapability,
  LamReadContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import type { LamMutationContext } from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resolveRuntimeCompanyAccess,
  type RuntimeCompanyAccess,
} from "../../../_runtime-access.ts";

const loadOperatorAssignments = async (access: RuntimeCompanyAccess) => {
  if (!process.env.DATABASE_URL) {
    process.env.AFENDA_MODULE_CONSOLE_REPOSITORY_MODE = "file";
  }

  return listActiveModuleConsoleOperatorAssignmentsForScope(access.tenantId, {
    companyId: access.companyId,
    consoleId: HR_CONSOLE_ID,
  });
};

const createScope = (access: RuntimeCompanyAccess): HrConsoleScope => ({
  companyId: access.companyId,
  grantedPermissions: access.grantedPermissions,
  operationId: access.operationId,
  requestId: access.requestId,
  tenantId: access.tenantId,
  tenantRole: access.role,
  userId: access.actorId,
});

export const resolveHrConsoleLamConfigContext =
  async (): Promise<LamMutationContext> => {
    const access = await resolveRuntimeCompanyAccess();
    const scope = createScope(access);
    const operatorAssignments = await loadOperatorAssignments(access);
    const delegationGrants = await listHrDelegationGrantSnapshots(
      scope.tenantId,
      scope.companyId
    );
    const resolved = resolveModuleConsoleAccess({
      actorId: scope.userId,
      companyId: scope.companyId,
      consoleId: HR_CONSOLE_ID,
      delegationGrants,
      operatorAssignments,
      tenantRole: scope.tenantRole,
      tenantRoleCaps: scope.grantedPermissions,
    });

    if (
      !resolved.grantedCapabilities.some((capability) =>
        capability.startsWith("hr.lam.")
      )
    ) {
      throw new ForbiddenError("HR console LAM access denied");
    }

    const lamCapabilities = resolved.grantedCapabilities.filter(
      (capability): capability is LamPolicyCapability =>
        capability.startsWith("hr.lam.")
    );

    return {
      actorId: scope.userId,
      canViewSensitive: false,
      canWrite: false,
      companyId: scope.companyId,
      grantedCapabilities: lamCapabilities,
      tenantId: scope.tenantId,
    };
  };

export const resolveHrConsoleLamReadContext =
  async (): Promise<LamReadContext> => {
    const context = await resolveHrConsoleLamConfigContext();

    return {
      canRead: (context.grantedCapabilities?.length ?? 0) > 0,
      canViewSensitive: context.canViewSensitive ?? false,
      companyId: context.companyId,
      grantedCapabilities: context.grantedCapabilities,
      tenantId: context.tenantId,
    };
  };
