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

export const candidateSelfservicePortalFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "talent-management",
  feature: "candidate-selfservice-portal",
  packageName: "@repo/features-talent-management-candidate-selfservice-portal",
} as const;
