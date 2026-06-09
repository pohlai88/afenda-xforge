export type MultiCountryPayrollStatus = "draft" | "active" | "archived";

export type MultiCountryPayrollRecord = {
  id: string;
  name: string;
  status: MultiCountryPayrollStatus;
};

export type ListMultiCountryPayrollQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateMultiCountryPayrollInput = {
  name: string;
};

export type UpdateMultiCountryPayrollInput = {
  id: string;
  name?: string;
  status?: MultiCountryPayrollStatus;
};

export const multiCountryPayrollRouteContracts = [] as const;

export const multiCountryPayrollFeatureId =
  "hr-suite.payroll-compensation.multi-country-payroll" as const;
