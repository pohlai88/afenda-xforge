import type {
  LamMutationResult,
  LamPolicyContext,
  LeaveAttendanceManagementCapability,
} from "../contracts/index.ts";
import { lamPolicyContextSchema } from "../contracts/index.ts";
import { leaveAttendanceManagementCapabilities } from "../registry/capability.ts";

export type LamDataScope =
  | { mode: "company" }
  | { mode: "self"; employeeId: string }
  | { mode: "team"; employeeIds: readonly string[] }
  | { mode: "denied" };

const lamCompanyWideCapabilities = [
  leaveAttendanceManagementCapabilities.leaveTypesWrite,
  leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
  leaveAttendanceManagementCapabilities.leaveBalancesWrite,
  leaveAttendanceManagementCapabilities.attendanceWrite,
  leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  leaveAttendanceManagementCapabilities.auditRead,
  leaveAttendanceManagementCapabilities.payrollReferencesRead,
  leaveAttendanceManagementCapabilities.reportsRead,
  leaveAttendanceManagementCapabilities.reportsExport,
] as const;

const lamManagerTeamCapabilities = [
  leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  leaveAttendanceManagementCapabilities.reportsRead,
] as const;

const lamManagerReadRestrictionCapabilities = [
  leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
] as const;

const lamHrAdminWriteCapabilities = [
  leaveAttendanceManagementCapabilities.leaveTypesWrite,
  leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
  leaveAttendanceManagementCapabilities.leaveBalancesWrite,
  leaveAttendanceManagementCapabilities.attendanceWrite,
] as const;

const resolveCompanyWideDataScope = (
  normalized: LamPolicyContext
): LamDataScope => {
  if (
    normalized.canWrite ||
    hasAnyCapability(normalized, lamCompanyWideCapabilities)
  ) {
    return { mode: "company" };
  }

  if (
    normalized.canRead &&
    hasAnyCapability(normalized, lamCompanyWideReadCapabilities)
  ) {
    return { mode: "company" };
  }

  return { mode: "denied" };
};

const normalizePolicyContext = (context: unknown): LamPolicyContext | null => {
  const parsed = lamPolicyContextSchema.safeParse(context ?? {});
  return parsed.success ? parsed.data : null;
};

const hasCapability = (
  context: LamPolicyContext,
  capability: LeaveAttendanceManagementCapability
): boolean => context.grantedCapabilities?.includes(capability) ?? false;

const hasAnyCapability = (
  context: LamPolicyContext,
  capabilities: readonly LeaveAttendanceManagementCapability[]
): boolean =>
  capabilities.some((capability) => hasCapability(context, capability));

const lamCompanyWideReadCapabilities = [
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

export const resolveLamDataScope = (context: unknown): LamDataScope => {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return { mode: "denied" };
  }

  if (normalized.scopedEmployeeId) {
    return { mode: "self", employeeId: normalized.scopedEmployeeId };
  }

  if (
    normalized.teamEmployeeIds &&
    normalized.teamEmployeeIds.length > 0 &&
    hasAnyCapability(normalized, lamManagerTeamCapabilities)
  ) {
    return { mode: "team", employeeIds: normalized.teamEmployeeIds };
  }

  const hasHrAdminElevation =
    normalized.canWrite ||
    hasAnyCapability(normalized, lamHrAdminWriteCapabilities);

  const hasPayrollOperatorElevation = hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.payrollReferencesRead
  );

  const hasCompanyReadElevation =
    normalized.canRead &&
    hasAnyCapability(normalized, lamCompanyWideReadCapabilities);

  const hasOperatorElevation =
    hasCompanyReadElevation || hasPayrollOperatorElevation;

  if (
    hasCapability(
      normalized,
      leaveAttendanceManagementCapabilities.reportsRead
    ) &&
    !hasHrAdminElevation &&
    !hasOperatorElevation &&
    !(normalized.teamEmployeeIds && normalized.teamEmployeeIds.length > 0)
  ) {
    return { mode: "denied" };
  }

  if (
    hasAnyCapability(normalized, lamManagerReadRestrictionCapabilities) &&
    !hasHrAdminElevation &&
    !hasOperatorElevation
  ) {
    return { mode: "denied" };
  }

  return resolveCompanyWideDataScope(normalized);
};

export const resolveLamReadDataScope = (context: unknown): LamDataScope => {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return { mode: "denied" };
  }

  if (normalized.scopedEmployeeId) {
    return { mode: "self", employeeId: normalized.scopedEmployeeId };
  }

  if (
    normalized.teamEmployeeIds &&
    normalized.teamEmployeeIds.length > 0 &&
    hasAnyCapability(normalized, lamManagerTeamCapabilities)
  ) {
    return { mode: "team", employeeIds: normalized.teamEmployeeIds };
  }

  const hasHrAdminElevation =
    normalized.canWrite ||
    hasAnyCapability(normalized, lamHrAdminWriteCapabilities);

  const hasCompanyReadElevation =
    normalized.canRead &&
    hasAnyCapability(normalized, lamCompanyWideReadCapabilities);

  const hasPayrollOperatorReadElevation = hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.payrollReferencesRead
  );

  const hasAuditorReadElevation = hasCapability(
    normalized,
    leaveAttendanceManagementCapabilities.auditRead
  );

  const hasOperatorReadElevation =
    hasCompanyReadElevation ||
    hasPayrollOperatorReadElevation ||
    hasAuditorReadElevation;

  if (
    hasCapability(
      normalized,
      leaveAttendanceManagementCapabilities.reportsRead
    ) &&
    !hasHrAdminElevation &&
    !hasOperatorReadElevation &&
    !(normalized.teamEmployeeIds && normalized.teamEmployeeIds.length > 0)
  ) {
    return { mode: "denied" };
  }

  if (
    hasAnyCapability(normalized, lamManagerReadRestrictionCapabilities) &&
    !hasHrAdminElevation &&
    !hasOperatorReadElevation
  ) {
    return { mode: "denied" };
  }

  return resolveCompanyWideDataScope(normalized);
};

const canAccessEmployeeRecordForScope = (
  scope: LamDataScope,
  employeeId: string
): boolean => {
  if (scope.mode === "denied") {
    return false;
  }

  if (scope.mode === "company") {
    return true;
  }

  if (scope.mode === "self") {
    return scope.employeeId === employeeId;
  }

  return scope.employeeIds.includes(employeeId);
};

export const canAccessLamEmployeeRecord = (
  context: unknown,
  employeeId: string
): boolean =>
  canAccessEmployeeRecordForScope(resolveLamReadDataScope(context), employeeId);

export const canAccessLamEmployeeRecordForMutation = (
  context: unknown,
  employeeId: string
): boolean =>
  canAccessEmployeeRecordForScope(resolveLamDataScope(context), employeeId);

export const filterByEmployeeDataScope = <T extends { employeeId: string }>(
  items: readonly T[],
  context: unknown,
  requestedEmployeeId?: string | null
): T[] => {
  const scope = resolveLamReadDataScope(context);
  if (scope.mode === "denied") {
    return [];
  }

  let scopedItems: T[] = [...items];

  if (scope.mode === "self") {
    scopedItems = scopedItems.filter(
      (entry) => entry.employeeId === scope.employeeId
    );
  } else if (scope.mode === "team") {
    scopedItems = scopedItems.filter((entry) =>
      scope.employeeIds.includes(entry.employeeId)
    );
  }

  if (requestedEmployeeId) {
    if (!canAccessLamEmployeeRecord(context, requestedEmployeeId)) {
      return [];
    }

    scopedItems = scopedItems.filter(
      (entry) => entry.employeeId === requestedEmployeeId
    );
  }

  return scopedItems;
};

export const requireLamEmployeeMutationScope = (
  context: unknown,
  employeeId: string
): LamMutationResult | null => {
  if (!canAccessLamEmployeeRecordForMutation(context, employeeId)) {
    return {
      ok: false,
      error: "Employee data scope access denied for leave and attendance",
    };
  }

  return null;
};
