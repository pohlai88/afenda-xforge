export type ExpensesReimbursementMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const expensesReimbursementMetadata: ExpensesReimbursementMetadata = {
  id: "hr-suite.payroll-compensation.expenses-reimbursement",
  title: "Expenses Reimbursement",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Expenses Reimbursement record",
    plural: "Expenses Reimbursement records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
