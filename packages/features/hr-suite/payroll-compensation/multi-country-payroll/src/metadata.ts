export type MultiCountryPayrollMetadata = {
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

export const multiCountryPayrollMetadata: MultiCountryPayrollMetadata = {
  id: "hr-suite.payroll-compensation.multi-country-payroll",
  title: "Multi Country Payroll",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Multi Country Payroll record",
    plural: "Multi Country Payroll records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
