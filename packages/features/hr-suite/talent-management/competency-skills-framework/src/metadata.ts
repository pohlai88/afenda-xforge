export type CompetencySkillsFrameworkMetadata = {
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

export const competencySkillsFrameworkMetadata: CompetencySkillsFrameworkMetadata =
  {
    id: "hr-suite.talent-management.competency-skills-framework",
    title: "Competency Skills Framework",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "talent-management",
    labels: {
      singular: "Competency Skills Framework record",
      plural: "Competency Skills Framework records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
