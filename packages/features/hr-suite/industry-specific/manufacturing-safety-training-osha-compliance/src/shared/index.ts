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

export const manufacturingSafetyTrainingOshaComplianceFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "manufacturing-safety-training-osha-compliance",
  packageName:
    "@repo/features-industry-specific-manufacturing-safety-training-osha-compliance",
} as const;
