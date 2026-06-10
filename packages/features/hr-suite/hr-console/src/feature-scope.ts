import { permissionCatalog } from "@repo/permissions";
import {
  hrConsoleFeatureId,
  hrConsolePackageName,
} from "./shared/index.ts";

export const hrSuiteFeatureScope = {
  source: "hr-suite",
  suite: "hr-suite",
} as const;

export const hrConsoleFeatureScope = {
  featureId: hrConsoleFeatureId,
  packageName: hrConsolePackageName,
  source: hrSuiteFeatureScope.source,
  suite: hrSuiteFeatureScope.suite,
} as const;

export const hrConsoleCapabilities = {
  delegationManage: permissionCatalog.hrConsole.delegationManage,
  delegationRead: permissionCatalog.hrConsole.delegationRead,
  overviewRead: permissionCatalog.hrConsole.overviewRead,
  sectionsRead: permissionCatalog.hrConsole.sectionsRead,
} as const;

export const hrConsoleReadCapabilities = [
  hrConsoleCapabilities.overviewRead,
  hrConsoleCapabilities.sectionsRead,
  hrConsoleCapabilities.delegationRead,
] as const;

export const hrConsoleOperatorCapabilities = [
  ...hrConsoleReadCapabilities,
  hrConsoleCapabilities.delegationManage,
  permissionCatalog.hrLam.attendanceCorrectionsWrite,
  permissionCatalog.hrLam.attendancePolicyWrite,
  permissionCatalog.hrLam.attendanceWrite,
  permissionCatalog.hrLam.calendarsWrite,
  permissionCatalog.hrLam.encashmentWrite,
  permissionCatalog.hrLam.leaveApplicationsApprove,
  permissionCatalog.hrLam.leaveApplicationsWrite,
  permissionCatalog.hrLam.leaveBalancesWrite,
  permissionCatalog.hrLam.leaveEntitlementsWrite,
  permissionCatalog.hrLam.leaveTypesWrite,
  permissionCatalog.hrLam.reportsExport,
] as const;

export const hrConsoleLamWriteCapabilities = hrConsoleOperatorCapabilities.filter(
  (capability) => capability.startsWith("hr.lam.")
);

export type HrConsoleCapability =
  (typeof hrConsoleOperatorCapabilities)[number];

export const createHrConsolePermissionContext = (
  context: {
    companyId?: string;
    grantedPermissions: string[];
    tenantId: string;
    userId: string;
  },
  action: string,
  resource = "hr.console"
) => ({
  action,
  actorId: context.userId,
  companyId: context.companyId,
  grantedPermissions: context.grantedPermissions,
  metadata: {
    feature: hrConsoleFeatureScope.featureId,
  },
  resource,
  tenantId: context.tenantId,
});
