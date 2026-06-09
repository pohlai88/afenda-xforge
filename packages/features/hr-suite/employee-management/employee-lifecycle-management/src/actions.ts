import "server-only";

import type {
  EmployeeLifecycleRepositoryScope,
  EmployeeLifecycleRepositoryState,
} from "./repository.ts";
import {
  findEmployeeLifecycleStateByEmployeeId,
  mutateEmployeeLifecycleRepository,
} from "./repository.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleContractReminderInput,
  EmployeeLifecycleContractRenewalInput,
  EmployeeLifecycleContractReviewInput,
  EmployeeLifecycleContractStartInput,
  EmployeeLifecycleMovementInput,
  EmployeeLifecycleMovementKindValue,
  EmployeeLifecycleMovementReadModel,
  EmployeeLifecycleOnboardingProfile,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleOnboardingTaskCodeValue,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleProbationReviewOutcomeValue,
  EmployeeLifecycleState,
} from "./schema.ts";
import {
  appendEmployeeLifecycleMovement,
  applyEmployeeLifecycleContractReminder,
  applyEmployeeLifecycleContractRenewal,
  applyEmployeeLifecycleContractReview,
  completeEmployeeLifecycleOnboardingRecordTask as applyEmployeeLifecycleTaskCompletion,
  applyEmployeeLifecycleTransition,
  approveEmployeeLifecycleProbationConfirmationRecord,
  buildEmployeeLifecycleContractReadModel,
  buildEmployeeLifecycleMovementReadModel,
  buildEmployeeLifecycleOnboardingReadModel,
  buildEmployeeLifecycleProbationReadModel,
  createEmployeeLifecycleContractRecord,
  createEmployeeLifecycleMovementRecord,
  createEmployeeLifecycleOnboardingRecord,
  createEmployeeLifecycleProbationRecord,
  createEmployeeLifecycleState,
  employeeLifecycleContractReadModelSchema,
  employeeLifecycleContractReminderInputSchema,
  employeeLifecycleContractRenewalInputSchema,
  employeeLifecycleContractReviewInputSchema,
  employeeLifecycleContractStartInputSchema,
  employeeLifecycleMovementInputSchema,
  employeeLifecycleMovementReadModelSchema,
  employeeLifecycleOnboardingProfileSchema,
  employeeLifecycleOnboardingReadModelSchema,
  employeeLifecycleProbationApprovalInputSchema,
  employeeLifecycleProbationExtensionInputSchema,
  employeeLifecycleProbationReadModelSchema,
  employeeLifecycleProbationReviewInputSchema,
  employeeLifecycleProbationStartInputSchema,
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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
    state.currentStage === "separated" ||
    state.currentStage === "retired" ||
    state.currentStage === "archived"
  ) {
    throw new Error(
      `Employee ${state.employeeId} cannot have a contract lifecycle updated after exit.`
    );
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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

  mutateEmployeeLifecycleRepository((draft) => {
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
