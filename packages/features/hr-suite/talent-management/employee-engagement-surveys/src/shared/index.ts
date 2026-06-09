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

export const employeeEngagementSurveysFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "employee-engagement-surveys",
  packageName: "@repo/features-talent-management-employee-engagement-surveys",
} as const;
