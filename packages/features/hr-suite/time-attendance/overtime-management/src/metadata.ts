export type OvertimeManagementMetadata = {
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

export const overtimeManagementMetadata: OvertimeManagementMetadata = {
  id: "hr-suite.time-attendance.overtime-management",
  title: "Overtime Management",
  description:
    "Governed metadata for the time-attendance overtime-management feature extracted from the legacy HR suite.",
  domain: "time-attendance",
  labels: {
    singular: "Overtime Management record",
    plural: "Overtime Management records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
