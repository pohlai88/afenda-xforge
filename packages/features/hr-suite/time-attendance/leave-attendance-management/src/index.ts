/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed leave-attendance contracts and surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateLeaveAttendanceManagementInput,
  HrLamRoutePath,
  HrTimeAttendanceLamAuditAction,
  HrTimeLamAuditAction,
  LeaveAttendanceManagementLeaveApplicationRecord,
  LeaveAttendanceManagementLeaveApplicationStatus,
  LeaveAttendanceManagementLeaveBalanceRecord,
  LeaveAttendanceManagementLeaveUnit,
  LeaveAttendanceManagementRecord,
  LeaveAttendanceManagementStatus,
  ListLeaveAttendanceManagementLeaveApplicationsQuery,
  ListLeaveAttendanceManagementLeaveBalancesQuery,
  ListLeaveAttendanceManagementQuery,
  UpdateLeaveAttendanceManagementInput,
} from "./contract.ts";
export { leaveAttendanceManagementExecutionSurface } from "./execution/index.ts";
export { leaveAttendanceManagementManifest } from "./manifest.ts";
export { leaveAttendanceManagementMetadata } from "./metadata.ts";
export {
  createLeaveAttendanceManagement,
  getLeaveAttendanceManagement,
  hrLamRoutePaths,
  hrTimeAttendanceLamAuditActions,
  hrTimeLamAttendanceReadPermission,
  hrTimeLamAttendanceWritePermission,
  hrTimeLamAuditActions,
  hrTimeLamReadPermission,
  hrTimeLamWritePermission,
  leaveAttendanceManagementFeatureId,
  leaveAttendanceManagementRouteContracts,
  listLeaveAttendanceManagement,
  listLeaveAttendanceManagementLeaveApplications,
  listLeaveAttendanceManagementLeaveBalances,
  resetLeaveAttendanceManagementStoresForTesting,
  updateLeaveAttendanceManagement,
  upsertLeaveAttendanceManagementLeaveApplicationRecord,
  upsertLeaveAttendanceManagementLeaveBalanceRecord,
  upsertLeaveAttendanceManagementRecord,
} from "./server.ts";
export { leaveAttendanceManagementFeatureScope } from "./shared/index.ts";
