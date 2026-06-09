import type {
  ComplianceRegulatoryTrackingAction,
  ComplianceRegulatoryTrackingActionApprovalState,
  ComplianceRegulatoryTrackingActionDecision,
  ComplianceRegulatoryTrackingActionDecisionReason,
} from "../contracts/index.ts";
import {
  complianceRegulatoryTrackingActionApprovalStateSchema,
  complianceRegulatoryTrackingActionCatalogSchema,
  complianceRegulatoryTrackingActionDecisionSchema,
  complianceRegulatoryTrackingActionSchema,
} from "../contracts/index.ts";
import type { CompliancePolicyContext } from "../policy.ts";
import { canReadCompliance, canWriteCompliance } from "../policy.ts";
import { complianceRegulatoryTrackingAuditEvents } from "./audit.ts";
import type { ComplianceRegulatoryTrackingCapability } from "./capability.ts";
import {
  complianceRegulatoryTrackingCapabilities,
  complianceRegulatoryTrackingSensitiveCapabilities,
  complianceRegulatoryTrackingWriteCapabilities,
} from "./capability.ts";

export const complianceRegulatoryTrackingActionRegistry = {
  createObligation: complianceRegulatoryTrackingActionSchema.parse({
    id: "create-obligation",
    label: "Create Obligation",
    description: "Create a new compliance obligation.",
    capability: complianceRegulatoryTrackingCapabilities.obligationsWrite,
    risk: "medium",
    auditEvent: complianceRegulatoryTrackingAuditEvents.obligationCreated,
  }),
  updateObligation: complianceRegulatoryTrackingActionSchema.parse({
    id: "update-obligation",
    label: "Update Obligation",
    description: "Update an existing compliance obligation.",
    capability: complianceRegulatoryTrackingCapabilities.obligationsWrite,
    risk: "medium",
    auditEvent: complianceRegulatoryTrackingAuditEvents.obligationUpdated,
  }),
  recordEvidence: complianceRegulatoryTrackingActionSchema.parse({
    id: "record-evidence",
    label: "Record Evidence",
    description: "Attach or record compliance evidence.",
    capability: complianceRegulatoryTrackingCapabilities.evidenceWrite,
    risk: "high",
    auditEvent: complianceRegulatoryTrackingAuditEvents.evidenceRecorded,
  }),
  verifyEvidence: complianceRegulatoryTrackingActionSchema.parse({
    id: "verify-evidence",
    label: "Verify Evidence",
    description: "Verify sensitive compliance evidence.",
    capability: complianceRegulatoryTrackingCapabilities.evidenceSensitiveRead,
    risk: "high",
    approvalRequired: true,
    auditEvent: complianceRegulatoryTrackingAuditEvents.evidenceVerified,
  }),
  openException: complianceRegulatoryTrackingActionSchema.parse({
    id: "open-exception",
    label: "Open Exception",
    description: "Open a compliance exception.",
    capability: complianceRegulatoryTrackingCapabilities.exceptionsWrite,
    risk: "high",
    auditEvent: complianceRegulatoryTrackingAuditEvents.exceptionOpened,
  }),
  approveWaiver: complianceRegulatoryTrackingActionSchema.parse({
    id: "approve-waiver",
    label: "Approve Waiver",
    description: "Approve a compliance waiver.",
    capability: complianceRegulatoryTrackingCapabilities.waiversApprove,
    risk: "critical",
    approvalRequired: true,
    auditEvent: complianceRegulatoryTrackingAuditEvents.exceptionWaiverApproved,
  }),
  createCorrectiveAction: complianceRegulatoryTrackingActionSchema.parse({
    id: "create-corrective-action",
    label: "Create Corrective Action",
    description: "Create a corrective action for an exception.",
    capability: complianceRegulatoryTrackingCapabilities.correctiveActionsWrite,
    risk: "high",
    auditEvent: complianceRegulatoryTrackingAuditEvents.correctiveActionCreated,
  }),
  closeCorrectiveAction: complianceRegulatoryTrackingActionSchema.parse({
    id: "close-corrective-action",
    label: "Close Corrective Action",
    description: "Close a completed corrective action.",
    capability: complianceRegulatoryTrackingCapabilities.correctiveActionsWrite,
    risk: "high",
    approvalRequired: true,
    auditEvent:
      complianceRegulatoryTrackingAuditEvents.correctiveActionCompleted,
  }),
  acknowledgeAlert: complianceRegulatoryTrackingActionSchema.parse({
    id: "acknowledge-alert",
    label: "Acknowledge Alert",
    description: "Acknowledge a compliance alert.",
    capability: complianceRegulatoryTrackingCapabilities.alertsRead,
    risk: "low",
    auditEvent: complianceRegulatoryTrackingAuditEvents.alertAcknowledged,
  }),
  closeAlert: complianceRegulatoryTrackingActionSchema.parse({
    id: "close-alert",
    label: "Close Alert",
    description: "Close a compliance alert.",
    capability: complianceRegulatoryTrackingCapabilities.alertsRead,
    risk: "low",
    auditEvent: complianceRegulatoryTrackingAuditEvents.alertClosed,
  }),
  recordFiling: complianceRegulatoryTrackingActionSchema.parse({
    id: "record-filing",
    label: "Record Filing",
    description: "Record a mandatory compliance filing.",
    capability: complianceRegulatoryTrackingCapabilities.filingsWrite,
    risk: "high",
    auditEvent: complianceRegulatoryTrackingAuditEvents.filingRecorded,
  }),
  submitFiling: complianceRegulatoryTrackingActionSchema.parse({
    id: "submit-filing",
    label: "Submit Filing",
    description: "Mark a compliance filing as submitted.",
    capability: complianceRegulatoryTrackingCapabilities.filingsWrite,
    risk: "high",
    approvalRequired: true,
    auditEvent: complianceRegulatoryTrackingAuditEvents.filingSubmitted,
  }),
  exportReport: complianceRegulatoryTrackingActionSchema.parse({
    id: "export-report",
    label: "Export Report",
    description: "Export compliance reports.",
    capability: complianceRegulatoryTrackingCapabilities.reportsExport,
    risk: "high",
    approvalRequired: true,
    auditEvent: complianceRegulatoryTrackingAuditEvents.reportExported,
  }),
} as const;

export const complianceRegulatoryTrackingActionCatalog =
  complianceRegulatoryTrackingActionCatalogSchema.parse(
    Object.values(complianceRegulatoryTrackingActionRegistry)
  );

export const complianceRegulatoryTrackingHighRiskActions =
  complianceRegulatoryTrackingActionCatalog.filter(
    (action) => action.risk === "high" || action.risk === "critical"
  );

export const complianceRegulatoryTrackingApprovalActions =
  complianceRegulatoryTrackingActionCatalog.filter(
    (action) => action.approvalRequired === true
  );

const hasDeclaredCapability = (
  action: ComplianceRegulatoryTrackingAction,
  grantedCapabilities: readonly ComplianceRegulatoryTrackingCapability[]
): boolean => grantedCapabilities.includes(action.capability);

const requiresSensitiveAccess = (
  action: ComplianceRegulatoryTrackingAction
): boolean =>
  complianceRegulatoryTrackingSensitiveCapabilities.includes(action.capability);

const requiresWriteAccess = (
  action: ComplianceRegulatoryTrackingAction
): boolean =>
  complianceRegulatoryTrackingWriteCapabilities.includes(action.capability);

const normalizeApprovalState = (
  approvalState?: ComplianceRegulatoryTrackingActionApprovalState
): ComplianceRegulatoryTrackingActionApprovalState =>
  complianceRegulatoryTrackingActionApprovalStateSchema.parse(
    approvalState ?? {}
  );

export function getComplianceRegulatoryTrackingActionDecision(
  action: ComplianceRegulatoryTrackingAction,
  context: CompliancePolicyContext,
  approvalState?: ComplianceRegulatoryTrackingActionApprovalState
): ComplianceRegulatoryTrackingActionDecision {
  const normalizedApprovalState = normalizeApprovalState(approvalState);
  const reasons = new Set<ComplianceRegulatoryTrackingActionDecisionReason>();
  const grantedCapabilities = context.grantedCapabilities ?? [];
  const missingCapabilities: ComplianceRegulatoryTrackingCapability[] = [];
  if (
    grantedCapabilities.length > 0 &&
    !hasDeclaredCapability(action, grantedCapabilities)
  ) {
    missingCapabilities.push(action.capability);
  }
  const sensitiveAccessRequired = requiresSensitiveAccess(action);
  const sensitiveAccessGranted = sensitiveAccessRequired
    ? Boolean(context.canViewSensitive)
    : true;
  const writeAccessGranted = requiresWriteAccess(action)
    ? canWriteCompliance(context)
    : canReadCompliance(context);
  const approvalSatisfied = action.approvalRequired
    ? Boolean(
        normalizedApprovalState.approvedBy ??
          normalizedApprovalState.decision?.approvedBy
      )
    : true;

  if (!writeAccessGranted && grantedCapabilities.length === 0) {
    reasons.add("invalid_context");
  }

  if (missingCapabilities.length > 0) {
    reasons.add("missing_capability");
  }

  if (!sensitiveAccessGranted) {
    reasons.add("sensitive_access_required");
  }

  if (!approvalSatisfied) {
    reasons.add("approval_required");
  }

  if (reasons.size === 0) {
    reasons.add("granted");
  }

  return complianceRegulatoryTrackingActionDecisionSchema.parse({
    actionId: action.id,
    allowed:
      missingCapabilities.length === 0 &&
      sensitiveAccessGranted &&
      writeAccessGranted &&
      approvalSatisfied,
    requiresApproval: action.approvalRequired === true,
    approvalSatisfied,
    sensitiveAccessRequired,
    sensitiveAccessGranted,
    missingCapabilities,
    reasons: Array.from(reasons),
  });
}

export function canExecuteComplianceRegulatoryTrackingAction(
  action: ComplianceRegulatoryTrackingAction,
  context: CompliancePolicyContext,
  approvalState?: ComplianceRegulatoryTrackingActionApprovalState
): boolean {
  return getComplianceRegulatoryTrackingActionDecision(
    action,
    context,
    approvalState
  ).allowed;
}

export function isComplianceRegulatoryTrackingActionAllowed(
  action: ComplianceRegulatoryTrackingAction,
  grantedCapabilities: readonly ComplianceRegulatoryTrackingCapability[]
): boolean {
  return getComplianceRegulatoryTrackingActionDecision(
    action,
    { grantedCapabilities: Array.from(grantedCapabilities) },
    {}
  ).allowed;
}

export type {
  ComplianceRegulatoryTrackingAction,
  ComplianceRegulatoryTrackingActionApprovalState,
  ComplianceRegulatoryTrackingActionDecision,
  ComplianceRegulatoryTrackingActionDecisionReason,
  ComplianceRegulatoryTrackingActionId,
} from "../contracts/index.ts";
