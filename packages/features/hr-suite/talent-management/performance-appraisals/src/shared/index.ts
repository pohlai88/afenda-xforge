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

export const performanceAppraisalsFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "performance-appraisals",
  packageName: "@repo/features-talent-management-performance-appraisals",
} as const;
