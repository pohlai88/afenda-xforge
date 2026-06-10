import { z } from "zod";

const capabilityStringSchema = z.string().trim().min(1);

export const leaveAttendanceManagementCapabilityValueMap = {
  overviewRead: "hr.lam.overview.read",
  attendanceRead: "hr.lam.attendance.read",
  attendanceWrite: "hr.lam.attendance.write",
  leaveTypesRead: "hr.lam.leave-types.read",
  leaveTypesWrite: "hr.lam.leave-types.write",
  leaveEntitlementsRead: "hr.lam.leave-entitlements.read",
  leaveEntitlementsWrite: "hr.lam.leave-entitlements.write",
  leaveBalancesRead: "hr.lam.leave-balances.read",
  leaveBalancesWrite: "hr.lam.leave-balances.write",
  leaveApplicationsRead: "hr.lam.leave-applications.read",
  leaveApplicationsWrite: "hr.lam.leave-applications.write",
  leaveApplicationsApprove: "hr.lam.leave-applications.approve",
  attendanceCorrectionsRead: "hr.lam.attendance-corrections.read",
  attendanceCorrectionsWrite: "hr.lam.attendance-corrections.write",
  payrollReferencesRead: "hr.lam.payroll-references.read",
  auditRead: "hr.lam.audit.read",
  reportsRead: "hr.lam.reports.read",
  reportsExport: "hr.lam.reports.export",
  calendarsRead: "hr.lam.calendars.read",
  calendarsWrite: "hr.lam.calendars.write",
  attendancePolicyRead: "hr.lam.attendance-policy.read",
  attendancePolicyWrite: "hr.lam.attendance-policy.write",
  encashmentRead: "hr.lam.encashment.read",
  encashmentWrite: "hr.lam.encashment.write",
} as const;

export const leaveAttendanceManagementCapabilityValues = Object.values(
  leaveAttendanceManagementCapabilityValueMap
) as [
  (typeof leaveAttendanceManagementCapabilityValueMap)[keyof typeof leaveAttendanceManagementCapabilityValueMap],
  ...(typeof leaveAttendanceManagementCapabilityValueMap)[keyof typeof leaveAttendanceManagementCapabilityValueMap][],
];

export const leaveAttendanceManagementCapabilityMapSchema = z.object({
  overviewRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.overviewRead
  ),
  attendanceRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendanceRead
  ),
  attendanceWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendanceWrite
  ),
  leaveTypesRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveTypesRead
  ),
  leaveTypesWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveTypesWrite
  ),
  leaveEntitlementsRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveEntitlementsRead
  ),
  leaveEntitlementsWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveEntitlementsWrite
  ),
  leaveBalancesRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveBalancesRead
  ),
  leaveBalancesWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveBalancesWrite
  ),
  leaveApplicationsRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveApplicationsRead
  ),
  leaveApplicationsWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveApplicationsWrite
  ),
  leaveApplicationsApprove: z.literal(
    leaveAttendanceManagementCapabilityValueMap.leaveApplicationsApprove
  ),
  attendanceCorrectionsRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendanceCorrectionsRead
  ),
  attendanceCorrectionsWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendanceCorrectionsWrite
  ),
  payrollReferencesRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.payrollReferencesRead
  ),
  auditRead: z.literal(leaveAttendanceManagementCapabilityValueMap.auditRead),
  reportsRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.reportsRead
  ),
  reportsExport: z.literal(
    leaveAttendanceManagementCapabilityValueMap.reportsExport
  ),
  calendarsRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.calendarsRead
  ),
  calendarsWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.calendarsWrite
  ),
  attendancePolicyRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendancePolicyRead
  ),
  attendancePolicyWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.attendancePolicyWrite
  ),
  encashmentRead: z.literal(
    leaveAttendanceManagementCapabilityValueMap.encashmentRead
  ),
  encashmentWrite: z.literal(
    leaveAttendanceManagementCapabilityValueMap.encashmentWrite
  ),
});

export type LeaveAttendanceManagementCapabilityMap = z.infer<
  typeof leaveAttendanceManagementCapabilityMapSchema
>;

export const leaveAttendanceManagementCapabilitySchema = z.enum(
  leaveAttendanceManagementCapabilityValues
);

export type LeaveAttendanceManagementCapability = z.infer<
  typeof leaveAttendanceManagementCapabilitySchema
>;

export const leaveAttendanceManagementCapabilityCatalogSchema = z
  .array(leaveAttendanceManagementCapabilitySchema)
  .min(1);

export const leaveAttendanceManagementCapabilityGroupSchema = z.object({
  id: capabilityStringSchema,
  label: capabilityStringSchema,
  capabilities: z.array(leaveAttendanceManagementCapabilitySchema).min(1),
});

export const leaveAttendanceManagementCapabilityGroupsSchema = z
  .array(leaveAttendanceManagementCapabilityGroupSchema)
  .min(1);

export const leaveAttendanceManagementSensitiveCapabilitiesSchema = z
  .array(leaveAttendanceManagementCapabilitySchema)
  .min(1);

export const leaveAttendanceManagementWriteCapabilitiesSchema = z
  .array(leaveAttendanceManagementCapabilitySchema)
  .min(1);

export type LeaveAttendanceManagementCapabilityGroup = z.infer<
  typeof leaveAttendanceManagementCapabilityGroupSchema
>;
