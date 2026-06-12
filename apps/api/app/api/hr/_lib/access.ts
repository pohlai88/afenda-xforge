import "server-only";

import { hasPermission, permissionCatalog } from "@repo/permissions";
import {
  resolveOptionalCompanyId,
  resolveRuntimeTenantAccess,
  type RuntimeTenantAccess,
} from "../../../_runtime-access.ts";

export type HrOperatorCapabilities = {
  canDownload: boolean;
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
};

export const resolveHrComplianceRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrOperatorCapabilities => {
  const grantedCapabilities = grantedPermissions.filter((permission) =>
    permission.startsWith("hr.compliance.")
  );
  const canRead =
    grantedCapabilities.length > 0 ||
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrCompliance.overviewRead
    );

  const canWrite = grantedCapabilities.some((capability) =>
    capability.endsWith(".write")
  );

  return {
    canDownload: canRead,
    canRead,
    canViewSensitive:
      hasPermission(
        grantedPermissions,
        permissionCatalog.hrCompliance.evidenceSensitiveRead
      ) || grantedCapabilities.includes("hr.compliance.evidence.sensitive.read"),
    canWrite,
  };
};

export const resolveHrOffboardingRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrOperatorCapabilities => {
  const grantedCapabilities = grantedPermissions.filter((permission) =>
    permission.startsWith("hr.offboarding.")
  );
  const canRead =
    grantedCapabilities.length > 0 ||
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrOffboarding.overviewRead
    );

  const canWrite = grantedCapabilities.some((capability) =>
    capability.endsWith(".write")
  );

  return {
    canDownload: canRead,
    canRead,
    canViewSensitive:
      hasPermission(
        grantedPermissions,
        permissionCatalog.hrOffboarding.sensitiveRead
      ) || grantedCapabilities.includes("hr.offboarding.sensitive.read"),
    canWrite,
  };
};

export const resolveHrEmployeeRecordsRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrOperatorCapabilities => ({
  canDownload: hasPermission(
    grantedPermissions,
    permissionCatalog.hrEmployees.read
  ),
  canRead: hasPermission(grantedPermissions, permissionCatalog.hrEmployees.read),
  canViewSensitive: hasPermission(
    grantedPermissions,
    permissionCatalog.hrEmployees.sensitiveRead
  ),
  canWrite: hasPermission(grantedPermissions, permissionCatalog.hrEmployees.write),
});

export const resolveHrOrganizationStructureRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrOperatorCapabilities => ({
  canDownload: hasPermission(
    grantedPermissions,
    permissionCatalog.hrOrganizationStructure.structureRead
  ),
  canRead: hasPermission(
    grantedPermissions,
    permissionCatalog.hrOrganizationStructure.structureRead
  ),
  canViewSensitive: hasPermission(
    grantedPermissions,
    permissionCatalog.hrOrganizationStructure.structureRead
  ),
  canWrite: hasPermission(
    grantedPermissions,
    permissionCatalog.hrOrganizationStructure.structureWrite
  ),
});

export const resolveHrLifecycleRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrOperatorCapabilities => {
  const canRead =
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.overviewRead
    ) ||
    hasPermission(grantedPermissions, permissionCatalog.hrLifecycle.stagesRead) ||
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.historyRead
    ) ||
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.workflowRead
    ) ||
    hasPermission(grantedPermissions, permissionCatalog.hrLifecycle.auditRead);

  const canWrite =
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.workflowWrite
    ) ||
    hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.transitionsWrite
    );

  return {
    canDownload: canRead,
    canRead,
    canViewSensitive: hasPermission(
      grantedPermissions,
      permissionCatalog.hrLifecycle.sensitiveRead
    ),
    canWrite,
  };
};

export const filterHrCapabilityPermissions = (
  grantedPermissions: readonly string[],
  prefix: string
): string[] =>
  grantedPermissions.filter((permission) => permission.startsWith(prefix));

export const resolveHrTenantScopedAccess = async (): Promise<{
  access: RuntimeTenantAccess;
  companyId?: string;
}> => {
  const access = await resolveRuntimeTenantAccess();
  const companyId = await resolveOptionalCompanyId();

  return {
    access,
    companyId,
  };
};
