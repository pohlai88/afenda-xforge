export type ExpensesReimbursementStatus = "draft" | "active" | "archived";

export type ExpensesReimbursementRecord = {
  id: string;
  name: string;
  status: ExpensesReimbursementStatus;
};

export type ListExpensesReimbursementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateExpensesReimbursementInput = {
  name: string;
};

export type UpdateExpensesReimbursementInput = {
  id: string;
  name?: string;
  status?: ExpensesReimbursementStatus;
};

export const expensesReimbursementRouteContracts = [] as const;

export const expensesReimbursementFeatureId = "hr-suite.payroll-compensation.expenses-reimbursement" as const;
