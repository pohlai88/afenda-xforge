export type PerformanceAppraisalsMetadata = {
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

export const performanceAppraisalsMetadata: PerformanceAppraisalsMetadata = {
  id: "hr-suite.talent-management.performance-appraisals",
  title: "Performance Appraisals",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "talent-management",
  labels: {
    singular: "Performance Appraisals record",
    plural: "Performance Appraisals records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
