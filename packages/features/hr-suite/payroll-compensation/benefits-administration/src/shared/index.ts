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

export const benefitsAdministrationFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "payroll-compensation",
  feature: "benefits-administration",
  packageName: "@repo/features-payroll-compensation-benefits-administration",
} as const;
