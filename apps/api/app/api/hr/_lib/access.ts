import "server-only";

import {
  resolveOptionalCompanyId,
  resolveRuntimeTenantAccess,
  type RuntimeTenantAccess,
} from "../../../_runtime-access.ts";

export const HR_OPERATOR_ROLES = new Set(["admin", "manager", "owner"]);
export const HR_SENSITIVE_ROLES = new Set(["admin", "owner"]);

export type HrOperatorCapabilities = {
  canDownload: boolean;
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
};

export const resolveHrOperatorCapabilities = (
  access: RuntimeTenantAccess
): HrOperatorCapabilities => ({
  canDownload: HR_OPERATOR_ROLES.has(access.role),
  canRead: HR_OPERATOR_ROLES.has(access.role),
  canViewSensitive: HR_SENSITIVE_ROLES.has(access.role),
  canWrite: HR_OPERATOR_ROLES.has(access.role),
});

export const filterHrCapabilityPermissions = (
  grantedPermissions: readonly string[],
  prefix: string
): string[] =>
  grantedPermissions.filter((permission) => permission.startsWith(prefix));

export const resolveHrTenantScopedAccess = async (): Promise<{
  access: RuntimeTenantAccess;
  companyId?: string;
  capabilities: HrOperatorCapabilities;
}> => {
  const access = await resolveRuntimeTenantAccess();
  const companyId = await resolveOptionalCompanyId();

  return {
    access,
    capabilities: resolveHrOperatorCapabilities(access),
    companyId,
  };
};
