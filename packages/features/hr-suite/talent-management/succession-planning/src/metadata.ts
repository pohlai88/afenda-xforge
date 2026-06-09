export type SuccessionPlanningMetadata = {
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

export const successionPlanningMetadata: SuccessionPlanningMetadata = {
  id: "hr-suite.talent-management.succession-planning",
  title: "Succession Planning",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Succession Planning record",
    plural: "Succession Planning records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
