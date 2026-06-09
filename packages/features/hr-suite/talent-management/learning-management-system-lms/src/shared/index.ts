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

export const learningManagementSystemLmsFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "learning-management-system-lms",
  packageName:
    "@repo/features-talent-management-learning-management-system-lms",
} as const;
