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

export const multiCountryPayrollFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "payroll-compensation",
  feature: "multi-country-payroll",
  packageName: "@repo/features-payroll-compensation-multi-country-payroll",
} as const;
