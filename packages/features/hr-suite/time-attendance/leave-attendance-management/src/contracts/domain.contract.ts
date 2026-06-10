export const hrLamRoutePaths = {
  hub: "/hr/leave-attendance",
  leave: "/hr/leave",
  attendance: "/hr/attendance",
  leaveTypes: "/hr/leave/leave-types",
  leaveEntitlementRules: "/hr/leave/leave-entitlement-rules",
  leaveBalances: "/hr/leave/leave-balances",
  leaveCarryForwardRules: "/hr/leave/leave-carry-forward-rules",
  leaveApplications: "/hr/leave/leave-applications",
  leaveDocuments: "/hr/leave/leave-documents",
  leaveBlackoutPeriods: "/hr/leave/leave-blackout-periods",
  leaveApprovalRoutes: "/hr/leave/leave-approval-routes",
  leaveEntitlements: "/hr/leave/leave-entitlements",
  payrollReferences: "/hr/leave/payroll-references",
  leaveReport: "/hr/leave/leave-report",
  auditTrail: "/hr/leave/audit-trail",
  attendanceRecords: "/hr/attendance/attendance-records",
  attendanceExceptions: "/hr/attendance/attendance-exceptions",
  attendanceCorrections: "/hr/attendance/attendance-corrections",
  attendanceSettings: "/hr/attendance/attendance-settings",
  attendanceSummary: "/hr/attendance/attendance-summary",
  workCalendars: "/hr/attendance/work-calendars",
  holidayCalendars: "/hr/attendance/holiday-calendars",
  attendancePolicies: "/hr/attendance/attendance-policies",
  leaveEncashmentPolicies: "/hr/leave/leave-encashment-policies",
} as const;

export type HrLamRoutePath =
  (typeof hrLamRoutePaths)[keyof typeof hrLamRoutePaths];

export { leaveAttendanceManagementFeatureId } from "../identity.ts";
export {
  type LamLeaveEntitlementRuleRouteContract,
  type LamLeaveTypeRouteContract,
  lamLeaveEntitlementRulesRouteContracts,
  lamLeaveTypesRouteContracts,
  lamRouteContracts,
  lamRouteContracts as leaveAttendanceManagementRouteContracts,
} from "./query.contract.ts";
