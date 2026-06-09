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

export const overtimeManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "time-attendance",
  feature: "overtime-management",
  packageName: "@repo/features-time-attendance-overtime-management",
} as const;
