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

export const successionPlanningFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "succession-planning",
  packageName: "@repo/features-talent-management-succession-planning",
} as const;
