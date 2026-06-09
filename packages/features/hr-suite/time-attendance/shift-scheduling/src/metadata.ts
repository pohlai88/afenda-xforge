export type ShiftSchedulingMetadata = {
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

export const shiftSchedulingMetadata: ShiftSchedulingMetadata = {
  id: "hr-suite.time-attendance.shift-scheduling",
  title: "Shift Scheduling",
  description:
    "Governed metadata for the shift-scheduling feature extracted from the legacy HR suite.",
  domain: "time-attendance",
  labels: {
    singular: "Shift Scheduling record",
    plural: "Shift Scheduling records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
