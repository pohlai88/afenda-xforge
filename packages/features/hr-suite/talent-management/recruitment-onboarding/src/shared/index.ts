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

export const recruitmentOnboardingFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "recruitment-onboarding",
  packageName: "@repo/features-talent-management-recruitment-onboarding",
} as const;
