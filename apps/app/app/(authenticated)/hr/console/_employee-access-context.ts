import "server-only";

import { ForbiddenError } from "@repo/errors";
import type { EmployeeUserAccountLinkContext } from "@repo/features-employee-management-employee-records-management/server";
import { listActiveModuleConsoleOperatorAssignmentsForScope } from "@repo/features-system-admin-control-plane/server";
import {
  HR_CONSOLE_ID,
  readHrConsoleOverview,
} from "@repo/features-hr-suite-hr-console/server";
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

export const resolveHrConsoleEmployeeAccessContext =
  async (): Promise<EmployeeUserAccountLinkContext> => {
    const access = await resolveRuntimeCompanyAccess();
    const operatorAssignments = await loadOperatorAssignments(access);
    const scope = {
      companyId: access.companyId,
      grantedPermissions: access.grantedPermissions,
      operationId: access.operationId,
      requestId: access.requestId,
      tenantId: access.tenantId,
      tenantRole: access.role,
      userId: access.actorId,
    };
    const overview = await readHrConsoleOverview(scope, operatorAssignments);

    if (
      !overview.grantedCapabilities.some((capability) =>
        capability.startsWith("hr.console.")
      )
    ) {
      throw new ForbiddenError("HR console employee access denied");
    }

    return {
      canRead: true,
      canWrite: overview.canDomainWrite,
      companyId: access.companyId,
      tenantId: access.tenantId,
    };
  };

export const resolveHrConsoleEmployeeAccessWriteContext =
  async (): Promise<EmployeeUserAccountLinkContext> => {
    const context = await resolveHrConsoleEmployeeAccessContext();

    if (!context.canWrite) {
      throw new ForbiddenError(
        "Employee access binding is read-only for your governance mode"
      );
    }

    return context;
  };
