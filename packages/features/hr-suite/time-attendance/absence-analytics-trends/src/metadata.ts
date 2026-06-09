export type AbsenceAnalyticsTrendsMetadata = {
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

export const absenceAnalyticsTrendsMetadata: AbsenceAnalyticsTrendsMetadata = {
  id: "hr-suite.time-attendance.absence-analytics-trends",
  title: "Absence Analytics Trends",
  description:
    "Governed metadata for the time-attendance absence-analytics-trends feature extracted from the legacy HR suite.",
  domain: "time-attendance",
  labels: {
    singular: "Absence Analytics Trends record",
    plural: "Absence Analytics Trends records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
