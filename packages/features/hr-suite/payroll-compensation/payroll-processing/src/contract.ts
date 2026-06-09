export type PayrollProcessingStatus = "draft" | "active" | "archived";

export type PayrollProcessingRecord = {
  id: string;
  name: string;
  status: PayrollProcessingStatus;
};

export type ListPayrollProcessingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreatePayrollProcessingInput = {
  name: string;
};

export type UpdatePayrollProcessingInput = {
  id: string;
  name?: string;
  status?: PayrollProcessingStatus;
};

export const payrollProcessingRouteContracts = [] as const;

export const payrollProcessingFeatureId =
  "hr-suite.payroll-compensation.payroll-processing" as const;
