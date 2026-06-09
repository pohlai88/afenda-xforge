import { salaryBenchmarkingSurveyRouteContracts } from "./contract.ts";

export type SalaryBenchmarkingSurveyManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof salaryBenchmarkingSurveyRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const salaryBenchmarkingSurveyManifest: SalaryBenchmarkingSurveyManifest = {
  id: "hr-suite.payroll-compensation.salary-benchmarking-survey",
  title: "Salary Benchmarking Survey",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/salary-benchmarking-survey.",
  domain: "payroll-compensation",
  packageName: "@repo/features-payroll-compensation-salary-benchmarking-survey",
  routeContracts: salaryBenchmarkingSurveyRouteContracts,
  suite: "hr-suite",
};
