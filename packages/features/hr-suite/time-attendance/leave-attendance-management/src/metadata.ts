import { lamAttendanceStatusLabels } from "./shared/attendance-status.ts";
import { lamLeaveBalanceFieldLabels } from "./shared/balance.ts";
import { lamEntitlementScopeFieldLabels } from "./shared/entitlement-scope.ts";
import { lamLeaveDocumentFieldLabels } from "./shared/leave-application-document.ts";
import { lamLeaveBlackoutPeriodFieldLabels } from "./shared/leave-application-policy-validation.ts";
import { lamLeaveApplicationSubmitFieldLabels } from "./shared/leave-application-submit.ts";
import {
  lamLeaveApprovalFallbackToHrFieldLabels,
  lamLeaveApprovalFallbackToHrRules,
} from "./shared/leave-approval-fallback-to-hr.ts";
import { lamLeaveApprovalStepIdentityFieldLabels } from "./shared/leave-approval-step-enforcement.ts";
import {
  lamLeaveApplicationWorkflowFieldLabels,
  lamLeaveApprovalRouteFieldLabels,
  lamLeaveApprovalStepKindLabels,
} from "./shared/leave-approval-workflow.ts";
import { lamLeaveTypeFieldLabels } from "./shared/leave-type-policy-group.ts";

export type LeaveAttendanceManagementMetadata = {
  attendanceStatusLabels: typeof lamAttendanceStatusLabels;
  description: string;
  domain: string;
  entitlementScopeFieldLabels: typeof lamEntitlementScopeFieldLabels;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  leaveApplicationSubmitFieldLabels: typeof lamLeaveApplicationSubmitFieldLabels;
  leaveApplicationWorkflowFieldLabels: typeof lamLeaveApplicationWorkflowFieldLabels;
  leaveApprovalRouteFieldLabels: typeof lamLeaveApprovalRouteFieldLabels;
  leaveApprovalFallbackToHrFieldLabels: typeof lamLeaveApprovalFallbackToHrFieldLabels;
  leaveApprovalFallbackToHrRules: typeof lamLeaveApprovalFallbackToHrRules;
  leaveApprovalStepIdentityFieldLabels: typeof lamLeaveApprovalStepIdentityFieldLabels;
  leaveApprovalStepKindLabels: typeof lamLeaveApprovalStepKindLabels;
  leaveBalanceFieldLabels: typeof lamLeaveBalanceFieldLabels;
  leaveBlackoutPeriodFieldLabels: typeof lamLeaveBlackoutPeriodFieldLabels;
  leaveDocumentFieldLabels: typeof lamLeaveDocumentFieldLabels;
  leaveTypeFieldLabels: typeof lamLeaveTypeFieldLabels;
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

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
export {
  lamEntitlementDimensionAliases,
  lamEntitlementScopeFieldLabels,
  resolveEntitlementDimensionField,
} from "./shared/entitlement-scope.ts";
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
  lamLeaveApprovalFallbackToHrFieldLabels,
  lamLeaveApprovalFallbackToHrRules,
} from "./shared/leave-approval-fallback-to-hr.ts";
export {
  assertActorAuthorizedForApprovalStep,
  lamLeaveApprovalStepIdentityFieldLabels,
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
    attendanceStatusLabels: lamAttendanceStatusLabels,
    entitlementScopeFieldLabels: lamEntitlementScopeFieldLabels,
    leaveApplicationSubmitFieldLabels: lamLeaveApplicationSubmitFieldLabels,
    leaveApplicationWorkflowFieldLabels: lamLeaveApplicationWorkflowFieldLabels,
    leaveApprovalRouteFieldLabels: lamLeaveApprovalRouteFieldLabels,
    leaveApprovalFallbackToHrFieldLabels:
      lamLeaveApprovalFallbackToHrFieldLabels,
    leaveApprovalFallbackToHrRules: lamLeaveApprovalFallbackToHrRules,
    leaveApprovalStepIdentityFieldLabels:
      lamLeaveApprovalStepIdentityFieldLabels,
    leaveApprovalStepKindLabels: lamLeaveApprovalStepKindLabels,
    leaveBalanceFieldLabels: lamLeaveBalanceFieldLabels,
    leaveBlackoutPeriodFieldLabels: lamLeaveBlackoutPeriodFieldLabels,
    leaveDocumentFieldLabels: lamLeaveDocumentFieldLabels,
    leaveTypeFieldLabels: lamLeaveTypeFieldLabels,
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
