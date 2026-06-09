export type GovernmentClassificationPayGradesMetadata = {
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

export const governmentClassificationPayGradesMetadata: GovernmentClassificationPayGradesMetadata =
  {
    id: "hr-suite.industry-specific.government-classification-pay-grades",
    title: "Government Classification Pay Grades",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "industry-specific",
    labels: {
      singular: "Government Classification Pay Grades record",
      plural: "Government Classification Pay Grades records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
