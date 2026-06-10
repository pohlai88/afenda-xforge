import type {
  LamLeaveApplication,
  LamPolicyCapability,
  LamReadContext,
  LamWriteContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import { getLamLeaveApplicationById } from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  createLamOperationalReadContext,
  createLamOperationalWriteContext,
  mergeLamOperationalHeaders,
  type LamOperationalWriteContext,
} from "../../_lib/lam-governed-context.ts";
import { enrichLamApprovalWriteContext } from "../../_lib/lam-approval-orchestration.ts";

export {
  createLamOperationalReadContext,
  createLamOperationalWriteContext,
} from "../../_lib/lam-governed-context.ts";

export const createLamReadContext = (
  request: Request
): Promise<LamReadContext> => createLamOperationalReadContext(request);

export const createLamWriteContext = (
  request: Request
): Promise<LamOperationalWriteContext> =>
  createLamOperationalWriteContext(request);

export const createLamApprovalContext = async (
  request: Request
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const writeContext = await createLamOperationalWriteContext(request);

  return {
    ...writeContext,
    grantedCapabilities: [
      ...new Set([
        ...(writeContext.grantedCapabilities ?? []),
        "hr.lam.leave-applications.approve" as LamPolicyCapability,
      ]),
    ],
  };
};

export const createLamLeaveApplicationApprovalContext = async (
  request: Request,
  application: Pick<
    LamLeaveApplication,
    | "approvalRouteId"
    | "companyId"
    | "currentStepOrder"
    | "employeeId"
    | "status"
  >
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const approvalContext = await createLamApprovalContext(request);

  return enrichLamApprovalWriteContext(request, approvalContext, application);
};

export const createLamLeaveApplicationApprovalContextById = async (
  request: Request,
  applicationId: string
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const readContext = await createLamNotificationReadContext(request);
  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );

  if (!application) {
    return createLamApprovalContext(request);
  }

  return createLamLeaveApplicationApprovalContext(request, application);
};

export const bindLamEmployeeSubmitBody = <
  T extends { employeeId?: string | null },
>(
  request: Request,
  body: T
): T => {
  const scopedEmployeeId =
    request.headers.get("x-lam-scoped-employee-id")?.trim() || undefined;
  if (!scopedEmployeeId) {
    return body;
  }

  return {
    ...body,
    employeeId: scopedEmployeeId,
  };
};

export const createLamEmployeeSubmitReadContext = async (
  request: Request
): Promise<LamReadContext> => {
  const writeContext = await createLamOperationalWriteContext(request);
  const readContext = await createLamOperationalReadContext(request);

  return {
    ...readContext,
    canRead:
      readContext.canRead ||
      Boolean(
        writeContext.grantedCapabilities?.includes(
          "hr.lam.leave-applications.read"
        )
      ),
    grantedCapabilities:
      readContext.grantedCapabilities ?? writeContext.grantedCapabilities,
    scopedEmployeeId:
      readContext.scopedEmployeeId ?? writeContext.scopedEmployeeId,
    teamEmployeeIds:
      readContext.teamEmployeeIds ?? writeContext.teamEmployeeIds,
    companyId: readContext.companyId ?? writeContext.companyId,
    tenantId: readContext.tenantId ?? writeContext.tenantId,
  };
};

export const createLamBalanceWriteContext = async (
  request: Request
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const writeContext = await createLamOperationalWriteContext(request);
  const grantedCapabilities = writeContext.grantedCapabilities ?? [];

  if (
    writeContext.canWrite &&
    !grantedCapabilities.includes("hr.lam.leave-balances.write")
  ) {
    return {
      ...writeContext,
      grantedCapabilities: [
        ...grantedCapabilities,
        "hr.lam.leave-balances.write" as LamPolicyCapability,
      ],
    };
  }

  return writeContext;
};

export const createLamPayrollReadContext = (
  request: Request
): Promise<LamReadContext> => createLamOperationalReadContext(request);

export const createLamPayrollExportContext = (
  request: Request
): Promise<LamOperationalWriteContext> =>
  createLamOperationalWriteContext(request);

export const createLamNotificationReadContext = async (
  request: Request
): Promise<LamReadContext> => {
  const writeContext = await createLamOperationalWriteContext(request);
  const grantedCapabilities = [
    ...new Set([
      ...(writeContext.grantedCapabilities ?? []),
      "hr.lam.leave-applications.read" as LamPolicyCapability,
    ]),
  ];

  return mergeLamOperationalHeaders(request, {
    canRead: true,
    canViewSensitive: writeContext.canViewSensitive,
    grantedCapabilities,
    scopedEmployeeId: writeContext.scopedEmployeeId,
    teamEmployeeIds: writeContext.teamEmployeeIds,
    companyId: writeContext.companyId,
    tenantId: writeContext.tenantId,
  });
};

export const getQuery = (
  request: Request
): Record<string, string | number | boolean> => {
  const url = new URL(request.url);
  const query: Record<string, string | number | boolean> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "page" || key === "pageSize" || key === "periodYear") {
      query[key] = Number(value);
      continue;
    }

    if (key === "active" || key === "unscopedPolicyGroupOnly") {
      query[key] = value === "true" || value === "1";
      continue;
    }

    if (key === "employeeIds") {
      const existing = query[key];
      query[key] =
        typeof existing === "string" ? `${existing},${value}` : value;
      continue;
    }

    query[key] = value;
  }

  return query;
};
