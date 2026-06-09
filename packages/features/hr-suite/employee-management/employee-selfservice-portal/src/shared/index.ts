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

export const employeeSelfservicePortalFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "employee-selfservice-portal",
  packageName: "@repo/features-employee-management-employee-selfservice-portal",
} as const;
