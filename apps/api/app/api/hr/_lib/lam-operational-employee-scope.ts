import "server-only";

import type { LamPolicyCapability } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { resolveEmployeeIdByAuthUserId } from "@repo/features-employee-management-employee-records-management/server";
import { permissionCatalog } from "@repo/permissions";

export type LamOperationalEmployeeScope = {
  actorEmployeeId?: string;
  scopedEmployeeId?: string;
};

const HR_ELEVATION_CAPABILITIES = new Set<string>([
  permissionCatalog.hrLam.leaveApplicationsApprove,
  permissionCatalog.hrLam.leaveEntitlementsWrite,
  permissionCatalog.hrLam.leaveTypesWrite,
  permissionCatalog.hrLam.leaveBalancesWrite,
  permissionCatalog.hrLam.encashmentWrite,
  permissionCatalog.hrLam.calendarsWrite,
  permissionCatalog.hrLam.attendancePolicyWrite,
  permissionCatalog.hrLam.attendanceWrite,
  permissionCatalog.hrLam.payrollReferencesRead,
  permissionCatalog.hrLam.auditRead,
  permissionCatalog.hrLam.reportsExport,
]);

export const extractEmployeeIdFromUserMetadata = (
  metadata: Record<string, unknown> | undefined
): string | undefined => {
  const raw = metadata?.employee_id ?? metadata?.employeeId;
  if (typeof raw !== "string") {
    return;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const shouldBindScopedEmployeeFromSession = (
  grantedCapabilities: readonly LamPolicyCapability[]
): boolean => {
  if (grantedCapabilities.length === 0) {
    return false;
  }

  return !grantedCapabilities.some((capability) =>
    HR_ELEVATION_CAPABILITIES.has(capability)
  );
};

export const resolveLamOperationalEmployeeScopeFromUser = (args: {
  grantedCapabilities: readonly LamPolicyCapability[];
  registryEmployeeId?: string;
  userMetadata?: Record<string, unknown>;
}): LamOperationalEmployeeScope => {
  if (!shouldBindScopedEmployeeFromSession(args.grantedCapabilities)) {
    return {};
  }

  const employeeId =
    args.registryEmployeeId ??
    extractEmployeeIdFromUserMetadata(args.userMetadata);
  if (!employeeId) {
    return {};
  }

  return {
    actorEmployeeId: employeeId,
    scopedEmployeeId: employeeId,
  };
};

export const resolveLamOperationalEmployeeScope = async (args: {
  companyId: string;
  grantedCapabilities: readonly LamPolicyCapability[];
  tenantId: string;
  userId: string;
  userMetadata?: Record<string, unknown>;
}): Promise<LamOperationalEmployeeScope> => {
  let registryEmployeeId: string | undefined;

  if (shouldBindScopedEmployeeFromSession(args.grantedCapabilities)) {
    registryEmployeeId = await resolveEmployeeIdByAuthUserId({
      companyId: args.companyId,
      tenantId: args.tenantId,
      userId: args.userId,
    });
  }

  return resolveLamOperationalEmployeeScopeFromUser({
    grantedCapabilities: args.grantedCapabilities,
    registryEmployeeId,
    userMetadata: args.userMetadata,
  });
};
