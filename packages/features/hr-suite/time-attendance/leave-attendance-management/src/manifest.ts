import { leaveAttendanceManagementRouteContracts } from "./contract.ts";

export type LeaveAttendanceManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof leaveAttendanceManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const leaveAttendanceManagementManifest: LeaveAttendanceManagementManifest =
  {
    id: "hr-suite.time-attendance.leave-attendance-management",
    title: "Leave Attendance Management",
    description:
      "Governed package for the legacy HR Suite leave-attendance-management slice at afenda-erp/packages/features/hr-suite/src/time-attendance/leave-attendance-management.",
    domain: "time-attendance",
    packageName: "@repo/features-time-attendance-leave-attendance-management",
    routeContracts: leaveAttendanceManagementRouteContracts,
    suite: "hr-suite",
  };
