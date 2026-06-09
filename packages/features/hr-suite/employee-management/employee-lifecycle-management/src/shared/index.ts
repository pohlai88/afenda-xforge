export type HrSuiteFeatureContext = {
  actorId?: string;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
};

export const hrSuiteFeatureScope = {
  source: "legacy-hr-suite",
  suite: "hr-suite",
} as const;

export const employeeLifecycleManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "employee-lifecycle-management",
  packageName:
    "@repo/features-employee-management-employee-lifecycle-management",
} as const;
