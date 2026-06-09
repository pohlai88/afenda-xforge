export type LeaveAttendanceManagementMetadata = {
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

export const leaveAttendanceManagementMetadata: LeaveAttendanceManagementMetadata =
  {
    id: "hr-suite.time-attendance.leave-attendance-management",
    title: "Leave Attendance Management",
    description:
      "Governed metadata for the time-attendance leave-attendance-management feature extracted from the legacy HR suite.",
    domain: "time-attendance",
    labels: {
      singular: "Leave Attendance Management record",
      plural: "Leave Attendance Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
