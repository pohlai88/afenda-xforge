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

export const careerPathingDevelopmentPlansFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "career-pathing-development-plans",
  packageName:
    "@repo/features-talent-management-career-pathing-development-plans",
} as const;
