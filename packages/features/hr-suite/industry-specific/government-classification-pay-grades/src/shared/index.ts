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

export const governmentClassificationPayGradesFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "government-classification-pay-grades",
  packageName: "@repo/features-industry-specific-government-classification-pay-grades",
} as const;
