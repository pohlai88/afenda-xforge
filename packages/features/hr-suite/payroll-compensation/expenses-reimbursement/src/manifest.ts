import { expensesReimbursementRouteContracts } from "./contract.ts";

export type ExpensesReimbursementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof expensesReimbursementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const expensesReimbursementManifest: ExpensesReimbursementManifest = {
  id: "hr-suite.payroll-compensation.expenses-reimbursement",
  title: "Expenses Reimbursement",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/expenses-reimbursement.",
  domain: "payroll-compensation",
  packageName: "@repo/features-payroll-compensation-expenses-reimbursement",
  routeContracts: expensesReimbursementRouteContracts,
  suite: "hr-suite",
};
