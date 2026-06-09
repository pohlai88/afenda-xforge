import {
  employeeLifecycleManagementDomain,
  employeeLifecycleManagementPackageName,
  employeeLifecycleManagementSuite,
} from "./identity.ts";

export const employeeLifecycleManagementFeatureScope = {
  source: "legacy-hr-suite",
  suite: employeeLifecycleManagementSuite,
  domain: employeeLifecycleManagementDomain,
  feature: "employee-lifecycle-management",
  packageName: employeeLifecycleManagementPackageName,
} as const;

export type EmployeeLifecycleManagementFeatureScope =
  typeof employeeLifecycleManagementFeatureScope;
