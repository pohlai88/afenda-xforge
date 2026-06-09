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

export const unionManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "industry-specific",
  feature: "union-management",
  packageName: "@repo/features-industry-specific-union-management",
} as const;
