export type HrSuiteFeatureContext = {
  actorId?: string;
  canWrite?: boolean;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
};

export const hrSuiteFeatureScope = {
  source: "legacy-hr-suite",
  suite: "hr-suite",
} as const;

export const hrOrgFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "organizational-chart-hierarchy",
  packageName:
    "@repo/features-employee-management-organizational-chart-hierarchy",
} as const;
