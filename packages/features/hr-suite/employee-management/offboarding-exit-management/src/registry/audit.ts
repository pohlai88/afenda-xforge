export const offboardingExitManagementAuditEvents = {
  foundationReviewed: "hr.offboarding.foundation.reviewed",
  caseStarted: "hr.offboarding.case.start",
  caseUpdated: "hr.offboarding.case.update",
  caseCompleted: "hr.offboarding.case.complete",
  caseCancelled: "hr.offboarding.case.cancel",
  approvalConfigured: "hr.offboarding.approval.configure",
  approvalSubmitted: "hr.offboarding.approval.submit",
  approvalResubmitted: "hr.offboarding.approval.resubmit",
  clearanceCompleted: "hr.offboarding.clearance.complete",
  clearanceWaived: "hr.offboarding.clearance.waive",
  approvalApproved: "hr.offboarding.approval.approve",
  approvalRejected: "hr.offboarding.approval.reject",
  approvalReopened: "hr.offboarding.approval.reopen",
  approvalEscalated: "hr.offboarding.approval.escalate",
  assetUpdated: "hr.offboarding.asset.update",
  exitInterviewScheduled: "hr.offboarding.exit_interview.schedule",
  exitInterviewFeedbackRecorded: "hr.offboarding.exit_interview.feedback",
  rehireRecorded: "hr.offboarding.rehire.record",
  vacancyTriggered: "hr.offboarding.vacancy.trigger",
  documentLinked: "hr.offboarding.document.link",
  settlementBlockerAdded: "hr.offboarding.settlement.blocker_add",
  settlementBlockerResolved: "hr.offboarding.settlement.blocker_resolve",
  settlementReady: "hr.offboarding.settlement.ready",
} as const;

export type OffboardingExitManagementAuditEvent =
  (typeof offboardingExitManagementAuditEvents)[keyof typeof offboardingExitManagementAuditEvents];

export const offboardingExitManagementAuditEventCatalog: readonly OffboardingExitManagementAuditEvent[] =
  Object.values(
    offboardingExitManagementAuditEvents
  ) as readonly OffboardingExitManagementAuditEvent[];

export const offboardingExitManagementAudit = {
  module: "hr",
  surface: "offboarding-exit-management",
  events: offboardingExitManagementAuditEvents,
} as const;
