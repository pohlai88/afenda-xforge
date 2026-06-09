export type TimeClockIntegrationMetadata = {
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

export const timeClockIntegrationMetadata: TimeClockIntegrationMetadata = {
  id: "hr-suite.time-attendance.time-clock-integration",
  title: "Time Clock Integration",
  description:
    "Governed metadata for the time-attendance time-clock-integration feature extracted from the legacy HR suite.",
  domain: "time-attendance",
  labels: {
    singular: "Time Clock Integration record",
    plural: "Time Clock Integration records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
