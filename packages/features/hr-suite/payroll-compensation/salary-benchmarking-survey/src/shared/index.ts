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

export const salaryBenchmarkingSurveyFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "payroll-compensation",
  feature: "salary-benchmarking-survey",
  packageName: "@repo/features-payroll-compensation-salary-benchmarking-survey",
} as const;
