import type {
  LamPolicyCapability,
  LamReadContext,
  LamWriteContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import { getLamAttendanceCorrectionById } from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  createLamOperationalReadContext,
  createLamOperationalWriteContext,
  isLamOrchestrationHeaderMode,
  type LamOperationalWriteContext,
} from "../../_lib/lam-governed-context.ts";
import {
  enrichLamApprovalWriteContext,
  type LamApprovalOrchestrationSubject,
} from "../../_lib/lam-approval-orchestration.ts";

export {
  createLamOperationalReadContext,
  createLamOperationalWriteContext,
} from "../../_lib/lam-governed-context.ts";

const parseAttendanceCorrectionsEnabled = (
  request: Request
): boolean | undefined => {
  const value = request.headers
    .get("x-lam-attendance-corrections-enabled")
    ?.trim();
  if (!value) {
    return;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  return;
};

const withAttendanceCorrectionsFlag = (
  request: Request,
  context: LamReadContext
): LamReadContext => {
  const attendanceCorrectionsEnabled =
    parseAttendanceCorrectionsEnabled(request);

  if (attendanceCorrectionsEnabled === undefined) {
    return context;
  }

  return {
    ...context,
    attendanceCorrectionsEnabled,
  };
};

export const createLamReadContext = async (
  request: Request
): Promise<LamReadContext> =>
  withAttendanceCorrectionsFlag(
    request,
    await createLamOperationalReadContext(request)
  );

export const createLamWriteContext = async (
  request: Request
): Promise<LamOperationalWriteContext> => {
  const writeContext = await createLamOperationalWriteContext(request);
  const attendanceCorrectionsEnabled =
    parseAttendanceCorrectionsEnabled(request);

  if (attendanceCorrectionsEnabled === undefined) {
    return writeContext;
  }

  return {
    ...writeContext,
    attendanceCorrectionsEnabled,
  };
};

export const createLamNotificationReadContext = async (
  request: Request
): Promise<LamReadContext> => {
  const writeContext = await createLamWriteContext(request);
  const grantedCapabilities = [
    ...new Set([
      ...(writeContext.grantedCapabilities ?? []),
      "hr.lam.attendance-corrections.read" as LamPolicyCapability,
    ]),
  ];

  return withAttendanceCorrectionsFlag(request, {
    canRead: true,
    canViewSensitive: writeContext.canViewSensitive,
    grantedCapabilities,
    scopedEmployeeId: writeContext.scopedEmployeeId,
    teamEmployeeIds: writeContext.teamEmployeeIds,
    companyId: writeContext.companyId,
    tenantId: writeContext.tenantId,
    attendanceCorrectionsEnabled: writeContext.attendanceCorrectionsEnabled,
  });
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

export const createLamCorrectionsReadContext = (
  request: Request
): Promise<LamReadContext> => createLamReadContext(request);

export const createLamCorrectionWriteContext = async (
  request: Request
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const writeContext = await createLamWriteContext(request);
  const grantedCapabilities = writeContext.grantedCapabilities ?? [];

  if (
    writeContext.canWrite &&
    !grantedCapabilities.includes("hr.lam.attendance-corrections.write")
  ) {
    return {
      ...writeContext,
      grantedCapabilities: [
        ...grantedCapabilities,
        "hr.lam.attendance-corrections.write" as LamPolicyCapability,
      ],
    };
  }

  return writeContext;
};

export const createLamCorrectionApprovalContext = (
  request: Request
): Promise<LamOperationalWriteContext> => createLamWriteContext(request);

export const createLamCorrectionApprovalContextById = async (
  request: Request,
  correctionId: string
): Promise<
  LamWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    grantedCapabilities?: LamPolicyCapability[];
  }
> => {
  const base = await createLamCorrectionApprovalContext(request);

  if (isLamOrchestrationHeaderMode()) {
    return base;
  }

  const readContext = await createLamNotificationReadContext(request);
  const correction = await getLamAttendanceCorrectionById(
    correctionId,
    readContext
  );

  if (!correction) {
    return base;
  }

  const subject: LamApprovalOrchestrationSubject = {
    approvalRouteId: correction.approvalRouteId,
    currentStepOrder: correction.currentStepOrder,
    employeeId: correction.employeeId,
    status: correction.status,
  };

  return enrichLamApprovalWriteContext(request, base, subject);
};

export const createLamAttendanceExceptionsReadContext = (
  request: Request
): Promise<LamReadContext> => createLamReadContext(request);

export const getQuery = (
  request: Request
): Record<string, string | number | boolean> => {
  const url = new URL(request.url);
  const query: Record<string, string | number | boolean> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "page" || key === "pageSize" || key === "gracePeriodMinutes") {
      query[key] = Number(value);
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
