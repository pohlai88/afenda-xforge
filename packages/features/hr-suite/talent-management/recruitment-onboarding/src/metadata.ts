export type RecruitmentOnboardingMetadata = {
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

export const recruitmentOnboardingMetadata: RecruitmentOnboardingMetadata = {
  id: "hr-suite.talent-management.recruitment-onboarding",
  title: "Recruitment Onboarding",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Recruitment Onboarding record",
    plural: "Recruitment Onboarding records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
