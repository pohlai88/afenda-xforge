import "server-only";

import type { EmployeeLifecycleTransitionRequest } from "./contracts/transition.contract.ts";
import { employeeLifecycleTransitionRequestSchema } from "./contracts/transition.contract.ts";
import type {
  EmployeeLifecycleRepositoryScope,
  EmployeeLifecycleRepositoryState,
} from "./repository.ts";
import {
  findEmployeeLifecycleStateByEmployeeId,
  mutateEmployeeLifecycleRepository,
} from "./repository.ts";
import { runEmployeeLifecycleManagementAction } from "./execution/index.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleContractReminderInput,
  EmployeeLifecycleContractRenewalInput,
  EmployeeLifecycleContractReviewInput,
  EmployeeLifecycleContractStartInput,
  EmployeeLifecycleExitArchiveInput,
  EmployeeLifecycleExitNoticeInput,
  EmployeeLifecycleExitOffboardingInput,
  EmployeeLifecycleExitReadModel,
  EmployeeLifecycleExitRecord,
  EmployeeLifecycleExitStartInput,
  EmployeeLifecycleMovementInput,
  EmployeeLifecycleMovementKindValue,
  EmployeeLifecycleMovementReadModel,
  EmployeeLifecycleOnboardingProfile,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleOnboardingTaskCodeValue,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleProbationReviewOutcomeValue,
  EmployeeLifecycleState,
  EmployeeLifecycleSuspensionReadModel,
  EmployeeLifecycleSuspensionResolutionInput,
  EmployeeLifecycleSuspensionStartInput,
} from "./schema.ts";
import {
  appendEmployeeLifecycleExitNotice,
  appendEmployeeLifecycleMovement,
  appendEmployeeLifecycleSuspension,
  applyEmployeeLifecycleContractReminder,
  applyEmployeeLifecycleContractRenewal,
  applyEmployeeLifecycleContractReview,
  applyEmployeeLifecycleExitArchive,
  applyEmployeeLifecycleExitOffboarding,
  releaseEmployeeLifecycleSuspension as applyEmployeeLifecycleSuspensionRelease,
  resolveEmployeeLifecycleSuspension as applyEmployeeLifecycleSuspensionResolution,
  completeEmployeeLifecycleOnboardingRecordTask as applyEmployeeLifecycleTaskCompletion,
  applyEmployeeLifecycleTransition,
  approveEmployeeLifecycleProbationConfirmationRecord,
  buildEmployeeLifecycleContractReadModel,
  buildEmployeeLifecycleExitReadModel,
  buildEmployeeLifecycleMovementReadModel,
  buildEmployeeLifecycleOnboardingReadModel,
  buildEmployeeLifecycleProbationReadModel,
  buildEmployeeLifecycleSuspensionReadModel,
  createEmployeeLifecycleContractRecord,
  createEmployeeLifecycleExitRecord,
  createEmployeeLifecycleMovementRecord,
  createEmployeeLifecycleOnboardingRecord,
  createEmployeeLifecycleProbationRecord,
  createEmployeeLifecycleState,
  createEmployeeLifecycleSuspensionRecord,
  employeeLifecycleContractReadModelSchema,
  employeeLifecycleContractReminderInputSchema,
  employeeLifecycleContractRenewalInputSchema,
  employeeLifecycleContractReviewInputSchema,
  employeeLifecycleContractStartInputSchema,
  employeeLifecycleExitArchiveInputSchema,
  employeeLifecycleExitNoticeInputSchema,
  employeeLifecycleExitOffboardingInputSchema,
  employeeLifecycleExitReadModelSchema,
  employeeLifecycleExitStartInputSchema,
  employeeLifecycleMovementInputSchema,
  employeeLifecycleMovementReadModelSchema,
  employeeLifecycleOnboardingProfileSchema,
  employeeLifecycleOnboardingReadModelSchema,
  employeeLifecycleProbationApprovalInputSchema,
  employeeLifecycleProbationExtensionInputSchema,
  employeeLifecycleProbationReadModelSchema,
  employeeLifecycleProbationReviewInputSchema,
  employeeLifecycleProbationStartInputSchema,
  employeeLifecycleSuspensionReadModelSchema,
  employeeLifecycleSuspensionResolutionInputSchema,
  employeeLifecycleSuspensionStartInputSchema,
  activateEmployeeLifecycleOnboardingRecord as finalizeEmployeeLifecycleOnboardingRecord,
  recordEmployeeLifecycleProbationReviewOutcome,
} from "./schema.ts";

export type EmployeeLifecycleOnboardingStartInput = Readonly<{
  profile: EmployeeLifecycleOnboardingProfile;
  startedAt?: Date;
  recordedAt?: Date;
  actorId?: string | null;
  reason?: string | null;
}>;

export type EmployeeLifecycleOnboardingTaskCompletionInput = Readonly<{
  employeeId: string;
  taskCode: EmployeeLifecycleOnboardingTaskCodeValue;
  completedAt?: Date;
  actorId?: string | null;
  documentReferenceId?: string | null;
  policyAcknowledgmentId?: string | null;
  notes?: string | null;
  reason?: string | null;
}>;

export type EmployeeLifecycleOnboardingActivationInput = Readonly<{
  employeeId: string;
  activatedAt?: Date;
  actorId?: string | null;
  reason?: string | null;
}>;

export type EmployeeLifecycleProbationStartCommandInput = Readonly<{
  employeeId: string;
  companyId?: string | null;
  tenantId?: string | null;
  reviewDueAt: Date;
  scheduledEndAt?: Date | null;
  startedAt?: Date;
  recordedAt?: Date;
  actorId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}>;

export type EmployeeLifecycleProbationReviewCommandInput = Readonly<{
  employeeId: string;
  outcome: EmployeeLifecycleProbationReviewOutcomeValue;
  reviewedAt?: Date;
  nextReviewDueAt?: Date | null;
  scheduledEndAt?: Date | null;
  actorId?: string | null;
  reason?: string | null;
  approvalReference?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}>;

export type EmployeeLifecycleProbationApprovalCommandInput = Readonly<{
  employeeId: string;
  approvedAt?: Date;
  actorId?: string | null;
  approvalReference: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}>;

export type EmployeeLifecycleProbationExtensionCommandInput = Readonly<{
  employeeId: string;
  extendedAt?: Date;
  nextReviewDueAt: Date;
  scheduledEndAt?: Date | null;
  actorId?: string | null;
  reason?: string | null;
  approvalReference?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}>;

export type EmployeeLifecycleContractStartCommandInput =
  EmployeeLifecycleContractStartInput;

export type EmployeeLifecycleContractRenewalCommandInput =
  EmployeeLifecycleContractRenewalInput;

export type EmployeeLifecycleContractReviewCommandInput =
  EmployeeLifecycleContractReviewInput;

export type EmployeeLifecycleContractReminderCommandInput =
  EmployeeLifecycleContractReminderInput;

export type EmployeeLifecycleSuspensionStartCommandInput =
  EmployeeLifecycleSuspensionStartInput;

export type EmployeeLifecycleSuspensionResolutionCommandInput =
  EmployeeLifecycleSuspensionResolutionInput;

const resolveEmployeeLifecycleOnboardingScope = (
  profile: EmployeeLifecycleOnboardingProfile,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  const normalizedProfile =
    employeeLifecycleOnboardingProfileSchema.parse(profile);

  if (scope === undefined) {
    return {
      companyId: normalizedProfile.companyId ?? undefined,
      tenantId: normalizedProfile.tenantId ?? undefined,
    };
  }

  if (
    normalizedProfile.companyId &&
    scope.companyId &&
    normalizedProfile.companyId !== scope.companyId
  ) {
    throw new Error(
      "Onboarding profile companyId does not match repository scope"
    );
  }

  if (
    normalizedProfile.tenantId &&
    scope.tenantId &&
    normalizedProfile.tenantId !== scope.tenantId
  ) {
    throw new Error(
      "Onboarding profile tenantId does not match repository scope"
    );
  }

  return {
    companyId: scope.companyId ?? normalizedProfile.companyId ?? undefined,
    tenantId: scope.tenantId ?? normalizedProfile.tenantId ?? undefined,
  };
};

const resolveEmployeeLifecycleOnboardingState = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleState =>
  findEmployeeLifecycleStateByEmployeeId(employeeId, scope) ??
  createEmployeeLifecycleState({
    employeeId,
    companyId: scope?.companyId ?? undefined,
    tenantId: scope?.tenantId ?? undefined,
    initialStage: "preboarding",
  });

const mutateEmployeeLifecycleAction = <
  TResult = EmployeeLifecycleRepositoryState,
>(
  updater: (draft: EmployeeLifecycleRepositoryState) => TResult,
  scope?: EmployeeLifecycleRepositoryScope
): TResult =>
  runEmployeeLifecycleManagementAction(() =>
    mutateEmployeeLifecycleRepository(updater, scope)
  );

const resolveEmployeeLifecycleProbationScope = (
  input: Readonly<{
    companyId?: string | null;
    tenantId?: string | null;
  }>,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return {
      companyId: input.companyId ?? undefined,
      tenantId: input.tenantId ?? undefined,
    };
  }

  if (
    input.companyId &&
    scope.companyId &&
    input.companyId !== scope.companyId
  ) {
    throw new Error(
      "Probation input companyId does not match repository scope"
    );
  }

  if (input.tenantId && scope.tenantId && input.tenantId !== scope.tenantId) {
    throw new Error("Probation input tenantId does not match repository scope");
  }

  return {
    companyId: scope.companyId ?? input.companyId ?? undefined,
    tenantId: scope.tenantId ?? input.tenantId ?? undefined,
  };
};

const resolveEmployeeLifecycleProbationState = (
  draft: EmployeeLifecycleRepositoryState,
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    startedAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
  }>
): EmployeeLifecycleState => {
  const stateIndex = draft.states.findIndex(
    (state) => state.employeeId === input.employeeId
  );
  const currentState =
    stateIndex >= 0
      ? draft.states[stateIndex]
      : createEmployeeLifecycleState({
          employeeId: input.employeeId,
          companyId: input.companyId ?? undefined,
          tenantId: input.tenantId ?? undefined,
          initialStage: "probation",
          effectiveAt: input.startedAt,
          recordedAt: input.recordedAt,
          actorId: input.actorId ?? undefined,
          reason: input.reason ?? null,
        });

  const nextState =
    currentState.currentStage === "probation"
      ? currentState
      : applyEmployeeLifecycleTransition(currentState, {
          toStage: "probation",
          effectiveAt: input.startedAt,
          recordedAt: input.recordedAt,
          actorId: input.actorId ?? undefined,
          reason: input.reason ?? null,
        });

  if (stateIndex < 0) {
    draft.states = [...draft.states, nextState];
  } else {
    draft.states[stateIndex] = nextState;
  }

  return nextState;
};

const resolveEmployeeLifecycleProbationRecord = (
  draft: EmployeeLifecycleRepositoryState,
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    reviewDueAt: Date;
    scheduledEndAt?: Date | null;
    startedAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  }>
): ReturnType<typeof createEmployeeLifecycleProbationRecord> => {
  const recordIndex = draft.probationRecords.findIndex(
    (record) => record.employeeId === input.employeeId
  );
  const nextRecord =
    recordIndex >= 0
      ? draft.probationRecords[recordIndex]
      : createEmployeeLifecycleProbationRecord({
          employeeId: input.employeeId,
          companyId: input.companyId ?? undefined,
          tenantId: input.tenantId ?? undefined,
          reviewDueAt: input.reviewDueAt,
          scheduledEndAt: input.scheduledEndAt ?? null,
          startedAt: input.startedAt,
          recordedAt: input.recordedAt,
          actorId: input.actorId ?? undefined,
          reason: input.reason ?? null,
          metadata: input.metadata ?? {},
        });

  if (recordIndex < 0) {
    draft.probationRecords = [...draft.probationRecords, nextRecord];
  } else {
    draft.probationRecords[recordIndex] = nextRecord;
  }

  return nextRecord;
};

export function startEmployeeLifecycleOnboarding(
  input: EmployeeLifecycleOnboardingStartInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingReadModel {
  const parsed = {
    ...input,
    profile: employeeLifecycleOnboardingProfileSchema.parse(input.profile),
  } as const;
  const resolvedScope = resolveEmployeeLifecycleOnboardingScope(
    parsed.profile,
    scope
  );
  const startedAt = parsed.startedAt ?? new Date();
  const recordedAt = parsed.recordedAt ?? startedAt;
  let readModel: EmployeeLifecycleOnboardingReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const existingStateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsed.profile.employeeId
    );
    const currentState =
      existingStateIndex >= 0
        ? draft.states[existingStateIndex]
        : resolveEmployeeLifecycleOnboardingState(
            parsed.profile.employeeId,
            resolvedScope
          );
    const onboardingState =
      currentState.currentStage === "onboarding"
        ? currentState
        : applyEmployeeLifecycleTransition(currentState, {
            toStage: "onboarding",
            effectiveAt: startedAt,
            recordedAt,
            actorId: parsed.actorId ?? undefined,
            reason: parsed.reason ?? null,
          });

    if (existingStateIndex < 0) {
      draft.states = [...draft.states, onboardingState];
    } else {
      draft.states[existingStateIndex] = onboardingState;
    }

    const existingRecord = draft.onboardingRecords.find(
      (record) => record.employeeId === parsed.profile.employeeId
    );
    const onboardingRecord =
      existingRecord ??
      createEmployeeLifecycleOnboardingRecord(parsed.profile, {
        actorId: parsed.actorId ?? undefined,
        reason: parsed.reason ?? null,
        startedAt,
        recordedAt,
      });

    if (existingRecord) {
      const recordIndex = draft.onboardingRecords.findIndex(
        (record) => record.employeeId === parsed.profile.employeeId
      );
      draft.onboardingRecords[recordIndex] = onboardingRecord;
    } else {
      draft.onboardingRecords = [...draft.onboardingRecords, onboardingRecord];
    }

    readModel = buildEmployeeLifecycleOnboardingReadModel({
      state: onboardingState,
      record: onboardingRecord,
    });
  }, resolvedScope);

  return employeeLifecycleOnboardingReadModelSchema.parse(readModel);
}

export function completeEmployeeLifecycleOnboardingTask(
  input: EmployeeLifecycleOnboardingTaskCompletionInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingReadModel {
  const completedAt = input.completedAt ?? new Date();
  let readModel: EmployeeLifecycleOnboardingReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const recordIndex = draft.onboardingRecords.findIndex(
      (record) => record.employeeId === input.employeeId
    );

    if (recordIndex < 0) {
      throw new Error(
        `Onboarding record not found for employee ${input.employeeId}.`
      );
    }

    const currentRecord = draft.onboardingRecords[recordIndex];
    const nextRecord = applyEmployeeLifecycleTaskCompletion(currentRecord, {
      taskCode: input.taskCode,
      actorId: input.actorId ?? undefined,
      completedAt,
      documentReferenceId: input.documentReferenceId ?? null,
      policyAcknowledgmentId: input.policyAcknowledgmentId ?? null,
      notes: input.notes ?? null,
      reason: input.reason ?? null,
    });

    draft.onboardingRecords[recordIndex] = nextRecord;

    const currentStateIndex = draft.states.findIndex(
      (state) => state.employeeId === input.employeeId
    );
    const currentState =
      currentStateIndex >= 0
        ? draft.states[currentStateIndex]
        : resolveEmployeeLifecycleOnboardingState(input.employeeId, scope);

    if (currentStateIndex < 0) {
      draft.states = [...draft.states, currentState];
    }

    readModel = buildEmployeeLifecycleOnboardingReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleOnboardingReadModelSchema.parse(readModel);
}

export function activateEmployeeLifecycleOnboarding(
  input: EmployeeLifecycleOnboardingActivationInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingReadModel {
  const activatedAt = input.activatedAt ?? new Date();
  let readModel: EmployeeLifecycleOnboardingReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const recordIndex = draft.onboardingRecords.findIndex(
      (record) => record.employeeId === input.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Onboarding record not found for employee ${input.employeeId}.`
      );
    }

    const currentRecord = draft.onboardingRecords[recordIndex];
    const nextRecord = finalizeEmployeeLifecycleOnboardingRecord(
      currentRecord,
      {
        actorId: input.actorId ?? undefined,
        activatedAt,
        reason: input.reason ?? null,
      }
    );
    draft.onboardingRecords[recordIndex] = nextRecord;

    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === input.employeeId
    );
    const currentState =
      stateIndex >= 0
        ? draft.states[stateIndex]
        : resolveEmployeeLifecycleOnboardingState(input.employeeId, scope);
    const nextState =
      currentState.currentStage === "active"
        ? currentState
        : applyEmployeeLifecycleTransition(currentState, {
            toStage: "active",
            effectiveAt: activatedAt,
            recordedAt: activatedAt,
            actorId: input.actorId ?? undefined,
            reason: input.reason ?? null,
          });

    if (stateIndex < 0) {
      draft.states = [...draft.states, nextState];
    } else {
      draft.states[stateIndex] = nextState;
    }

    readModel = buildEmployeeLifecycleOnboardingReadModel({
      state: nextState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleOnboardingReadModelSchema.parse(readModel);
}

export const employeeLifecycleOnboardingActionCatalog = {
  start: "startEmployeeLifecycleOnboarding",
  completeTask: "completeEmployeeLifecycleOnboardingTask",
  activate: "activateEmployeeLifecycleOnboarding",
} as const;

export function startEmployeeLifecycleProbation(
  input: EmployeeLifecycleProbationStartCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationReadModel {
  const parsedInput = employeeLifecycleProbationStartInputSchema.parse(input);
  const resolvedScope = resolveEmployeeLifecycleProbationScope(
    parsedInput,
    scope
  );
  const startedAt = parsedInput.startedAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? startedAt;
  let readModel: EmployeeLifecycleProbationReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const probationState = resolveEmployeeLifecycleProbationState(draft, {
      employeeId: parsedInput.employeeId,
      companyId: resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
      tenantId: resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
      startedAt,
      recordedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
    });

    const probationRecord = resolveEmployeeLifecycleProbationRecord(draft, {
      employeeId: parsedInput.employeeId,
      companyId: resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
      tenantId: resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
      reviewDueAt: parsedInput.reviewDueAt,
      scheduledEndAt: parsedInput.scheduledEndAt ?? null,
      startedAt,
      recordedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      metadata: parsedInput.metadata ?? {},
    });

    readModel = buildEmployeeLifecycleProbationReadModel({
      state: probationState,
      record: probationRecord,
    });
  }, resolvedScope);

  return employeeLifecycleProbationReadModelSchema.parse(readModel);
}

export function recordEmployeeLifecycleProbationReview(
  input: EmployeeLifecycleProbationReviewCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationReadModel {
  const parsedInput = employeeLifecycleProbationReviewInputSchema.parse(input);
  const reviewedAt = parsedInput.reviewedAt ?? new Date();
  let readModel: EmployeeLifecycleProbationReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const recordIndex = draft.probationRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Probation record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    const currentState =
      stateIndex >= 0
        ? draft.states[stateIndex]
        : createEmployeeLifecycleState({
            employeeId: parsedInput.employeeId,
            companyId:
              draft.probationRecords[recordIndex]?.companyId ?? undefined,
            tenantId:
              draft.probationRecords[recordIndex]?.tenantId ?? undefined,
            initialStage: "probation",
          });

    if (currentState.currentStage !== "probation") {
      throw new Error(
        `Employee ${parsedInput.employeeId} is not in the probation stage.`
      );
    }

    const currentRecord = draft.probationRecords[recordIndex];
    const nextRecord = recordEmployeeLifecycleProbationReviewOutcome(
      currentRecord,
      {
        employeeId: parsedInput.employeeId,
        outcome: parsedInput.outcome,
        reviewedAt,
        nextReviewDueAt: parsedInput.nextReviewDueAt ?? null,
        scheduledEndAt: parsedInput.scheduledEndAt ?? null,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
        approvalReference: parsedInput.approvalReference ?? null,
        notes: parsedInput.notes ?? null,
        metadata: parsedInput.metadata ?? {},
      }
    );

    draft.probationRecords[recordIndex] = nextRecord;

    if (stateIndex < 0) {
      draft.states = [...draft.states, currentState];
    }

    readModel = buildEmployeeLifecycleProbationReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleProbationReadModelSchema.parse(readModel);
}

export function extendEmployeeLifecycleProbation(
  input: EmployeeLifecycleProbationExtensionCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationReadModel {
  const parsedInput =
    employeeLifecycleProbationExtensionInputSchema.parse(input);

  return recordEmployeeLifecycleProbationReview(
    {
      employeeId: parsedInput.employeeId,
      outcome: "extend",
      reviewedAt: parsedInput.extendedAt ?? new Date(),
      nextReviewDueAt: parsedInput.nextReviewDueAt,
      scheduledEndAt: parsedInput.scheduledEndAt ?? null,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      approvalReference: parsedInput.approvalReference ?? null,
      notes: parsedInput.notes ?? null,
      metadata: parsedInput.metadata ?? {},
    },
    scope
  );
}

export function approveEmployeeLifecycleProbationConfirmation(
  input: EmployeeLifecycleProbationApprovalCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationReadModel {
  const parsedInput =
    employeeLifecycleProbationApprovalInputSchema.parse(input);
  const approvedAt = parsedInput.approvedAt ?? new Date();
  let readModel: EmployeeLifecycleProbationReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const recordIndex = draft.probationRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Probation record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    const currentState =
      stateIndex >= 0
        ? draft.states[stateIndex]
        : createEmployeeLifecycleState({
            employeeId: parsedInput.employeeId,
            companyId:
              draft.probationRecords[recordIndex]?.companyId ?? undefined,
            tenantId:
              draft.probationRecords[recordIndex]?.tenantId ?? undefined,
            initialStage: "probation",
          });

    const currentRecord = draft.probationRecords[recordIndex];
    const approvedRecord = approveEmployeeLifecycleProbationConfirmationRecord(
      currentRecord,
      {
        employeeId: parsedInput.employeeId,
        approvedAt,
        actorId: parsedInput.actorId ?? undefined,
        approvalReference: parsedInput.approvalReference,
        reason: parsedInput.reason ?? null,
        metadata: parsedInput.metadata ?? {},
      }
    );
    draft.probationRecords[recordIndex] = approvedRecord;

    const confirmedState =
      currentState.currentStage === "confirmed"
        ? currentState
        : applyEmployeeLifecycleTransition(currentState, {
            toStage: "confirmed",
            effectiveAt: approvedAt,
            recordedAt: approvedAt,
            actorId: parsedInput.actorId ?? undefined,
            reason: parsedInput.reason ?? null,
            approvalReference: parsedInput.approvalReference,
          });

    if (stateIndex < 0) {
      draft.states = [...draft.states, confirmedState];
    } else {
      draft.states[stateIndex] = confirmedState;
    }

    readModel = buildEmployeeLifecycleProbationReadModel({
      state: confirmedState,
      record: approvedRecord,
    });
  }, scope);

  return employeeLifecycleProbationReadModelSchema.parse(readModel);
}

export const employeeLifecycleProbationActionCatalog = {
  start: "startEmployeeLifecycleProbation",
  review: "recordEmployeeLifecycleProbationReview",
  extend: "extendEmployeeLifecycleProbation",
  approveConfirmation: "approveEmployeeLifecycleProbationConfirmation",
} as const;

const resolveEmployeeLifecycleContractScope = (
  input: Readonly<{
    companyId?: string | null;
    tenantId?: string | null;
  }>,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return {
      companyId: input.companyId ?? undefined,
      tenantId: input.tenantId ?? undefined,
    };
  }

  if (
    input.companyId &&
    scope.companyId &&
    input.companyId !== scope.companyId
  ) {
    throw new Error("Contract input companyId does not match repository scope");
  }

  if (input.tenantId && scope.tenantId && input.tenantId !== scope.tenantId) {
    throw new Error("Contract input tenantId does not match repository scope");
  }

  return {
    companyId: scope.companyId ?? input.companyId ?? undefined,
    tenantId: scope.tenantId ?? input.tenantId ?? undefined,
  };
};

const ensureEmployeeLifecycleContractStateIsEligible = (
  state: EmployeeLifecycleState
): void => {
  if (
    state.currentStage === "suspended" ||
    state.currentStage === "notice_period" ||
    state.currentStage === "offboarding" ||
    state.currentStage === "separated" ||
    state.currentStage === "retired" ||
    state.currentStage === "archived"
  ) {
    throw new Error(
      `Employee ${state.employeeId} cannot have a contract lifecycle updated while suspended, exiting, or after exit.`
    );
  }
};

const resolveEmployeeLifecycleSuspensionScope = (
  input: Readonly<{
    companyId?: string | null;
    tenantId?: string | null;
  }>,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return {
      companyId: input.companyId ?? undefined,
      tenantId: input.tenantId ?? undefined,
    };
  }

  if (
    input.companyId &&
    scope.companyId &&
    input.companyId !== scope.companyId
  ) {
    throw new Error(
      "Suspension input companyId does not match repository scope"
    );
  }

  if (input.tenantId && scope.tenantId && input.tenantId !== scope.tenantId) {
    throw new Error(
      "Suspension input tenantId does not match repository scope"
    );
  }

  return {
    companyId: scope.companyId ?? input.companyId ?? undefined,
    tenantId: scope.tenantId ?? input.tenantId ?? undefined,
  };
};

const ensureEmployeeLifecycleSuspensionStateIsEligible = (
  state: EmployeeLifecycleState
): void => {
  if (state.currentStage === "suspended") {
    throw new Error(
      `Employee ${state.employeeId} already has an active suspension or hold.`
    );
  }

  if (state.currentStage !== "active" && state.currentStage !== "confirmed") {
    throw new Error(
      `Employee ${state.employeeId} must be active or confirmed before a suspension or hold can be recorded.`
    );
  }
};

const ensureEmployeeLifecycleSuspensionStateIsSuspended = (
  state: EmployeeLifecycleState
): void => {
  if (state.currentStage !== "suspended") {
    throw new Error(`Employee ${state.employeeId} is not currently suspended.`);
  }
};

const resolveEmployeeLifecycleMovementScope = (
  input: Readonly<{
    companyId?: string | null;
    tenantId?: string | null;
  }>,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return {
      companyId: input.companyId ?? undefined,
      tenantId: input.tenantId ?? undefined,
    };
  }

  if (
    input.companyId &&
    scope.companyId &&
    input.companyId !== scope.companyId
  ) {
    throw new Error("Movement input companyId does not match repository scope");
  }

  if (input.tenantId && scope.tenantId && input.tenantId !== scope.tenantId) {
    throw new Error("Movement input tenantId does not match repository scope");
  }

  return {
    companyId: scope.companyId ?? input.companyId ?? undefined,
    tenantId: scope.tenantId ?? input.tenantId ?? undefined,
  };
};

const ensureEmployeeLifecycleMovementStateIsActive = (
  state: EmployeeLifecycleState,
  input: Readonly<{
    effectiveAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
  }>
): EmployeeLifecycleState => {
  if (state.currentStage === "active") {
    return state;
  }

  if (state.currentStage !== "confirmed") {
    throw new Error(
      `Employee ${state.employeeId} must be confirmed or active before movement can be recorded.`
    );
  }

  return applyEmployeeLifecycleTransition(state, {
    toStage: "active",
    effectiveAt: input.effectiveAt,
    recordedAt: input.recordedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
  });
};

export function recordEmployeeLifecycleMovement(
  input: EmployeeLifecycleMovementInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  const parsedInput = employeeLifecycleMovementInputSchema.parse(input);
  const resolvedScope = resolveEmployeeLifecycleMovementScope(
    parsedInput,
    scope
  );
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;
  let readModel: EmployeeLifecycleMovementReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Movement state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    const nextState = ensureEmployeeLifecycleMovementStateIsActive(
      currentState,
      {
        effectiveAt,
        recordedAt,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
        approvalReference: parsedInput.approvalReference ?? null,
      }
    );
    draft.states[stateIndex] = nextState;

    const recordIndex = draft.movementRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    const nextRecord =
      recordIndex < 0
        ? createEmployeeLifecycleMovementRecord({
            ...parsedInput,
            companyId:
              resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
            tenantId:
              resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
            effectiveAt,
            recordedAt,
          })
        : appendEmployeeLifecycleMovement(draft.movementRecords[recordIndex], {
            ...parsedInput,
            companyId:
              resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
            tenantId:
              resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
            effectiveAt,
            recordedAt,
          });

    if (recordIndex < 0) {
      draft.movementRecords = [...draft.movementRecords, nextRecord];
    } else {
      draft.movementRecords[recordIndex] = nextRecord;
    }

    readModel = buildEmployeeLifecycleMovementReadModel({
      state: nextState,
      record: nextRecord,
    });
  }, resolvedScope);

  return employeeLifecycleMovementReadModelSchema.parse(readModel);
}

const recordEmployeeLifecycleMovementWithKind = (
  movementKind: EmployeeLifecycleMovementKindValue,
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel =>
  recordEmployeeLifecycleMovement(
    {
      ...input,
      movementKind,
    },
    scope
  );

export function recordEmployeeLifecyclePromotion(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind("promotion", input, scope);
}

export function recordEmployeeLifecycleTransfer(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind("transfer", input, scope);
}

export function recordEmployeeLifecycleDemotion(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind("demotion", input, scope);
}

export function recordEmployeeLifecycleGradeChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind("grade_change", input, scope);
}

export function recordEmployeeLifecycleJobChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind("job_change", input, scope);
}

export function recordEmployeeLifecycleDepartmentChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind(
    "department_change",
    input,
    scope
  );
}

export function recordEmployeeLifecycleLocationChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind(
    "location_change",
    input,
    scope
  );
}

export function recordEmployeeLifecycleManagerChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind(
    "manager_change",
    input,
    scope
  );
}

export function recordEmployeeLifecycleReportingLineChange(
  input: Omit<EmployeeLifecycleMovementInput, "movementKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel {
  return recordEmployeeLifecycleMovementWithKind(
    "reporting_line_change",
    input,
    scope
  );
}

export const employeeLifecycleMovementActionCatalog = {
  record: "recordEmployeeLifecycleMovement",
  promote: "recordEmployeeLifecyclePromotion",
  transfer: "recordEmployeeLifecycleTransfer",
  demote: "recordEmployeeLifecycleDemotion",
  gradeChange: "recordEmployeeLifecycleGradeChange",
  jobChange: "recordEmployeeLifecycleJobChange",
  departmentChange: "recordEmployeeLifecycleDepartmentChange",
  locationChange: "recordEmployeeLifecycleLocationChange",
  managerChange: "recordEmployeeLifecycleManagerChange",
  reportingLineChange: "recordEmployeeLifecycleReportingLineChange",
} as const;

export function startEmployeeLifecycleContract(
  input: EmployeeLifecycleContractStartInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractReadModel {
  const parsedInput = employeeLifecycleContractStartInputSchema.parse(input);
  const resolvedScope = resolveEmployeeLifecycleContractScope(
    parsedInput,
    scope
  );
  const startedAt = parsedInput.startedAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? startedAt;
  let readModel: EmployeeLifecycleContractReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Contract state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleContractStateIsEligible(currentState);

    const recordIndex = draft.contractRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex >= 0) {
      throw new Error(
        `Contract record already exists for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = createEmployeeLifecycleContractRecord({
      ...parsedInput,
      companyId: resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
      tenantId: resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
      startedAt,
      recordedAt,
    });
    draft.contractRecords = [...draft.contractRecords, nextRecord];

    readModel = buildEmployeeLifecycleContractReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, resolvedScope);

  return employeeLifecycleContractReadModelSchema.parse(readModel);
}

export function renewEmployeeLifecycleContract(
  input: EmployeeLifecycleContractRenewalInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractReadModel {
  const parsedInput = employeeLifecycleContractRenewalInputSchema.parse(input);
  const renewedAt = parsedInput.renewedAt ?? new Date();
  let readModel: EmployeeLifecycleContractReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Contract state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleContractStateIsEligible(currentState);

    const recordIndex = draft.contractRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Contract record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = applyEmployeeLifecycleContractRenewal(
      draft.contractRecords[recordIndex],
      {
        ...parsedInput,
        renewedAt,
      }
    );
    draft.contractRecords[recordIndex] = nextRecord;

    readModel = buildEmployeeLifecycleContractReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleContractReadModelSchema.parse(readModel);
}

export function recordEmployeeLifecycleContractReview(
  input: EmployeeLifecycleContractReviewInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractReadModel {
  const parsedInput = employeeLifecycleContractReviewInputSchema.parse(input);
  const reviewedAt = parsedInput.reviewedAt ?? new Date();
  let readModel: EmployeeLifecycleContractReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Contract state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleContractStateIsEligible(currentState);

    const recordIndex = draft.contractRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Contract record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = applyEmployeeLifecycleContractReview(
      draft.contractRecords[recordIndex],
      {
        ...parsedInput,
        reviewedAt,
      }
    );
    draft.contractRecords[recordIndex] = nextRecord;

    readModel = buildEmployeeLifecycleContractReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleContractReadModelSchema.parse(readModel);
}

export function recordEmployeeLifecycleContractReminder(
  input: EmployeeLifecycleContractReminderInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractReadModel {
  const parsedInput = employeeLifecycleContractReminderInputSchema.parse(input);
  const remindedAt = parsedInput.remindedAt ?? new Date();
  let readModel: EmployeeLifecycleContractReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Contract state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleContractStateIsEligible(currentState);

    const recordIndex = draft.contractRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Contract record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = applyEmployeeLifecycleContractReminder(
      draft.contractRecords[recordIndex],
      {
        ...parsedInput,
        remindedAt,
      }
    );
    draft.contractRecords[recordIndex] = nextRecord;

    readModel = buildEmployeeLifecycleContractReadModel({
      state: currentState,
      record: nextRecord,
    });
  }, scope);

  return employeeLifecycleContractReadModelSchema.parse(readModel);
}

export const employeeLifecycleContractActionCatalog = {
  start: "startEmployeeLifecycleContract",
  renew: "renewEmployeeLifecycleContract",
  review: "recordEmployeeLifecycleContractReview",
  reminder: "recordEmployeeLifecycleContractReminder",
} as const;

const resolveEmployeeLifecycleSuspensionRecord = (
  draft: EmployeeLifecycleRepositoryState,
  input: EmployeeLifecycleSuspensionStartInput
): ReturnType<typeof createEmployeeLifecycleSuspensionRecord> => {
  const recordIndex = draft.suspensionRecords.findIndex(
    (record) => record.employeeId === input.employeeId
  );

  if (recordIndex < 0) {
    return createEmployeeLifecycleSuspensionRecord(input);
  }

  return appendEmployeeLifecycleSuspension(
    draft.suspensionRecords[recordIndex],
    input
  );
};

const closeEmployeeLifecycleSuspensionRecord = (
  draft: EmployeeLifecycleRepositoryState,
  input: EmployeeLifecycleSuspensionResolutionInput,
  resolutionPath: "released" | "resolved"
): ReturnType<typeof applyEmployeeLifecycleSuspensionRelease> => {
  const recordIndex = draft.suspensionRecords.findIndex(
    (record) => record.employeeId === input.employeeId
  );
  if (recordIndex < 0) {
    throw new Error(
      `Suspension record not found for employee ${input.employeeId}.`
    );
  }

  const currentRecord = draft.suspensionRecords[recordIndex];
  const nextRecord =
    resolutionPath === "released"
      ? applyEmployeeLifecycleSuspensionRelease(currentRecord, input)
      : applyEmployeeLifecycleSuspensionResolution(currentRecord, input);

  draft.suspensionRecords[recordIndex] = nextRecord;

  return nextRecord;
};

const buildSuspensionReadModel = (
  state: EmployeeLifecycleState,
  record: ReturnType<typeof createEmployeeLifecycleSuspensionRecord>
): EmployeeLifecycleSuspensionReadModel => {
  const readModel = buildEmployeeLifecycleSuspensionReadModel({
    state,
    record,
  });

  if (readModel === null) {
    throw new Error(
      `Employee ${state.employeeId} suspension read model could not be built.`
    );
  }

  return employeeLifecycleSuspensionReadModelSchema.parse(readModel);
};

export function startEmployeeLifecycleSuspension(
  input: EmployeeLifecycleSuspensionStartCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  const parsedInput = employeeLifecycleSuspensionStartInputSchema.parse(input);
  const resolvedScope = resolveEmployeeLifecycleSuspensionScope(
    parsedInput,
    scope
  );
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;
  let readModel: EmployeeLifecycleSuspensionReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Suspension state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleSuspensionStateIsEligible(currentState);

    const nextRecord = resolveEmployeeLifecycleSuspensionRecord(draft, {
      ...parsedInput,
      companyId: resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
      tenantId: resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
      effectiveAt,
      recordedAt,
    });

    const recordIndex = draft.suspensionRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      draft.suspensionRecords = [...draft.suspensionRecords, nextRecord];
    } else {
      draft.suspensionRecords[recordIndex] = nextRecord;
    }

    const nextState = applyEmployeeLifecycleTransition(currentState, {
      toStage: "suspended",
      effectiveAt,
      recordedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      approvalReference: parsedInput.approvalReference ?? null,
    });
    draft.states[stateIndex] = nextState;

    readModel = buildSuspensionReadModel(nextState, nextRecord);
  }, resolvedScope);

  return employeeLifecycleSuspensionReadModelSchema.parse(readModel);
}

export function startEmployeeLifecycleHold(
  input: Omit<EmployeeLifecycleSuspensionStartCommandInput, "suspensionKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  return startEmployeeLifecycleSuspension(
    {
      ...input,
      suspensionKind: "hold",
    },
    scope
  );
}

const resolveEmployeeLifecycleSuspensionAction = (
  input: EmployeeLifecycleSuspensionResolutionCommandInput,
  scope: EmployeeLifecycleRepositoryScope | undefined,
  resolutionPath: "released" | "resolved"
): EmployeeLifecycleSuspensionReadModel => {
  const parsedInput =
    employeeLifecycleSuspensionResolutionInputSchema.parse(input);
  const closedAt = parsedInput.closedAt ?? new Date();
  let readModel: EmployeeLifecycleSuspensionReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Suspension state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleSuspensionStateIsSuspended(currentState);

    const currentRecord = draft.suspensionRecords.find(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (!currentRecord) {
      throw new Error(
        `Suspension record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = closeEmployeeLifecycleSuspensionRecord(
      draft,
      {
        ...parsedInput,
        closedAt,
      },
      resolutionPath
    );

    const nextState = applyEmployeeLifecycleTransition(currentState, {
      toStage: "active",
      effectiveAt: closedAt,
      recordedAt: closedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      approvalReference: parsedInput.approvalReference ?? null,
    });
    draft.states[stateIndex] = nextState;

    readModel = buildSuspensionReadModel(nextState, nextRecord);
  }, scope);

  return employeeLifecycleSuspensionReadModelSchema.parse(readModel);
};

export function releaseEmployeeLifecycleSuspension(
  input: EmployeeLifecycleSuspensionResolutionCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  return resolveEmployeeLifecycleSuspensionAction(input, scope, "released");
}

export function releaseEmployeeLifecycleHold(
  input: Omit<
    EmployeeLifecycleSuspensionResolutionCommandInput,
    "suspensionKind"
  >,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  return releaseEmployeeLifecycleSuspension(
    {
      ...input,
      suspensionKind: "hold",
    },
    scope
  );
}

export function resolveEmployeeLifecycleSuspension(
  input: EmployeeLifecycleSuspensionResolutionCommandInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  return resolveEmployeeLifecycleSuspensionAction(input, scope, "resolved");
}

export function resolveEmployeeLifecycleHold(
  input: Omit<
    EmployeeLifecycleSuspensionResolutionCommandInput,
    "suspensionKind"
  >,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel {
  return resolveEmployeeLifecycleSuspension(
    {
      ...input,
      suspensionKind: "hold",
    },
    scope
  );
}

export const employeeLifecycleSuspensionActionCatalog = {
  start: "startEmployeeLifecycleSuspension",
  hold: "startEmployeeLifecycleHold",
  release: "releaseEmployeeLifecycleSuspension",
  releaseHold: "releaseEmployeeLifecycleHold",
  resolve: "resolveEmployeeLifecycleSuspension",
  resolveHold: "resolveEmployeeLifecycleHold",
} as const;

const resolveEmployeeLifecycleExitScope = (
  input: Readonly<{
    companyId?: string | null;
    tenantId?: string | null;
  }>,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return {
      companyId: input.companyId ?? undefined,
      tenantId: input.tenantId ?? undefined,
    };
  }

  if (
    input.companyId &&
    scope.companyId &&
    input.companyId !== scope.companyId
  ) {
    throw new Error("Exit input companyId does not match repository scope");
  }

  if (input.tenantId && scope.tenantId && input.tenantId !== scope.tenantId) {
    throw new Error("Exit input tenantId does not match repository scope");
  }

  return {
    companyId: scope.companyId ?? input.companyId ?? undefined,
    tenantId: scope.tenantId ?? input.tenantId ?? undefined,
  };
};

const ensureEmployeeLifecycleExitStateIsEligible = (
  state: EmployeeLifecycleState
): void => {
  if (
    state.currentStage === "notice_period" ||
    state.currentStage === "offboarding" ||
    state.currentStage === "separated" ||
    state.currentStage === "retired" ||
    state.currentStage === "archived"
  ) {
    throw new Error(
      `Employee ${state.employeeId} already has an exit lifecycle in progress or completed.`
    );
  }
};

const ensureEmployeeLifecycleExitStateIsNoticePeriod = (
  state: EmployeeLifecycleState
): void => {
  if (state.currentStage !== "notice_period") {
    throw new Error(
      `Employee ${state.employeeId} must be in the notice period before offboarding can be triggered.`
    );
  }
};

const buildExitReadModel = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleExitRecord
): EmployeeLifecycleExitReadModel => {
  const readModel = buildEmployeeLifecycleExitReadModel({
    state,
    record,
  });

  if (readModel === null) {
    throw new Error(`Employee ${state.employeeId} exit read model is invalid.`);
  }

  return employeeLifecycleExitReadModelSchema.parse(readModel);
};

const startEmployeeLifecycleExit = (
  input: Omit<EmployeeLifecycleExitStartInput, "exitKind">,
  scope: EmployeeLifecycleRepositoryScope | undefined,
  exitKind:
    | "resignation"
    | "termination"
    | "retirement"
    | "contract_expiry"
): EmployeeLifecycleExitReadModel => {
  const parsedInput = employeeLifecycleExitStartInputSchema.parse({
    ...input,
    exitKind,
  });
  const resolvedScope = resolveEmployeeLifecycleExitScope(parsedInput, scope);
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;
  let readModel: EmployeeLifecycleExitReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Exit state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleExitStateIsEligible(currentState);

    const recordIndex = draft.exitRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex >= 0) {
      throw new Error(
        `Exit record already exists for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = createEmployeeLifecycleExitRecord({
      ...parsedInput,
      companyId: resolvedScope?.companyId ?? parsedInput.companyId ?? undefined,
      tenantId: resolvedScope?.tenantId ?? parsedInput.tenantId ?? undefined,
      effectiveAt,
      recordedAt,
    });
    draft.exitRecords = [...draft.exitRecords, nextRecord];

    const nextState = applyEmployeeLifecycleTransition(currentState, {
      toStage: "notice_period",
      effectiveAt,
      recordedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      approvalReference: parsedInput.approvalReference ?? null,
    });
    draft.states[stateIndex] = nextState;

    readModel = buildExitReadModel(nextState, nextRecord);
  }, resolvedScope);

  return employeeLifecycleExitReadModelSchema.parse(readModel);
};

export function startEmployeeLifecycleResignation(
  input: Omit<EmployeeLifecycleExitStartInput, "exitKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  return startEmployeeLifecycleExit(input, scope, "resignation");
}

export function startEmployeeLifecycleTermination(
  input: Omit<EmployeeLifecycleExitStartInput, "exitKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  return startEmployeeLifecycleExit(input, scope, "termination");
}

export function startEmployeeLifecycleRetirement(
  input: Omit<EmployeeLifecycleExitStartInput, "exitKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  return startEmployeeLifecycleExit(input, scope, "retirement");
}

export function startEmployeeLifecycleContractEnd(
  input: Omit<EmployeeLifecycleExitStartInput, "exitKind">,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  return startEmployeeLifecycleExit(input, scope, "contract_expiry");
}

export function recordEmployeeLifecycleExitNotice(
  input: EmployeeLifecycleExitNoticeInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  const parsedInput = employeeLifecycleExitNoticeInputSchema.parse(input);
  const recordedAt = parsedInput.noticeRecordedAt ?? new Date();
  let readModel: EmployeeLifecycleExitReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Exit state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleExitStateIsNoticePeriod(currentState);

    const recordIndex = draft.exitRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Exit record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = appendEmployeeLifecycleExitNotice(
      draft.exitRecords[recordIndex],
      {
        ...parsedInput,
        noticeRecordedAt: recordedAt,
      }
    );
    draft.exitRecords[recordIndex] = nextRecord;

    readModel = buildExitReadModel(currentState, nextRecord);
  }, scope);

  return employeeLifecycleExitReadModelSchema.parse(readModel);
}

export function triggerEmployeeLifecycleOffboarding(
  input: EmployeeLifecycleExitOffboardingInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  const parsedInput = employeeLifecycleExitOffboardingInputSchema.parse(input);
  const offboardingAt = parsedInput.offboardingAt ?? new Date();
  let readModel: EmployeeLifecycleExitReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Exit state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    ensureEmployeeLifecycleExitStateIsNoticePeriod(currentState);

    const recordIndex = draft.exitRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Exit record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = applyEmployeeLifecycleExitOffboarding(
      draft.exitRecords[recordIndex],
      {
        ...parsedInput,
        offboardingAt,
      }
    );
    draft.exitRecords[recordIndex] = nextRecord;

    const nextState = applyEmployeeLifecycleTransition(currentState, {
      toStage: "offboarding",
      effectiveAt: offboardingAt,
      recordedAt: offboardingAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
    });
    draft.states[stateIndex] = nextState;

    readModel = buildExitReadModel(nextState, nextRecord);
  }, scope);

  return employeeLifecycleExitReadModelSchema.parse(readModel);
}

export function archiveEmployeeLifecycleExit(
  input: EmployeeLifecycleExitArchiveInput,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel {
  const parsedInput = employeeLifecycleExitArchiveInputSchema.parse(input);
  const archivedAt = parsedInput.archivedAt ?? new Date();
  let readModel: EmployeeLifecycleExitReadModel | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Exit state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    if (
      currentState.currentStage !== "offboarding" &&
      currentState.currentStage !== "separated" &&
      currentState.currentStage !== "retired"
    ) {
      throw new Error(
        `Employee ${parsedInput.employeeId} must be in offboarding before archival can be recorded.`
      );
    }

    const recordIndex = draft.exitRecords.findIndex(
      (record) => record.employeeId === parsedInput.employeeId
    );
    if (recordIndex < 0) {
      throw new Error(
        `Exit record not found for employee ${parsedInput.employeeId}.`
      );
    }

    const nextRecord = applyEmployeeLifecycleExitArchive(
      draft.exitRecords[recordIndex],
      {
        ...parsedInput,
        archivedAt,
      }
    );
    draft.exitRecords[recordIndex] = nextRecord;

    const latestEntry = nextRecord.entries.at(-1);
    if (!latestEntry) {
      throw new Error(
        `Exit record for employee ${parsedInput.employeeId} is missing its latest entry.`
      );
    }

    let nextState = currentState;
    if (currentState.currentStage === "offboarding") {
      nextState = applyEmployeeLifecycleTransition(currentState, {
        toStage: latestEntry.finalStage,
        effectiveAt: archivedAt,
        recordedAt: archivedAt,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
      });
    }

    if (nextState.currentStage !== "archived") {
      nextState = applyEmployeeLifecycleTransition(nextState, {
        toStage: "archived",
        effectiveAt: archivedAt,
        recordedAt: archivedAt,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
      });
    }

    draft.states[stateIndex] = nextState;
    readModel = buildExitReadModel(nextState, nextRecord);
  }, scope);

  return employeeLifecycleExitReadModelSchema.parse(readModel);
}

export function transitionEmployeeLifecycleState(
  input: EmployeeLifecycleTransitionRequest,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleState {
  const parsedInput = employeeLifecycleTransitionRequestSchema.parse(input);
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;
  let nextState: EmployeeLifecycleState | null = null;

  mutateEmployeeLifecycleAction((draft) => {
    const stateIndex = draft.states.findIndex(
      (state) => state.employeeId === parsedInput.employeeId
    );
    if (stateIndex < 0) {
      throw new Error(
        `Lifecycle state not found for employee ${parsedInput.employeeId}.`
      );
    }

    const currentState = draft.states[stateIndex];
    if (
      parsedInput.companyId &&
      currentState.companyId &&
      parsedInput.companyId !== currentState.companyId
    ) {
      throw new Error(
        "Transition input companyId does not match repository state"
      );
    }

    if (
      parsedInput.tenantId &&
      currentState.tenantId &&
      parsedInput.tenantId !== currentState.tenantId
    ) {
      throw new Error(
        "Transition input tenantId does not match repository state"
      );
    }

    nextState = applyEmployeeLifecycleTransition(currentState, {
      toStage: parsedInput.toStage,
      effectiveAt,
      recordedAt,
      actorId: parsedInput.actorId ?? undefined,
      reason: parsedInput.reason ?? null,
      approvalReference: parsedInput.approvalReference ?? null,
      metadata: parsedInput.metadata,
    });
    draft.states[stateIndex] = nextState;
  }, scope);

  if (!nextState) {
    throw new Error(
      `Employee lifecycle transition could not be applied for ${parsedInput.employeeId}.`
    );
  }

  return nextState;
}

export const employeeLifecycleExitActionCatalog = {
  startResignation: "startEmployeeLifecycleResignation",
  startTermination: "startEmployeeLifecycleTermination",
  startRetirement: "startEmployeeLifecycleRetirement",
  startContractEnd: "startEmployeeLifecycleContractEnd",
  recordNotice: "recordEmployeeLifecycleExitNotice",
  triggerOffboarding: "triggerEmployeeLifecycleOffboarding",
  archive: "archiveEmployeeLifecycleExit",
} as const;

export const employeeLifecycleTransitionActionCatalog = {
  transition: "transitionEmployeeLifecycleState",
} as const;
