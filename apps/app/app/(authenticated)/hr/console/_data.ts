import { ForbiddenError } from "@repo/errors";
import { listActiveModuleConsoleOperatorAssignmentsForScope } from "@repo/features-system-admin-control-plane/server";
import {
  HR_CONSOLE_ID,
  lamAttendancePolicyConfigLinks,
  lamCalendarConfigLinks,
  lamEncashmentConfigLinks,
  lamLeaveConfigLinks,
  listHrConsoleDelegationGrants,
  readHrConsoleOverview,
} from "@repo/features-hr-suite-hr-console/server";
import type { HrConsoleOverview } from "@repo/features-hr-suite-hr-console";
import type { RuntimeCompanyAccess } from "../../../_runtime-access.ts";
import { resolveRuntimeCompanyAccess } from "../../../_runtime-access.ts";

type LoadState<T> =
  | { data: T; status: "ready" }
  | { message: string; status: "error" }
  | { status: "forbidden" };

const isForbiddenError = (error: unknown): boolean =>
  error instanceof ForbiddenError;

const loadOperatorAssignments = async (access: RuntimeCompanyAccess) => {
  if (!process.env.DATABASE_URL) {
    process.env.AFENDA_MODULE_CONSOLE_REPOSITORY_MODE = "file";
  }

  return listActiveModuleConsoleOperatorAssignmentsForScope(access.tenantId, {
    companyId: access.companyId,
    consoleId: HR_CONSOLE_ID,
  });
};

export const loadHrConsoleOverviewData = async (): Promise<
  LoadState<HrConsoleOverview>
> => {
  try {
    const access = await resolveRuntimeCompanyAccess();
    const operatorAssignments = await loadOperatorAssignments(access);
    const overview = await readHrConsoleOverview(
      {
        companyId: access.companyId,
        grantedPermissions: access.grantedPermissions,
        operationId: access.operationId,
        requestId: access.requestId,
        tenantId: access.tenantId,
        tenantRole: access.role,
        userId: access.actorId,
      },
      operatorAssignments
    );

    return {
      data: overview,
      status: "ready",
    };
  } catch (error) {
    if (isForbiddenError(error)) {
      return { status: "forbidden" };
    }

    return {
      message:
        error instanceof Error ? error.message : "Unable to load HR console",
      status: "error",
    };
  }
};

export const loadHrConsoleDelegationData = async () => {
  try {
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
    const grants = await listHrConsoleDelegationGrants(
      scope,
      operatorAssignments
    );

    return {
      data: {
        grants,
        overview,
      },
      status: "ready" as const,
    };
  } catch (error) {
    if (isForbiddenError(error)) {
      return { status: "forbidden" as const };
    }

    return {
      message:
        error instanceof Error
          ? error.message
          : "Unable to load HR console delegation",
      status: "error" as const,
    };
  }
};

export const loadHrConsoleLeaveHubData = async () => {
  const overviewState = await loadHrConsoleOverviewData();

  if (overviewState.status !== "ready") {
    return overviewState;
  }

  return {
    data: {
      links: lamLeaveConfigLinks,
      overview: overviewState.data,
    },
    status: "ready" as const,
  };
};

export const loadHrConsoleCalendarsHubData = async () => {
  const overviewState = await loadHrConsoleOverviewData();

  if (overviewState.status !== "ready") {
    return overviewState;
  }

  return {
    data: {
      links: lamCalendarConfigLinks,
      overview: overviewState.data,
    },
    status: "ready" as const,
  };
};

export const loadHrConsolePolicyHubData = async () => {
  const overviewState = await loadHrConsoleOverviewData();

  if (overviewState.status !== "ready") {
    return overviewState;
  }

  return {
    data: {
      links: lamAttendancePolicyConfigLinks,
      overview: overviewState.data,
    },
    status: "ready" as const,
  };
};

export const loadHrConsoleEncashmentHubData = async () => {
  const overviewState = await loadHrConsoleOverviewData();

  if (overviewState.status !== "ready") {
    return overviewState;
  }

  return {
    data: {
      links: lamEncashmentConfigLinks,
      overview: overviewState.data,
    },
    status: "ready" as const,
  };
};

export const loadHrConsoleEmployeeAccessHubData = async () => {
  const overviewState = await loadHrConsoleOverviewData();

  if (overviewState.status !== "ready") {
    return overviewState;
  }

  return {
    data: {
      overview: overviewState.data,
    },
    status: "ready" as const,
  };
};
