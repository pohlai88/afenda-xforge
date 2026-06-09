export type LearningManagementSystemLmsMetadata = {
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

export const learningManagementSystemLmsMetadata: LearningManagementSystemLmsMetadata =
  {
    id: "hr-suite.talent-management.learning-management-system-lms",
    title: "Learning Management System Lms",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "talent-management",
    labels: {
      singular: "Learning Management System Lms record",
      plural: "Learning Management System Lms records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
