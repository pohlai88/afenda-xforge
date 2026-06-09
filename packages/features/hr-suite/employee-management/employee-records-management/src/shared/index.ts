export type HrSuiteFeatureContext = {
  actorId?: string;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
};

export const hrSuiteFeatureScope = {
  source: "legacy-hr-suite",
  suite: "hr-suite",
} as const;

export const hrRecordsFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "employee-records-management",
  packageName: "@repo/features-employee-management-employee-records-management",
} as const;
