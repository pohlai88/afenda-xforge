export type CompensationPlanningModelingMetadata = {
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

export const compensationPlanningModelingMetadata: CompensationPlanningModelingMetadata = {
  id: "hr-suite.payroll-compensation.compensation-planning-modeling",
  title: "Compensation Planning Modeling",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Compensation Planning Modeling record",
    plural: "Compensation Planning Modeling records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
