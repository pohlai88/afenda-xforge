export type BenefitsAdministrationMetadata = {
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

export const benefitsAdministrationMetadata: BenefitsAdministrationMetadata = {
  id: "hr-suite.payroll-compensation.benefits-administration",
  title: "Benefits Administration",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Benefits Administration record",
    plural: "Benefits Administration records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
