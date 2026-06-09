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

export const expensesReimbursementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "payroll-compensation",
  feature: "expenses-reimbursement",
  packageName: "@repo/features-payroll-compensation-expenses-reimbursement",
} as const;
