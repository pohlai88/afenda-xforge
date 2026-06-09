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

export const trainingDevelopmentFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "training-development",
  packageName: "@repo/features-talent-management-training-development",
} as const;
