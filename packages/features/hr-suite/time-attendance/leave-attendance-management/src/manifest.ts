import { leaveAttendanceManagementRouteContracts } from "./contracts/domain.contract.ts";
import type { LeaveAttendanceManagementCapability } from "./contracts/index.ts";
import {
  hrSuiteFeatureScope,
  leaveAttendanceManagementFeatureScope,
} from "./feature-scope.ts";
import { leaveAttendanceManagementMetadata } from "./metadata.ts";
import {
  leaveAttendanceManagementAcceptanceCoverage,
  leaveAttendanceManagementAudit,
  leaveAttendanceManagementCapabilityCatalog,
  leaveAttendanceManagementCapabilityGroups,
  leaveAttendanceManagementRequirementCoverage,
  leaveAttendanceManagementSensitiveCapabilities,
  leaveAttendanceManagementWriteCapabilities,
} from "./registry/index.ts";
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

export type LeaveAttendanceManagementManifest = {
  acceptanceCriteria: typeof leaveAttendanceManagementAcceptanceCoverage;
  attendanceStatusLabels: typeof lamAttendanceStatusLabels;
  audit: typeof leaveAttendanceManagementAudit;
  capabilities: readonly LeaveAttendanceManagementCapability[];
  capabilityGroups: typeof leaveAttendanceManagementCapabilityGroups;
  description: string;
  domain: string;
  entitlementScopeFieldLabels: typeof lamEntitlementScopeFieldLabels;
  id: string;
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
  packageName: string;
  requirementCoverage: typeof leaveAttendanceManagementRequirementCoverage;
  routeContracts: typeof leaveAttendanceManagementRouteContracts;
  sensitiveCapabilities: LeaveAttendanceManagementCapability[];
  source: typeof hrSuiteFeatureScope.source;
  suite: typeof hrSuiteFeatureScope.suite;
  title: string;
  writeCapabilities: LeaveAttendanceManagementCapability[];
};

export const leaveAttendanceManagementManifest: LeaveAttendanceManagementManifest =
  {
    id: leaveAttendanceManagementMetadata.id,
    title: leaveAttendanceManagementMetadata.title,
    description: leaveAttendanceManagementMetadata.description,
    domain: leaveAttendanceManagementMetadata.domain,
    packageName: leaveAttendanceManagementFeatureScope.packageName,
    source: hrSuiteFeatureScope.source,
    suite: hrSuiteFeatureScope.suite,
    routeContracts: leaveAttendanceManagementRouteContracts,
    capabilities: leaveAttendanceManagementCapabilityCatalog,
    capabilityGroups: leaveAttendanceManagementCapabilityGroups,
    requirementCoverage: leaveAttendanceManagementRequirementCoverage,
    acceptanceCriteria: leaveAttendanceManagementAcceptanceCoverage,
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
    audit: leaveAttendanceManagementAudit,
    sensitiveCapabilities: leaveAttendanceManagementSensitiveCapabilities,
    writeCapabilities: leaveAttendanceManagementWriteCapabilities,
  };
