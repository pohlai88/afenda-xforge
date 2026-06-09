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
  suspensionStarted: "hr.employee-lifecycle.suspension.started",
  suspensionReleased: "hr.employee-lifecycle.suspension.released",
  suspensionResolved: "hr.employee-lifecycle.suspension.resolved",
} as const;

export type EmployeeLifecycleManagementAuditEvent =
  (typeof employeeLifecycleManagementAuditEvents)[keyof typeof employeeLifecycleManagementAuditEvents];

export type EmployeeLifecycleManagementAuditEventGroup =
  | "state"
  | "onboarding"
  | "probation"
  | "movement"
  | "contract"
  | "suspension";

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
  ] as const;

export const employeeLifecycleManagementSuspensionAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    employeeLifecycleManagementAuditEvents.suspensionStarted,
    employeeLifecycleManagementAuditEvents.suspensionReleased,
    employeeLifecycleManagementAuditEvents.suspensionResolved,
  ] as const;

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
} as const;

export const employeeLifecycleManagementAuditEventCatalog: readonly EmployeeLifecycleManagementAuditEvent[] =
  [
    ...employeeLifecycleManagementStateAuditEventCatalog,
    ...employeeLifecycleManagementOnboardingAuditEventCatalog,
    ...employeeLifecycleManagementProbationAuditEventCatalog,
    ...employeeLifecycleManagementMovementAuditEventCatalog,
    ...employeeLifecycleManagementContractAuditEventCatalog,
    ...employeeLifecycleManagementSuspensionAuditEventCatalog,
  ] as const;

export const employeeLifecycleManagementAudit = {
  module: "hr",
  surface: "employee-lifecycle-management",
  events: employeeLifecycleManagementAuditEvents,
} as const;
