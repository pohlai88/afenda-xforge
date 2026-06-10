import type {
  LeaveAttendanceManagementCapability,
  LeaveAttendanceManagementCapabilityGroup,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementCapabilityCatalogSchema,
  leaveAttendanceManagementCapabilityGroupsSchema,
  leaveAttendanceManagementCapabilityMapSchema,
  leaveAttendanceManagementCapabilityValueMap,
  leaveAttendanceManagementSensitiveCapabilitiesSchema,
  leaveAttendanceManagementWriteCapabilitiesSchema,
} from "../contracts/index.ts";

export type { LeaveAttendanceManagementCapability } from "../contracts/index.ts";

export const leaveAttendanceManagementCapabilities =
  leaveAttendanceManagementCapabilityMapSchema.parse({
    ...leaveAttendanceManagementCapabilityValueMap,
  });

export const leaveAttendanceManagementCapabilityCatalog = Object.values(
  leaveAttendanceManagementCapabilities
) as readonly LeaveAttendanceManagementCapability[];

export const leaveAttendanceManagementCapabilityGroups: LeaveAttendanceManagementCapabilityGroup[] =
  [
    {
      id: "overview",
      label: "Overview",
      capabilities: [leaveAttendanceManagementCapabilities.overviewRead],
    },
    {
      id: "attendance",
      label: "Attendance",
      capabilities: [
        leaveAttendanceManagementCapabilities.attendanceRead,
        leaveAttendanceManagementCapabilities.attendanceWrite,
        leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
        leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
        leaveAttendanceManagementCapabilities.calendarsRead,
        leaveAttendanceManagementCapabilities.calendarsWrite,
        leaveAttendanceManagementCapabilities.attendancePolicyRead,
        leaveAttendanceManagementCapabilities.attendancePolicyWrite,
      ],
    },
    {
      id: "leave-config",
      label: "Leave Configuration",
      capabilities: [
        leaveAttendanceManagementCapabilities.leaveTypesRead,
        leaveAttendanceManagementCapabilities.leaveTypesWrite,
        leaveAttendanceManagementCapabilities.leaveEntitlementsRead,
        leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
        leaveAttendanceManagementCapabilities.encashmentRead,
        leaveAttendanceManagementCapabilities.encashmentWrite,
      ],
    },
    {
      id: "leave-operations",
      label: "Leave Operations",
      capabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesRead,
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
        leaveAttendanceManagementCapabilities.leaveApplicationsRead,
        leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
        leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
      ],
    },
    {
      id: "integrations",
      label: "Integrations",
      capabilities: [
        leaveAttendanceManagementCapabilities.payrollReferencesRead,
      ],
    },
    {
      id: "audit-reports",
      label: "Audit & Reports",
      capabilities: [
        leaveAttendanceManagementCapabilities.auditRead,
        leaveAttendanceManagementCapabilities.reportsRead,
        leaveAttendanceManagementCapabilities.reportsExport,
      ],
    },
  ];

export const leaveAttendanceManagementSensitiveCapabilities: LeaveAttendanceManagementCapability[] =
  [
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
    leaveAttendanceManagementCapabilities.payrollReferencesRead,
    leaveAttendanceManagementCapabilities.auditRead,
    leaveAttendanceManagementCapabilities.reportsExport,
  ];

export const leaveAttendanceManagementWriteCapabilities: LeaveAttendanceManagementCapability[] =
  [
    leaveAttendanceManagementCapabilities.attendanceWrite,
    leaveAttendanceManagementCapabilities.leaveTypesWrite,
    leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
    leaveAttendanceManagementCapabilities.calendarsWrite,
    leaveAttendanceManagementCapabilities.attendancePolicyWrite,
    leaveAttendanceManagementCapabilities.encashmentWrite,
    leaveAttendanceManagementCapabilities.leaveBalancesWrite,
    leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ];

leaveAttendanceManagementCapabilityCatalogSchema.parse(
  leaveAttendanceManagementCapabilityCatalog
);
leaveAttendanceManagementCapabilityGroupsSchema.parse(
  leaveAttendanceManagementCapabilityGroups
);
leaveAttendanceManagementSensitiveCapabilitiesSchema.parse(
  leaveAttendanceManagementSensitiveCapabilities
);
leaveAttendanceManagementWriteCapabilitiesSchema.parse(
  leaveAttendanceManagementWriteCapabilities
);
