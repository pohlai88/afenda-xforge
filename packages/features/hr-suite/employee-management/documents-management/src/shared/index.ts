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

export const documentsManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "employee-management",
  feature: "documents-management",
  packageName: "@repo/features-employee-management-documents-management",
} as const;
