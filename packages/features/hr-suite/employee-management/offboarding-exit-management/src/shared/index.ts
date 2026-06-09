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

export const offboardingExitManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "offboarding-exit-management",
  packageName: "@repo/features-employee-management-offboarding-exit-management",
} as const;
