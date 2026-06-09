export type SalaryBenchmarkingSurveyStatus = "draft" | "active" | "archived";

export type SalaryBenchmarkingSurveyRecord = {
  id: string;
  name: string;
  status: SalaryBenchmarkingSurveyStatus;
};

export type ListSalaryBenchmarkingSurveyQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateSalaryBenchmarkingSurveyInput = {
  name: string;
};

export type UpdateSalaryBenchmarkingSurveyInput = {
  id: string;
  name?: string;
  status?: SalaryBenchmarkingSurveyStatus;
};

export const salaryBenchmarkingSurveyRouteContracts = [] as const;

export const salaryBenchmarkingSurveyFeatureId =
  "hr-suite.payroll-compensation.salary-benchmarking-survey" as const;
