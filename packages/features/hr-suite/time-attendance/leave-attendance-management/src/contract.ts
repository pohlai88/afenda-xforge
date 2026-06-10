export type { HrLamRoutePath } from "./contracts/domain.contract.ts";
export type {
  HrTimeAttendanceLamAuditAction,
  HrTimeLamAuditAction,
  LamMutationResult,
  LamPolicyContext,
} from "./contracts/index.ts";
export * from "./contracts/index.ts";

export {
  hrLamRoutePaths,
  hrTimeAttendanceLamAuditActions,
  hrTimeLamAttendanceReadPermission,
  hrTimeLamAttendanceWritePermission,
  hrTimeLamAuditActions,
  hrTimeLamReadPermission,
  hrTimeLamWritePermission,
  leaveAttendanceManagementFeatureId,
  leaveAttendanceManagementRouteContracts,
} from "./contracts/index.ts";
export {
  type LamAttendanceStatus,
  lamAttendanceStatusValues,
} from "./schema.ts";
export {
  defaultLamAttendanceCorrectionsEnabled,
  resolveLamAttendanceCorrectionsEnabled,
} from "./shared/attendance-corrections-enabled.ts";
export {
  lamAttendanceStatusAliases,
  lamAttendanceStatusLabels,
  normalizeAttendanceStatusInput,
} from "./shared/attendance-status.ts";
export {
  computeRemainingBalance,
  lamLeaveBalanceFieldLabels,
  withComputedRemainingBalance,
} from "./shared/balance.ts";
export { lamCompanyAttendanceSettingsFieldLabels } from "./shared/company-attendance-settings.ts";
export {
  lamEntitlementDimensionAliases,
  lamEntitlementScopeFieldLabels,
  resolveEntitlementDimensionField,
} from "./shared/entitlement-scope.ts";
export {
  assertLeaveApplicationAvailableBalance,
  type LeaveApplicationBalancePhase,
  resolveAvailableLeaveBalanceForApplication,
} from "./shared/leave-application-balance.ts";
export {
  lamLeaveDocumentFieldLabels,
  resolveSupportingDocument,
} from "./shared/leave-application-document.ts";
export {
  assertLeaveApplicationPolicyGates,
  buildLeaveApplicationScopeProfile,
  type LeaveApplicationPolicyValidationInput,
  lamLeaveBlackoutPeriodFieldLabels,
  requiresLeaveApplicationEmployeeProfile,
} from "./shared/leave-application-policy-validation.ts";
export {
  bindEmployeeLeaveApplicationSubmitInput,
  lamLeaveApplicationSubmitFieldLabels,
  mapLamMutationErrorToHttpStatus,
} from "./shared/leave-application-submit.ts";
export {
  assertRouteStepHrFallbackConfiguration,
  isHrFallbackEligibleStepKind,
  lamLeaveApprovalFallbackToHrFieldLabels,
  lamLeaveApprovalFallbackToHrRules,
  stepSupportsHrFallback,
} from "./shared/leave-approval-fallback-to-hr.ts";
export {
  type ApprovalStepAuthorizationOutcome,
  assertActorAuthorizedForApprovalStep,
  evaluateApprovalStepAuthorization,
  type LamApprovalWorkflowSubject,
  lamLeaveApprovalStepIdentityFieldLabels,
  requireActorAuthorizedForApprovalStep,
  requiresLeaveApprovalStepIdentityEnforcement,
  resolveLeaveApprovalActorEmployeeId,
} from "./shared/leave-approval-step-enforcement.ts";
export {
  assertLeaveApplicationReadyForApprovalDecision,
  isLeaveApplicationInConfiguredWorkflow,
  type LeaveApprovalProgress,
  lamLeaveApplicationWorkflowFieldLabels,
  lamLeaveApprovalRouteFieldLabels,
  lamLeaveApprovalStepKindLabels,
  resolveLeaveApprovalProgress,
} from "./shared/leave-approval-workflow.ts";
export {
  assertLeaveTypeAccessibleToPolicyGroup,
  isLeaveTypeAccessibleToEmployeePolicyGroup,
  lamLeaveTypeFieldLabels,
  leaveTypeMatchesPolicyGroupFilter,
  normalizePolicyGroupId,
  policyGroupIdsMatch,
} from "./shared/leave-type-policy-group.ts";
