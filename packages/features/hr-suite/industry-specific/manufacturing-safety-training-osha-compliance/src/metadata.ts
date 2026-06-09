export type ManufacturingSafetyTrainingOshaComplianceMetadata = {
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

export const manufacturingSafetyTrainingOshaComplianceMetadata: ManufacturingSafetyTrainingOshaComplianceMetadata =
  {
    id: "hr-suite.industry-specific.manufacturing-safety-training-osha-compliance",
    title: "Manufacturing Safety Training Osha Compliance",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "industry-specific",
    labels: {
      singular: "Manufacturing Safety Training Osha Compliance record",
      plural: "Manufacturing Safety Training Osha Compliance records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
