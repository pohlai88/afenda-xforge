import "server-only";

import { openOffboardingCase } from "../../offboarding-exit-management/src/server.ts";
import {
  recordEmployeeLifecycleContractReminder,
  startEmployeeLifecycleOnboarding,
} from "./actions.ts";
import type {
  EmployeeLifecycleAutomationAction,
  EmployeeLifecycleBootstrapProfile,
  EmployeeLifecycleNotificationIntent,
  EmployeeLifecycleOffboardingHandoffRecord,
  RunEmployeeLifecycleAutomationInput,
} from "./contracts/automation.contract.ts";
import {
  employeeLifecycleAutomationActionSchema,
  employeeLifecycleNotificationIntentSchema,
  employeeLifecycleOffboardingHandoffRecordSchema,
  runEmployeeLifecycleAutomationInputSchema,
} from "./contracts/automation.contract.ts";
import { buildEmployeeLifecycleOffboardingHandoffProjection } from "./integration.ts";
import {
  getEmployeeLifecycleContractStatus,
  getEmployeeLifecycleExitStatus,
  getEmployeeLifecycleOnboardingStatus,
  getEmployeeLifecycleProbationStatus,
  getEmployeeLifecycleSuspensionStatus,
} from "./queries.ts";
import type { EmployeeLifecycleRepositoryScope } from "./repository.ts";
import {
  findEmployeeLifecycleNotificationIntentByDedupeKey,
  findEmployeeLifecycleOffboardingHandoffByDedupeKey,
  findEmployeeLifecycleStateByEmployeeId,
  listEmployeeLifecycleNotificationIntents,
  loadEmployeeLifecycleRepository,
  upsertEmployeeLifecycleNotificationIntent,
  upsertEmployeeLifecycleOffboardingHandoff,
} from "./repository.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleExitReadModel,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleSuspensionReadModel,
} from "./schema.ts";

const toScope = (
  input?: Pick<EmployeeLifecycleBootstrapProfile, "companyId" | "tenantId">
): EmployeeLifecycleRepositoryScope | undefined =>
  input?.companyId || input?.tenantId
    ? {
        companyId: input.companyId ?? undefined,
        tenantId: input.tenantId ?? undefined,
      }
    : undefined;

const normalizeBootstrapProfile = (
  profile: EmployeeLifecycleBootstrapProfile
): {
  employeeId: string;
  companyId?: string;
  tenantId?: string;
  employmentType?: string;
  legalEntityCode?: string;
  departmentId?: string;
  workLocationCode?: string;
  roleTitle?: string;
  roleCode?: string;
} => ({
  employeeId: profile.employeeId,
  companyId: profile.companyId ?? undefined,
  tenantId: profile.tenantId ?? undefined,
  employmentType: profile.employmentType ?? undefined,
  legalEntityCode: profile.legalEntityCode ?? undefined,
  departmentId: profile.departmentId ?? undefined,
  workLocationCode: profile.workLocationCode ?? undefined,
  roleTitle: profile.roleTitle ?? undefined,
  roleCode: profile.roleCode ?? undefined,
});

const buildAutomationAction = (
  input: Omit<EmployeeLifecycleAutomationAction, "id">
): EmployeeLifecycleAutomationAction =>
  employeeLifecycleAutomationActionSchema.parse({
    ...input,
    id: `${input.employeeId}:${input.kind}:${input.dedupeKey}`,
  });

const buildNotificationIntent = (
  input: Omit<EmployeeLifecycleNotificationIntent, "id" | "createdAt">
): EmployeeLifecycleNotificationIntent =>
  employeeLifecycleNotificationIntentSchema.parse({
    ...input,
    id: `${input.employeeId}:${input.kind}:${input.dedupeKey}`,
    createdAt: new Date(),
  });

const buildOffboardingHandoffRecord = (
  input: Omit<EmployeeLifecycleOffboardingHandoffRecord, "id" | "createdAt">
): EmployeeLifecycleOffboardingHandoffRecord =>
  employeeLifecycleOffboardingHandoffRecordSchema.parse({
    ...input,
    id: `${input.employeeId}:handoff:${input.dedupeKey}`,
    createdAt: new Date(),
  });

const buildOnboardingAutoStartAction = (
  profile: EmployeeLifecycleBootstrapProfile
): EmployeeLifecycleAutomationAction =>
  buildAutomationAction({
    kind: "onboarding_auto_start",
    employeeId: profile.employeeId,
    companyId: profile.companyId ?? null,
    tenantId: profile.tenantId ?? null,
    dueAt: null,
    sourceEventId: null,
    dedupeKey: "onboarding:auto-start",
    summary: "Start onboarding for a newly created employee record",
    reason:
      "Employee record contains enough employment context for onboarding bootstrap",
    metadata: profile,
  });

const buildProbationDueAction = (
  probation: EmployeeLifecycleProbationReadModel
): EmployeeLifecycleAutomationAction =>
  buildAutomationAction({
    kind: "probation_review_due",
    employeeId: probation.employeeId,
    companyId: probation.companyId ?? null,
    tenantId: probation.tenantId ?? null,
    dueAt: probation.reviewDueAt,
    sourceEventId: probation.events.at(-1)?.id ?? null,
    dedupeKey: `probation:${probation.reviewDueAt.toISOString()}`,
    summary: probation.isOverdue
      ? "Probation review is overdue"
      : "Probation review is due",
    reason: probation.isOverdue
      ? "Probation review due date has passed without review completion"
      : "Probation review due date has been reached",
    metadata: {
      workflowStatus: probation.workflowStatus,
      isOverdue: probation.isOverdue,
    },
  });

const buildContractReminderDueAction = (
  contract: EmployeeLifecycleContractReadModel
): EmployeeLifecycleAutomationAction =>
  buildAutomationAction({
    kind: "contract_reminder_due",
    employeeId: contract.employeeId,
    companyId: contract.companyId ?? null,
    tenantId: contract.tenantId ?? null,
    dueAt: contract.renewalReminderDueAt ?? contract.expiryAt,
    sourceEventId: contract.events.at(-1)?.id ?? null,
    dedupeKey: `contract-reminder:${(
      contract.renewalReminderDueAt ?? contract.expiryAt
    ).toISOString()}`,
    summary: "Contract renewal reminder is due",
    reason: "Contract reminder threshold has been reached",
    metadata: {
      contractStatus: contract.contractStatus,
      expiryAt: contract.expiryAt.toISOString(),
    },
  });

const buildContractReviewDueAction = (
  contract: EmployeeLifecycleContractReadModel
): EmployeeLifecycleAutomationAction =>
  buildAutomationAction({
    kind: "contract_review_due",
    employeeId: contract.employeeId,
    companyId: contract.companyId ?? null,
    tenantId: contract.tenantId ?? null,
    dueAt: contract.renewalReviewDueAt ?? contract.expiryAt,
    sourceEventId: contract.events.at(-1)?.id ?? null,
    dedupeKey: `contract-review:${(
      contract.renewalReviewDueAt ?? contract.expiryAt
    ).toISOString()}`,
    summary: contract.isExpired
      ? "Contract renewal review is overdue"
      : "Contract renewal review is due",
    reason: contract.isExpired
      ? "Contract has expired without renewal review completion"
      : "Contract review threshold has been reached",
    metadata: {
      contractStatus: contract.contractStatus,
      expiryAt: contract.expiryAt.toISOString(),
      isExpired: contract.isExpired,
    },
  });

const buildOffboardingHandoffAction = (
  exitStatus: EmployeeLifecycleExitReadModel
): EmployeeLifecycleAutomationAction =>
  buildAutomationAction({
    kind: "offboarding_handoff",
    employeeId: exitStatus.employeeId,
    companyId: exitStatus.companyId ?? null,
    tenantId: exitStatus.tenantId ?? null,
    dueAt:
      exitStatus.lastWorkingAt ??
      exitStatus.noticeEndsAt ??
      exitStatus.startedAt,
    sourceEventId: exitStatus.events.at(-1)?.id ?? null,
    dedupeKey: `offboarding-handoff:${exitStatus.exitKind}:${exitStatus.startedAt.toISOString()}`,
    summary: "Create offboarding handoff for an active exit lifecycle",
    reason:
      "Exit lifecycle has started and no offboarding handoff has been recorded",
    metadata: {
      exitKind: exitStatus.exitKind,
      exitStatus: exitStatus.exitStatus,
      finalStage: exitStatus.finalStage,
      startedAt: exitStatus.startedAt.toISOString(),
    },
  });

const canBootstrapOnboarding = (
  profile: EmployeeLifecycleBootstrapProfile
): boolean =>
  Boolean(
    profile.employeeId &&
      (profile.employmentType ||
        profile.legalEntityCode ||
        profile.departmentId ||
        profile.workLocationCode ||
        profile.roleTitle ||
        profile.roleCode)
  );

export function evaluateEmployeeLifecycleAutomation(
  input: RunEmployeeLifecycleAutomationInput,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleAutomationAction[] {
  const parsedInput = runEmployeeLifecycleAutomationInputSchema.parse(input);
  const now = parsedInput.now ?? new Date();
  const resolvedScope =
    scope ??
    toScope(parsedInput.employeeProfile) ??
    (parsedInput.employeeId ? scope : undefined);

  const repository = loadEmployeeLifecycleRepository(resolvedScope);
  const actions: EmployeeLifecycleAutomationAction[] = [];

  const targetEmployeeIds = parsedInput.employeeId
    ? [parsedInput.employeeId]
    : repository.states.map((state) => state.employeeId);

  if (
    parsedInput.employeeProfile &&
    canBootstrapOnboarding(parsedInput.employeeProfile) &&
    !findEmployeeLifecycleStateByEmployeeId(
      parsedInput.employeeProfile.employeeId,
      resolvedScope
    )
  ) {
    actions.push(buildOnboardingAutoStartAction(parsedInput.employeeProfile));
  }

  for (const employeeId of targetEmployeeIds) {
    const probation = getEmployeeLifecycleProbationStatus(
      employeeId,
      resolvedScope
    );
    if (probation && probation.reviewDueAt.getTime() <= now.getTime()) {
      actions.push(buildProbationDueAction(probation));
    }

    const contract = getEmployeeLifecycleContractStatus(
      employeeId,
      resolvedScope,
      now
    );
    if (contract?.isReminderDue) {
      actions.push(buildContractReminderDueAction(contract));
    }
    if (contract && (contract.isRenewalDue || contract.isExpired)) {
      actions.push(buildContractReviewDueAction(contract));
    }

    const exitStatus = getEmployeeLifecycleExitStatus(
      employeeId,
      resolvedScope
    );
    if (
      exitStatus &&
      !exitStatus.isArchived &&
      !findEmployeeLifecycleOffboardingHandoffByDedupeKey(
        `offboarding-handoff:${exitStatus.exitKind}:${exitStatus.startedAt.toISOString()}`,
        resolvedScope
      )
    ) {
      actions.push(buildOffboardingHandoffAction(exitStatus));
    }
  }

  return actions;
}

const buildNotificationIntentsForOnboarding = (
  onboarding: EmployeeLifecycleOnboardingReadModel
): EmployeeLifecycleNotificationIntent[] => {
  const intents: EmployeeLifecycleNotificationIntent[] = [];

  if (onboarding.workflowStatus === "in_progress") {
    intents.push(
      buildNotificationIntent({
        kind: "onboarding_pending",
        employeeId: onboarding.employeeId,
        companyId: onboarding.companyId ?? null,
        tenantId: onboarding.tenantId ?? null,
        audienceRole: "employee",
        dueAt: onboarding.startedAt,
        sourceEventId: onboarding.events.at(-1)?.id ?? null,
        dedupeKey: `onboarding-pending:${onboarding.startedAt.toISOString()}`,
        summary: "Onboarding tasks are pending",
        reason: "Required onboarding tasks are still incomplete",
        metadata: {
          workflowStatus: onboarding.workflowStatus,
          remainingRequiredTasks: onboarding.remainingRequiredTasks,
        },
      })
    );
  }

  if (onboarding.workflowStatus === "ready_for_activation") {
    intents.push(
      buildNotificationIntent({
        kind: "onboarding_ready",
        employeeId: onboarding.employeeId,
        companyId: onboarding.companyId ?? null,
        tenantId: onboarding.tenantId ?? null,
        audienceRole: "hr",
        dueAt: onboarding.readyAt ?? onboarding.startedAt,
        sourceEventId: onboarding.events.at(-1)?.id ?? null,
        dedupeKey: `onboarding-ready:${(
          onboarding.readyAt ?? onboarding.startedAt
        ).toISOString()}`,
        summary: "Onboarding is ready for activation",
        reason: "All required onboarding tasks are complete",
        metadata: {
          workflowStatus: onboarding.workflowStatus,
        },
      })
    );
  }

  return intents;
};

const buildProbationNotificationIntent = (
  probation: EmployeeLifecycleProbationReadModel
): EmployeeLifecycleNotificationIntent =>
  buildNotificationIntent({
    kind: probation.isOverdue
      ? "probation_review_overdue"
      : "probation_review_due",
    employeeId: probation.employeeId,
    companyId: probation.companyId ?? null,
    tenantId: probation.tenantId ?? null,
    audienceRole: "manager",
    dueAt: probation.reviewDueAt,
    sourceEventId: probation.events.at(-1)?.id ?? null,
    dedupeKey: `probation-notice:${probation.reviewDueAt.toISOString()}:${
      probation.isOverdue ? "overdue" : "due"
    }`,
    summary: probation.isOverdue
      ? "Probation review is overdue"
      : "Probation review is due",
    reason: probation.isOverdue
      ? "Probation review has not been recorded after the due date"
      : "Probation review due date has been reached",
    metadata: {
      workflowStatus: probation.workflowStatus,
      isOverdue: probation.isOverdue,
    },
  });

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: notification intent assembly spans many lifecycle branches
function buildContractNotificationIntents(
  contract: EmployeeLifecycleContractReadModel
): EmployeeLifecycleNotificationIntent[] {
  const intents: EmployeeLifecycleNotificationIntent[] = [];

  if (contract.isReminderDue) {
    intents.push(
      buildNotificationIntent({
        kind: "contract_reminder_due",
        employeeId: contract.employeeId,
        companyId: contract.companyId ?? null,
        tenantId: contract.tenantId ?? null,
        audienceRole: "hr",
        dueAt: contract.renewalReminderDueAt ?? contract.expiryAt,
        sourceEventId: contract.events.at(-1)?.id ?? null,
        dedupeKey: `contract-reminder-notice:${(
          contract.renewalReminderDueAt ?? contract.expiryAt
        ).toISOString()}`,
        summary: "Contract renewal reminder is due",
        reason: "Contract reminder threshold has been reached",
        metadata: {
          contractStatus: contract.contractStatus,
        },
      })
    );
  }

  if (contract.isRenewalDue || contract.isExpired) {
    intents.push(
      buildNotificationIntent({
        kind: contract.isExpired
          ? "contract_review_overdue"
          : "contract_review_due",
        employeeId: contract.employeeId,
        companyId: contract.companyId ?? null,
        tenantId: contract.tenantId ?? null,
        audienceRole: "hr",
        dueAt: contract.renewalReviewDueAt ?? contract.expiryAt,
        sourceEventId: contract.events.at(-1)?.id ?? null,
        dedupeKey: `contract-review-notice:${(
          contract.renewalReviewDueAt ?? contract.expiryAt
        ).toISOString()}:${contract.isExpired ? "overdue" : "due"}`,
        summary: contract.isExpired
          ? "Contract renewal review is overdue"
          : "Contract renewal review is due",
        reason: contract.isExpired
          ? "Contract has expired without renewal review completion"
          : "Contract review threshold has been reached",
        metadata: {
          contractStatus: contract.contractStatus,
          isExpired: contract.isExpired,
        },
      })
    );
  }

  return intents;
}

const buildSuspensionNotificationIntent = (
  suspension: EmployeeLifecycleSuspensionReadModel
): EmployeeLifecycleNotificationIntent =>
  buildNotificationIntent({
    kind: "suspension_open",
    employeeId: suspension.employeeId,
    companyId: suspension.companyId ?? null,
    tenantId: suspension.tenantId ?? null,
    audienceRole: "security",
    dueAt: suspension.lastSuspendedAt ?? suspension.startedAt,
    sourceEventId: suspension.events.at(-1)?.id ?? null,
    dedupeKey: `suspension-open:${(
      suspension.lastSuspendedAt ?? suspension.startedAt
    ).toISOString()}`,
    summary: "Suspension remains open",
    reason: "Employee suspension or hold is still active",
    metadata: {
      suspensionStatus: suspension.suspensionStatus,
      suspensionKind: suspension.suspensionKind,
    },
  });

const buildExitNotificationIntents = (
  exitStatus: EmployeeLifecycleExitReadModel
): EmployeeLifecycleNotificationIntent[] => {
  const intents: EmployeeLifecycleNotificationIntent[] = [];

  if (exitStatus.isNoticeActive) {
    intents.push(
      buildNotificationIntent({
        kind: "exit_notice_active",
        employeeId: exitStatus.employeeId,
        companyId: exitStatus.companyId ?? null,
        tenantId: exitStatus.tenantId ?? null,
        audienceRole: "manager",
        dueAt:
          exitStatus.noticeEndsAt ??
          exitStatus.lastWorkingAt ??
          exitStatus.startedAt,
        sourceEventId: exitStatus.events.at(-1)?.id ?? null,
        dedupeKey: `exit-notice:${exitStatus.startedAt.toISOString()}`,
        summary: "Exit notice period is active",
        reason: "Employee is in notice period and pending final handoff",
        metadata: {
          exitKind: exitStatus.exitKind,
          exitStatus: exitStatus.exitStatus,
        },
      })
    );
  }

  if (!(exitStatus.isOffboardingTriggered || exitStatus.isArchived)) {
    intents.push(
      buildNotificationIntent({
        kind: "offboarding_pending",
        employeeId: exitStatus.employeeId,
        companyId: exitStatus.companyId ?? null,
        tenantId: exitStatus.tenantId ?? null,
        audienceRole: "hr_operations",
        dueAt:
          exitStatus.lastWorkingAt ??
          exitStatus.noticeEndsAt ??
          exitStatus.startedAt,
        sourceEventId: exitStatus.events.at(-1)?.id ?? null,
        dedupeKey: `offboarding-pending:${exitStatus.startedAt.toISOString()}`,
        summary: "Offboarding handoff is pending",
        reason: "Exit lifecycle has not been handed off to offboarding",
        metadata: {
          exitKind: exitStatus.exitKind,
          exitStatus: exitStatus.exitStatus,
        },
      })
    );
  }

  return intents;
};

export function evaluateEmployeeLifecycleNotificationIntents(
  input: {
    employeeId?: string;
  } = {},
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleNotificationIntent[] {
  const repository = loadEmployeeLifecycleRepository(scope);
  const employeeIds = input.employeeId
    ? [input.employeeId]
    : repository.states.map((state) => state.employeeId);

  const intents: EmployeeLifecycleNotificationIntent[] = [];

  for (const employeeId of employeeIds) {
    const onboarding = getEmployeeLifecycleOnboardingStatus(employeeId, scope);
    if (onboarding) {
      intents.push(...buildNotificationIntentsForOnboarding(onboarding));
    }

    const probation = getEmployeeLifecycleProbationStatus(employeeId, scope);
    if (probation && probation.reviewDueAt.getTime() <= Date.now()) {
      intents.push(buildProbationNotificationIntent(probation));
    }

    const contract = getEmployeeLifecycleContractStatus(employeeId, scope);
    if (contract) {
      intents.push(...buildContractNotificationIntents(contract));
    }

    const suspension = getEmployeeLifecycleSuspensionStatus(employeeId, scope);
    if (suspension?.isRestricted && !suspension.isClosed) {
      intents.push(buildSuspensionNotificationIntent(suspension));
    }

    const exitStatus = getEmployeeLifecycleExitStatus(employeeId, scope);
    if (exitStatus) {
      intents.push(...buildExitNotificationIntents(exitStatus));
    }
  }

  return intents;
}

export function enqueueEmployeeLifecycleNotificationIntents(
  intents: readonly EmployeeLifecycleNotificationIntent[],
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleNotificationIntent[] {
  const stored: EmployeeLifecycleNotificationIntent[] = [];

  for (const intent of intents) {
    const existing = findEmployeeLifecycleNotificationIntentByDedupeKey(
      intent.dedupeKey,
      scope
    );
    if (existing) {
      stored.push(existing);
      continue;
    }

    const nextIntent = employeeLifecycleNotificationIntentSchema.parse(intent);
    upsertEmployeeLifecycleNotificationIntent(nextIntent, scope);
    stored.push(nextIntent);
  }

  return stored;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: automation orchestrates multiple lifecycle side effects in one pass
export async function runEmployeeLifecycleAutomation(
  input: RunEmployeeLifecycleAutomationInput,
  scope?: EmployeeLifecycleRepositoryScope
): Promise<{
  actions: readonly EmployeeLifecycleAutomationAction[];
  notifications: readonly EmployeeLifecycleNotificationIntent[];
  handoffs: readonly EmployeeLifecycleOffboardingHandoffRecord[];
}> {
  const parsedInput = runEmployeeLifecycleAutomationInputSchema.parse(input);
  const now = parsedInput.now ?? new Date();
  const resolvedScope =
    scope ?? toScope(parsedInput.employeeProfile) ?? undefined;
  const actions = evaluateEmployeeLifecycleAutomation(
    parsedInput,
    resolvedScope
  );
  const handoffs: EmployeeLifecycleOffboardingHandoffRecord[] = [];

  for (const action of actions) {
    if (
      action.kind === "onboarding_auto_start" &&
      parsedInput.employeeProfile &&
      !findEmployeeLifecycleStateByEmployeeId(action.employeeId, resolvedScope)
    ) {
      startEmployeeLifecycleOnboarding(
        {
          profile: normalizeBootstrapProfile(parsedInput.employeeProfile),
          startedAt: now,
          recordedAt: now,
          actorId: parsedInput.source ?? "automation",
          reason: `Automation bootstrap from ${parsedInput.source ?? "system"}`,
        },
        resolvedScope
      );
      continue;
    }

    if (action.kind === "contract_reminder_due") {
      const contract = getEmployeeLifecycleContractStatus(
        action.employeeId,
        resolvedScope,
        now
      );
      if (contract?.isReminderDue) {
        recordEmployeeLifecycleContractReminder(
          {
            employeeId: action.employeeId,
            reminderKind: "review_due",
            remindedAt: now,
            actorId: parsedInput.source ?? "automation",
            reason: action.reason ?? action.summary,
            metadata: {
              source: parsedInput.source ?? "system",
              automationActionId: action.id,
            },
          },
          resolvedScope
        );
      }
      continue;
    }

    if (
      action.kind === "offboarding_handoff" &&
      parsedInput.triggerOffboardingHandoff !== false
    ) {
      const exitStatus = getEmployeeLifecycleExitStatus(
        action.employeeId,
        resolvedScope
      );
      if (!exitStatus) {
        continue;
      }

      const lifecycleExitReference = `${action.employeeId}:exit`;
      const existing = findEmployeeLifecycleOffboardingHandoffByDedupeKey(
        action.dedupeKey,
        resolvedScope
      );
      if (existing) {
        handoffs.push(existing);
        continue;
      }

      const handoffProjection =
        buildEmployeeLifecycleOffboardingHandoffProjection({
          employeeId: action.employeeId,
          companyId: exitStatus.companyId ?? undefined,
          tenantId: exitStatus.tenantId ?? undefined,
          lifecycleExitReference,
          exitKind: exitStatus.exitKind,
          effectiveSeparationDate:
            exitStatus.lastWorkingAt ??
            exitStatus.noticeEndsAt ??
            exitStatus.startedAt,
          noticeEndsAt: exitStatus.noticeEndsAt ?? null,
          lastWorkingAt: exitStatus.lastWorkingAt ?? null,
        });

      const offboardingResult = await openOffboardingCase(
        {
          companyId: exitStatus.companyId ?? undefined,
          employeeId: action.employeeId,
          lifecycleExitReference,
          exitType:
            exitStatus.exitKind === "contract_expiry"
              ? "contract_expiry"
              : exitStatus.exitKind,
          reason: `${exitStatus.exitKind} lifecycle handoff`,
          effectiveSeparationDate:
            exitStatus.lastWorkingAt ??
            exitStatus.noticeEndsAt ??
            exitStatus.startedAt,
          noticeEndDate: exitStatus.noticeEndsAt ?? undefined,
          lastWorkingDate: exitStatus.lastWorkingAt ?? undefined,
          initiationSource: "system",
        },
        {
          actorId: parsedInput.source ?? "automation",
          canWrite: true,
          canRead: true,
          companyId: exitStatus.companyId ?? undefined,
          tenantId: exitStatus.tenantId ?? undefined,
        }
      );

      const handoffRecord = buildOffboardingHandoffRecord({
        employeeId: handoffProjection.employeeId,
        companyId: handoffProjection.companyId,
        tenantId: handoffProjection.tenantId,
        lifecycleExitReference: handoffProjection.lifecycleExitReference,
        exitKind: handoffProjection.exitKind,
        effectiveSeparationDate: new Date(
          handoffProjection.effectiveSeparationDate
        ),
        noticeEndsAt: handoffProjection.noticeEndsAt
          ? new Date(handoffProjection.noticeEndsAt)
          : null,
        lastWorkingAt: handoffProjection.lastWorkingAt
          ? new Date(handoffProjection.lastWorkingAt)
          : null,
        dedupeKey: action.dedupeKey,
        status: offboardingResult.ok ? "linked" : "requested",
        offboardingCaseId: offboardingResult.targetId ?? null,
        metadata: {
          source: parsedInput.source ?? "system",
          actionId: action.id,
          offboardingOk: offboardingResult.ok,
          offboardingError: offboardingResult.ok
            ? null
            : offboardingResult.error,
        },
      });

      upsertEmployeeLifecycleOffboardingHandoff(handoffRecord, resolvedScope);
      handoffs.push(handoffRecord);
    }
  }

  const notifications =
    parsedInput.enqueueNotifications === false
      ? []
      : enqueueEmployeeLifecycleNotificationIntents(
          evaluateEmployeeLifecycleNotificationIntents(
            {
              employeeId: parsedInput.employeeId,
            },
            resolvedScope
          ),
          resolvedScope
        );

  return {
    actions,
    notifications,
    handoffs,
  };
}

export function listEnqueuedEmployeeLifecycleNotificationIntents(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleNotificationIntent[] {
  return listEmployeeLifecycleNotificationIntents(scope);
}
