import type { LamMutationResult, LamPolicyContext } from "./contracts/index.ts";
import { lamPolicyContextSchema } from "./contracts/index.ts";
import type { LeaveAttendanceManagementCapability } from "./registry/capability.ts";
import {
  leaveAttendanceManagementCapabilities,
  leaveAttendanceManagementSensitiveCapabilities,
  leaveAttendanceManagementWriteCapabilities,
} from "./registry/capability.ts";

export type { LamPolicyContext } from "./contracts/index.ts";

const lamReadCapabilities = [
  leaveAttendanceManagementCapabilities.overviewRead,
  leaveAttendanceManagementCapabilities.attendanceRead,
  leaveAttendanceManagementCapabilities.leaveTypesRead,
  leaveAttendanceManagementCapabilities.leaveEntitlementsRead,
  leaveAttendanceManagementCapabilities.leaveBalancesRead,
  leaveAttendanceManagementCapabilities.leaveApplicationsRead,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
  leaveAttendanceManagementCapabilities.payrollReferencesRead,
  leaveAttendanceManagementCapabilities.auditRead,
  leaveAttendanceManagementCapabilities.reportsRead,
] as const;

const hasCapability = (
  context: LamPolicyContext,
  capability: LeaveAttendanceManagementCapability
): boolean => context.grantedCapabilities?.includes(capability) ?? false;

const hasAnyCapability = (
  context: LamPolicyContext,
  capabilities: readonly LeaveAttendanceManagementCapability[]
): boolean =>
  capabilities.some((capability) => hasCapability(context, capability));

const normalizePolicyContext = (context: unknown): LamPolicyContext | null => {
  const parsed = lamPolicyContextSchema.safeParse(context ?? {});
  return parsed.success ? parsed.data : null;
};

export function canReadLeaveAttendanceManagement(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canRead) ||
    hasAnyCapability(normalized, lamReadCapabilities)
  );
}

export function canWriteLeaveAttendanceManagement(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canWrite) ||
    hasAnyCapability(normalized, leaveAttendanceManagementWriteCapabilities)
  );
}

export function canReadLeaveAttendanceManagementSensitiveData(
  context: unknown
): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canViewSensitive) ||
    hasAnyCapability(normalized, leaveAttendanceManagementSensitiveCapabilities)
  );
}

export function canReadLamAttendanceCorrections(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead
  );
}

export function canReadLamPayrollReferences(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.payrollReferencesRead
  );
}

export function canReadLamReports(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.reportsRead
  );
}

export function canReadLamAuditTrail(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.auditRead
  );
}

export function requireLamWriteAccess(context: unknown): LamMutationResult {
  return canWriteLeaveAttendanceManagement(context)
    ? { ok: true, targetId: "" }
    : { ok: false, error: "Write access denied for leave and attendance" };
}

export { lamLeaveApplicationSensitiveFieldPolicy as lamSensitiveFieldPolicy } from "./contracts/index.ts";
export {
  canAccessLamEmployeeRecord,
  canAccessLamEmployeeRecordForMutation,
  filterByEmployeeDataScope,
  type LamDataScope,
  requireLamEmployeeMutationScope,
  resolveLamDataScope,
  resolveLamReadDataScope,
} from "./shared/data-scope.ts";
