export const employeeLifecycleManagementAuditEvents = {
  stateInitialized: "hr.employee-lifecycle.state.initialized",
  transitionApplied: "hr.employee-lifecycle.state.transition.applied",
  transitionRejected: "hr.employee-lifecycle.state.transition.rejected",
  historyRebuilt: "hr.employee-lifecycle.state.history.rebuilt",
  onboardingStarted: "hr.employee-lifecycle.onboarding.started",
  onboardingTaskCompleted: "hr.employee-lifecycle.onboarding.task.completed",
  onboardingReadyForActivation:
    "hr.employee-lifecycle.onboarding.ready-for-activation",
  onboardingActivated: "hr.employee-lifecycle.onboarding.activated",
  probationStarted: "hr.employee-lifecycle.probation.started",
  probationReviewScheduled: "hr.employee-lifecycle.probation.review.scheduled",
  probationReviewRecorded: "hr.employee-lifecycle.probation.review.recorded",
  probationExtended: "hr.employee-lifecycle.probation.extended",
  probationConfirmationApproved:
    "hr.employee-lifecycle.probation.confirmation.approved",
  probationTerminationRecommended:
    "hr.employee-lifecycle.probation.termination.recommended",
  movementRecorded: "hr.employee-lifecycle.movement.recorded",
  contractStarted: "hr.employee-lifecycle.contract.started",
  contractRenewed: "hr.employee-lifecycle.contract.renewed",
  contractReviewRecorded: "hr.employee-lifecycle.contract.review.recorded",
  contractReminderRecorded: "hr.employee-lifecycle.contract.reminder.recorded",
  contractExpiryStarted: "hr.employee-lifecycle.exit.contract-expiry.started",
  suspensionStarted: "hr.employee-lifecycle.suspension.started",
  suspensionReleased: "hr.employee-lifecycle.suspension.released",
  suspensionResolved: "hr.employee-lifecycle.suspension.resolved",
  resignationStarted: "hr.employee-lifecycle.exit.resignation.started",
  terminationStarted: "hr.employee-lifecycle.exit.termination.started",
  retirementStarted: "hr.employee-lifecycle.exit.retirement.started",
  exitNoticeRecorded: "hr.employee-lifecycle.exit.notice.recorded",
  exitOffboardingTriggered: "hr.employee-lifecycle.exit.offboarding.triggered",
  exitOffboardingHandoffRequested:
    "hr.employee-lifecycle.exit.offboarding.handoff.requested",
  exitArchived: "hr.employee-lifecycle.exit.archived",
  integrationChanged: "hr.employee-lifecycle.integration.changed.v1",
  notificationEnqueued: "hr.employee-lifecycle.notification.enqueued",
} as const;

export type EmployeeLifecycleManagementAuditEvent =
  (typeof employeeLifecycleManagementAuditEvents)[keyof typeof employeeLifecycleManagementAuditEvents];

export type EmployeeLifecycleManagementAuditEventGroup =
  | "state"
  | "onboarding"
  | "probation"
  | "movement"
  | "contract"
  | "suspension"
  | "exit"
  | "integration"
  | "notification";

export const employeeLifecycleManagementStateAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.stateInitialized,
    employeeLifecycleManagementAuditEvents.transitionApplied,
    employeeLifecycleManagementAuditEvents.transitionRejected,
    employeeLifecycleManagementAuditEvents.historyRebuilt,
  ] as const;

export const employeeLifecycleManagementOnboardingAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.onboardingStarted,
    employeeLifecycleManagementAuditEvents.onboardingTaskCompleted,
    employeeLifecycleManagementAuditEvents.onboardingReadyForActivation,
    employeeLifecycleManagementAuditEvents.onboardingActivated,
  ] as const;

export const employeeLifecycleManagementProbationAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.probationStarted,
    employeeLifecycleManagementAuditEvents.probationReviewScheduled,
    employeeLifecycleManagementAuditEvents.probationReviewRecorded,
    employeeLifecycleManagementAuditEvents.probationExtended,
    employeeLifecycleManagementAuditEvents.probationConfirmationApproved,
    employeeLifecycleManagementAuditEvents.probationTerminationRecommended,
  ] as const;

export const employeeLifecycleManagementMovementAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [employeeLifecycleManagementAuditEvents.movementRecorded] as const;

export const employeeLifecycleManagementContractAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.contractStarted,
    employeeLifecycleManagementAuditEvents.contractRenewed,
    employeeLifecycleManagementAuditEvents.contractReviewRecorded,
    employeeLifecycleManagementAuditEvents.contractReminderRecorded,
    employeeLifecycleManagementAuditEvents.contractExpiryStarted,
  ] as const;

export const employeeLifecycleManagementSuspensionAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.suspensionStarted,
    employeeLifecycleManagementAuditEvents.suspensionReleased,
    employeeLifecycleManagementAuditEvents.suspensionResolved,
  ] as const;

export const employeeLifecycleManagementExitAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.resignationStarted,
    employeeLifecycleManagementAuditEvents.terminationStarted,
    employeeLifecycleManagementAuditEvents.retirementStarted,
    employeeLifecycleManagementAuditEvents.contractExpiryStarted,
    employeeLifecycleManagementAuditEvents.exitNoticeRecorded,
    employeeLifecycleManagementAuditEvents.exitOffboardingTriggered,
    employeeLifecycleManagementAuditEvents.exitOffboardingHandoffRequested,
    employeeLifecycleManagementAuditEvents.exitArchived,
  ] as const;

export const employeeLifecycleManagementIntegrationAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [employeeLifecycleManagementAuditEvents.integrationChanged] as const;

export const employeeLifecycleManagementNotificationAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [employeeLifecycleManagementAuditEvents.notificationEnqueued] as const;

export const employeeLifecycleManagementAuditEventGroups: Readonly<
  Record<
    EmployeeLifecycleManagementAuditEventGroup,
    readonly EmployeeLifecycleManagementAuditEvent[]
  >
> = {
  state: employeeLifecycleManagementStateAuditEventCatalog,
  onboarding: employeeLifecycleManagementOnboardingAuditEventCatalog,
  probation: employeeLifecycleManagementProbationAuditEventCatalog,
  movement: employeeLifecycleManagementMovementAuditEventCatalog,
  contract: employeeLifecycleManagementContractAuditEventCatalog,
  suspension: employeeLifecycleManagementSuspensionAuditEventCatalog,
  exit: employeeLifecycleManagementExitAuditEventCatalog,
  integration: employeeLifecycleManagementIntegrationAuditEventCatalog,
  notification: employeeLifecycleManagementNotificationAuditEventCatalog,
} as const;

export const employeeLifecycleManagementAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    ...employeeLifecycleManagementStateAuditEventCatalog,
    ...employeeLifecycleManagementOnboardingAuditEventCatalog,
    ...employeeLifecycleManagementProbationAuditEventCatalog,
    ...employeeLifecycleManagementMovementAuditEventCatalog,
    ...employeeLifecycleManagementContractAuditEventCatalog,
    ...employeeLifecycleManagementSuspensionAuditEventCatalog,
    ...employeeLifecycleManagementExitAuditEventCatalog,
    ...employeeLifecycleManagementIntegrationAuditEventCatalog,
    ...employeeLifecycleManagementNotificationAuditEventCatalog,
  ] as const;

export const employeeLifecycleManagementAudit = {
  module: "hr",
  surface: "employee-lifecycle-management",
  events: employeeLifecycleManagementAuditEvents,
} as const;
