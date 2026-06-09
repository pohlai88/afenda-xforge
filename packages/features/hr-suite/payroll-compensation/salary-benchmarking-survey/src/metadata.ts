export type SalaryBenchmarkingSurveyMetadata = {
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

export const salaryBenchmarkingSurveyMetadata: SalaryBenchmarkingSurveyMetadata =
  {
    id: "hr-suite.payroll-compensation.salary-benchmarking-survey",
    title: "Salary Benchmarking Survey",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "payroll-compensation",
    labels: {
      singular: "Salary Benchmarking Survey record",
      plural: "Salary Benchmarking Survey records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
