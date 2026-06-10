/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed leave-attendance contracts and surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  HrLamRoutePath,
  HrTimeAttendanceLamAuditAction,
  HrTimeLamAuditAction,
  LamMutationResult,
  LamPolicyContext,
} from "./contract.ts";
export { leaveAttendanceManagementManifest } from "./manifest.ts";
export { leaveAttendanceManagementMetadata } from "./metadata.ts";
export {
  canReadLeaveAttendanceManagement,
  canWriteLeaveAttendanceManagement,
} from "./policy.ts";
export {
  leaveAttendanceManagementAcceptanceCoverage,
  leaveAttendanceManagementRequirementCoverage,
} from "./registry/requirement-coverage.ts";
export {
  getLamLeaveEntitlementRuleById,
  getLamLeaveTypeById,
  hrLamRoutePaths,
  hrTimeAttendanceLamAuditActions,
  hrTimeLamAttendanceReadPermission,
  hrTimeLamAttendanceWritePermission,
  hrTimeLamAuditActions,
  hrTimeLamReadPermission,
  hrTimeLamWritePermission,
  lamLeaveEntitlementRulesRouteContracts,
  lamLeaveTypesRouteContracts,
  lamRouteContracts,
  leaveAttendanceManagementFeatureId,
  leaveAttendanceManagementRouteContracts,
  listLamLeaveEntitlementRulesRecords,
  listLamLeaveTypesRecords,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "./server.ts";
export { leaveAttendanceManagementFeatureScope } from "./shared/index.ts";
