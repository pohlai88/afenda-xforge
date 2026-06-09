export type CandidateSelfservicePortalMetadata = {
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

export const candidateSelfservicePortalMetadata: CandidateSelfservicePortalMetadata = {
  id: "hr-suite.talent-management.candidate-selfservice-portal",
  title: "Candidate Selfservice Portal",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Candidate Selfservice Portal record",
    plural: "Candidate Selfservice Portal records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
