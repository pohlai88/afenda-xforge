export type PayrollProcessingMetadata = {
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

export const payrollProcessingMetadata: PayrollProcessingMetadata = {
  id: "hr-suite.payroll-compensation.payroll-processing",
  title: "Payroll Processing",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Payroll Processing record",
    plural: "Payroll Processing records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
