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

export const foodHandlerCertificationHealthComplianceFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "food-handler-certification-health-compliance",
  packageName:
    "@repo/features-industry-specific-food-handler-certification-health-compliance",
} as const;
