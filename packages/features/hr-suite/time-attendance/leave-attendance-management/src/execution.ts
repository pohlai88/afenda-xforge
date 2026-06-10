import "server-only";

import type {
  LamAuditEvent,
  LamMutationResult,
  LamPolicyCapability,
} from "./contracts/index.ts";
import { lamLeaveApplicationSensitiveFields } from "./contracts/index.ts";
import { requireLamWriteAccess } from "./policy.ts";
import { leaveAttendanceManagementCapabilities } from "./registry/capability.ts";
import { createLamRecordId, loadLamRepository, mutateLamRepository } from "./repository.ts";
import { resolveLamAttendanceCorrectionsEnabled } from "./shared/attendance-corrections-enabled.ts";

export type LamMutationContext = {
  actorId?: string;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
  grantedCapabilities?: LamPolicyCapability[];
  scopedEmployeeId?: string;
  teamEmployeeIds?: readonly string[];
  actorEmployeeId?: string;
  resolvedStepApproverEmployeeIds?: readonly string[];
  hrFallbackDelegated?: boolean;
  resolvedHrFallbackApproverEmployeeIds?: readonly string[];
  attendanceCorrectionsEnabled?: boolean;
};

export type LamAuditEventInput = Omit<LamAuditEvent, "id" | "createdAt">;

export const denyLamMutation = (): LamMutationResult => ({
  ok: false,
  error: "Write access denied for leave and attendance",
});

export const normalizeLamMutationActorId = (
  context?: LamMutationContext
): string => context?.actorId?.trim() || "system";

export const requireLamMutationAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const accessDecision = requireLamWriteAccess(context);
  if (!accessDecision.ok) {
    return accessDecision;
  }

  return null;
};

export const requireLamCapabilityWriteAccess = (
  context: LamMutationContext | undefined,
  capability: LamPolicyCapability,
  errorMessage: string
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  if (context.canWrite) {
    return null;
  }

  if (context.grantedCapabilities?.includes(capability)) {
    return null;
  }

  return {
    ok: false,
    error: errorMessage,
  };
};

export const requireLamLeaveTypesWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null =>
  requireLamCapabilityWriteAccess(
    context,
    leaveAttendanceManagementCapabilities.leaveTypesWrite,
    "Leave types write access denied"
  );

export const requireLamLeaveEntitlementsWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null =>
  requireLamCapabilityWriteAccess(
    context,
    leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
    "Leave entitlements write access denied"
  );

export const requireLamLeaveApplicationsWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null =>
  requireLamCapabilityWriteAccess(
    context,
    leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
    "Leave applications write access denied"
  );

export const requireLamBalanceWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasBalanceWrite =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.leaveBalancesWrite
    ) ?? false;

  if (hasBalanceWrite || context.canWrite) {
    return null;
  }

  return {
    ok: false,
    error: "Leave balance write access denied",
  };
};

export const requireLamApprovalAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasApproveCapability =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove
    ) ?? false;

  if (hasApproveCapability || context.canWrite) {
    return null;
  }

  return {
    ok: false,
    error: "Approval access denied for leave applications",
  };
};

export const requireStrictLamApprovalAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasApproveCapability =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove
    ) ?? false;

  if (hasApproveCapability) {
    return null;
  }

  return {
    ok: false,
    error: "Approval access denied for leave applications",
  };
};

export const requireLamOverdueNotificationAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  if (context.canWrite) {
    return null;
  }

  const hasApproveCapability =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove
    ) ?? false;

  if (hasApproveCapability) {
    return null;
  }

  return {
    ok: false,
    error: "Overdue notification processing access denied",
  };
};

export const requireLamAttendanceWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasAttendanceWrite =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.attendanceWrite
    ) ?? false;

  if (hasAttendanceWrite || context.canWrite) {
    // HR admin contexts may pass canWrite without the explicit attendance cap.
    return null;
  }

  return {
    ok: false,
    error: "Attendance write access denied",
  };
};

export const requireStrictLamCorrectionApprovalAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasCorrectionWrite =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite
    ) ?? false;

  if (hasCorrectionWrite) {
    return null;
  }

  return {
    ok: false,
    error: "Approval access denied for attendance corrections",
  };
};

export const requireLamCorrectionApprovalAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasCorrectionWrite =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite
    ) ?? false;

  if (hasCorrectionWrite || context.canWrite) {
    return null;
  }

  return {
    ok: false,
    error: "Approval access denied for attendance corrections",
  };
};

export const requireLamAttendanceCorrectionsWriteAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return denyLamMutation();
  }

  const hasCorrectionWrite =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite
    ) ?? false;

  if (hasCorrectionWrite || context.canWrite) {
    return null;
  }

  return {
    ok: false,
    error: "Attendance correction write access denied",
  };
};

export const requireLamAttendanceCorrectionsEnabledForCompany = async (
  context: LamMutationContext | undefined,
  companyId: string
): Promise<LamMutationResult | null> => {
  const state = await loadLamRepository({
    companyId,
    tenantId: context?.tenantId,
  });

  const enabled = resolveLamAttendanceCorrectionsEnabled({
    companyId,
    companyAttendanceSettings: state.companyAttendanceSettings,
    contextEnabled: context?.attendanceCorrectionsEnabled,
  });

  if (!enabled) {
    return {
      ok: false,
      error: "Attendance corrections are disabled for this company",
    };
  }

  return null;
};

export const requireLamPayrollReferencesReadAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return {
      ok: false,
      error: "Payroll reference read access denied",
    };
  }

  const hasPayrollRead =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.payrollReferencesRead
    ) ?? false;

  if (hasPayrollRead) {
    return null;
  }

  return {
    ok: false,
    error: "Payroll reference read access denied",
  };
};

export const requireLamPayrollReferencesExportAccess = (
  context?: LamMutationContext
): LamMutationResult | null => requireLamPayrollReferencesReadAccess(context);

export const requireLamReportsExportAccess = (
  context?: LamMutationContext
): LamMutationResult | null => {
  if (!context) {
    return {
      ok: false,
      error: "Reports export access denied",
    };
  }

  const hasReportsExport =
    context.grantedCapabilities?.includes(
      leaveAttendanceManagementCapabilities.reportsExport
    ) ?? false;

  if (hasReportsExport) {
    return null;
  }

  return {
    ok: false,
    error: "Reports export access denied",
  };
};

export { requireLamEmployeeMutationScope } from "./shared/data-scope.ts";

export const buildLamAuditMetadata = (
  input: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );

const redactLamAuditPayload = (value: unknown): unknown => {
  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(redactLamAuditPayload);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      lamLeaveApplicationSensitiveFields.includes(
        key as (typeof lamLeaveApplicationSensitiveFields)[number]
      )
        ? null
        : redactLamAuditPayload(entryValue),
    ])
  );
};

export const createLamMutationAuditEvent = (
  event: LamAuditEventInput
): LamAuditEvent => ({
  ...event,
  before: redactLamAuditPayload(event.before),
  after: redactLamAuditPayload(event.after),
  id: createLamRecordId(),
  createdAt: new Date(),
});

export const recordLamMutationAuditEvent = (
  event: LamAuditEventInput,
  context?: LamMutationContext
): Promise<void> => {
  const auditEvent = createLamMutationAuditEvent(event);

  return mutateLamRepository((draft) => {
    draft.auditEvents.push(auditEvent);
  }, context).then(() => undefined);
};
