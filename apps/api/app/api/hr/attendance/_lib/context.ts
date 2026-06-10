import type {
  LamPolicyCapability,
  LamReadContext,
  LamWriteContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

const parseAttendanceCorrectionsEnabled = (
  request: Request
): boolean | undefined => {
  const value = header(request, "x-lam-attendance-corrections-enabled");
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

const parseCapabilities = (
  request: Request
): LamPolicyCapability[] | undefined => {
  const raw = header(request, "x-lam-capabilities");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean) as LamPolicyCapability[];
};

const parseTeamEmployeeIds = (request: Request): string[] | undefined => {
  const raw = header(request, "x-lam-team-employee-ids");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const parseResolvedStepApproverEmployeeIds = (
  request: Request
): string[] | undefined => {
  const raw = header(request, "x-lam-resolved-step-approver-employee-ids");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const parseResolvedHrFallbackApproverEmployeeIds = (
  request: Request
): string[] | undefined => {
  const raw = header(
    request,
    "x-lam-resolved-hr-fallback-approver-employee-ids"
  );
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export const createLamReadContext = (request: Request): LamReadContext => {
  const attendanceCorrectionsEnabled =
    parseAttendanceCorrectionsEnabled(request);

  return {
    canRead: boolHeader(request, "x-can-read-lam") ?? false,
    canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
    companyId: header(request, "x-company-id"),
    tenantId: header(request, "x-tenant-id"),
    grantedCapabilities: parseCapabilities(request),
    scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
    teamEmployeeIds: parseTeamEmployeeIds(request),
    ...(attendanceCorrectionsEnabled === undefined
      ? {}
      : { attendanceCorrectionsEnabled }),
  };
};

export const createLamWriteContext = (
  request: Request
): LamWriteContext & {
  actorId?: string;
  canWrite?: boolean;
  grantedCapabilities?: LamPolicyCapability[];
} => {
  const attendanceCorrectionsEnabled =
    parseAttendanceCorrectionsEnabled(request);

  return {
    actorId: header(request, "x-actor-id") ?? "api",
    canRead: boolHeader(request, "x-can-read-lam") ?? false,
    canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
    canWrite: boolHeader(request, "x-can-write-lam") ?? false,
    companyId: header(request, "x-company-id"),
    tenantId: header(request, "x-tenant-id"),
    grantedCapabilities: parseCapabilities(request),
    scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
    teamEmployeeIds: parseTeamEmployeeIds(request),
    actorEmployeeId: header(request, "x-lam-actor-employee-id"),
    resolvedStepApproverEmployeeIds:
      parseResolvedStepApproverEmployeeIds(request),
    hrFallbackDelegated: boolHeader(request, "x-lam-hr-fallback-delegated"),
    resolvedHrFallbackApproverEmployeeIds:
      parseResolvedHrFallbackApproverEmployeeIds(request),
    ...(attendanceCorrectionsEnabled === undefined
      ? {}
      : { attendanceCorrectionsEnabled }),
  };
};

export const createLamNotificationReadContext = (
  request: Request
): LamReadContext => {
  const writeContext = createLamWriteContext(request);
  const readContext = createLamReadContext(request);
  const grantedCapabilities = [
    ...new Set([
      ...(readContext.grantedCapabilities ?? []),
      ...(writeContext.grantedCapabilities ?? []),
      "hr.lam.attendance-corrections.read" as LamPolicyCapability,
    ]),
  ];

  return {
    ...readContext,
    canRead: true,
    canViewSensitive:
      readContext.canViewSensitive || writeContext.canViewSensitive,
    grantedCapabilities,
    scopedEmployeeId:
      readContext.scopedEmployeeId ?? writeContext.scopedEmployeeId,
    teamEmployeeIds:
      readContext.teamEmployeeIds ?? writeContext.teamEmployeeIds,
    companyId: readContext.companyId ?? writeContext.companyId,
    tenantId: readContext.tenantId ?? writeContext.tenantId,
  };
};

export const bindLamEmployeeSubmitBody = <
  T extends { employeeId?: string | null },
>(
  request: Request,
  body: T
): T => {
  const scopedEmployeeId = header(request, "x-lam-scoped-employee-id");
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
): LamReadContext => createLamReadContext(request);

export const createLamCorrectionWriteContext = (
  request: Request
): LamWriteContext & {
  actorId?: string;
  canWrite?: boolean;
  grantedCapabilities?: LamPolicyCapability[];
} => {
  const writeContext = createLamWriteContext(request);
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
): LamWriteContext & {
  actorId?: string;
  canWrite?: boolean;
  grantedCapabilities?: LamPolicyCapability[];
} => createLamWriteContext(request);

export const createLamAttendanceExceptionsReadContext = (
  request: Request
): LamReadContext => createLamReadContext(request);

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
