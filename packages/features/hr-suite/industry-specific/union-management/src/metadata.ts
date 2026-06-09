export type UnionManagementMetadata = {
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

export const unionManagementMetadata: UnionManagementMetadata = {
  id: "hr-suite.industry-specific.union-management",
  title: "Union Management",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "industry-specific",
  labels: {
    singular: "Union Management record",
    plural: "Union Management records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
