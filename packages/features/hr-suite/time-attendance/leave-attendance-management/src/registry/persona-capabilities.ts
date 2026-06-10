import type { LeaveAttendanceManagementCapability } from "../contracts/index.ts";
import { leaveAttendanceManagementCapabilities } from "./capability.ts";

export const lamPersonaRoleValues = [
  "employee",
  "manager",
  "hr",
  "payroll",
  "auditor",
] as const;

export type LamPersonaRole = (typeof lamPersonaRoleValues)[number];

export const lamPersonaCapabilityPresets: Record<
  LamPersonaRole,
  readonly LeaveAttendanceManagementCapability[]
> = {
  employee: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
    leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
    leaveAttendanceManagementCapabilities.attendanceRead,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
    leaveAttendanceManagementCapabilities.leaveTypesRead,
    leaveAttendanceManagementCapabilities.reportsRead,
  ],
  manager: [
    leaveAttendanceManagementCapabilities.overviewRead,
    leaveAttendanceManagementCapabilities.attendanceRead,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
    leaveAttendanceManagementCapabilities.leaveTypesRead,
    leaveAttendanceManagementCapabilities.leaveEntitlementsRead,
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
    leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
    leaveAttendanceManagementCapabilities.reportsRead,
    leaveAttendanceManagementCapabilities.reportsExport,
  ],
  hr: Object.values(leaveAttendanceManagementCapabilities),
  payroll: [
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
    leaveAttendanceManagementCapabilities.payrollReferencesRead,
    leaveAttendanceManagementCapabilities.reportsRead,
    leaveAttendanceManagementCapabilities.reportsExport,
  ],
  auditor: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
    leaveAttendanceManagementCapabilities.attendanceRead,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
    leaveAttendanceManagementCapabilities.auditRead,
    leaveAttendanceManagementCapabilities.reportsRead,
  ],
};
