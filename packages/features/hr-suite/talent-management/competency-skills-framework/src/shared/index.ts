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

export const competencySkillsFrameworkFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "competency-skills-framework",
  packageName: "@repo/features-talent-management-competency-skills-framework",
} as const;
