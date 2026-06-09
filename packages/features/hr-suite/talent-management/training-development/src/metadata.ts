export type TrainingDevelopmentMetadata = {
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

export const trainingDevelopmentMetadata: TrainingDevelopmentMetadata = {
  id: "hr-suite.talent-management.training-development",
  title: "Training Development",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Training Development record",
    plural: "Training Development records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
