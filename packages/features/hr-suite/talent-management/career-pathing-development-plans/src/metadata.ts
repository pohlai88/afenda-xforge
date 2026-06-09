export type CareerPathingDevelopmentPlansMetadata = {
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

export const careerPathingDevelopmentPlansMetadata: CareerPathingDevelopmentPlansMetadata =
  {
    id: "hr-suite.talent-management.career-pathing-development-plans",
    title: "Career Pathing Development Plans",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "talent-management",
    labels: {
      singular: "Career Pathing Development Plans record",
      plural: "Career Pathing Development Plans records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
