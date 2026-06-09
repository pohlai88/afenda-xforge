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

export const compensationPlanningModelingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "payroll-compensation",
  feature: "compensation-planning-modeling",
  packageName: "@repo/features-payroll-compensation-compensation-planning-modeling",
} as const;
