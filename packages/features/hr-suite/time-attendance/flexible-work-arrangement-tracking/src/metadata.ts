export type FlexibleWorkArrangementTrackingMetadata = {
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

export const flexibleWorkArrangementTrackingMetadata: FlexibleWorkArrangementTrackingMetadata =
  {
    id: "hr-suite.time-attendance.flexible-work-arrangement-tracking",
    title: "Flexible Work Arrangement Tracking",
    description:
      "Governed metadata for the time-attendance flexible-work-arrangement-tracking feature extracted from the legacy HR suite.",
    domain: "time-attendance",
    labels: {
      singular: "Flexible Work Arrangement Tracking record",
      plural: "Flexible Work Arrangement Tracking records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
