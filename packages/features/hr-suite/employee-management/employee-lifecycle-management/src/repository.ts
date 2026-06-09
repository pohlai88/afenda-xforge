import "server-only";

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import type { EmployeeLifecycleManagementAuditEvent } from "./registry/audit.ts";
import { employeeLifecycleManagementAuditEvents } from "./registry/audit.ts";
import type {
  EmployeeLifecycleContractRecord,
  EmployeeLifecycleExitRecord,
  EmployeeLifecycleMovementRecord,
  EmployeeLifecycleOnboardingRecord,
  EmployeeLifecycleProbationRecord,
  EmployeeLifecycleState,
  EmployeeLifecycleSuspensionRecord,
} from "./schema.ts";
import {
  assertEmployeeLifecycleStateConsistent,
  employeeLifecycleContractRecordSchema,
  employeeLifecycleExitRecordSchema,
  employeeLifecycleMovementRecordSchema,
  employeeLifecycleOnboardingRecordSchema,
  employeeLifecycleProbationRecordSchema,
  employeeLifecycleStateSchema,
  employeeLifecycleSuspensionRecordSchema,
} from "./schema.ts";

export type EmployeeLifecycleRepositoryScope = Readonly<{
  companyId?: string | null;
  tenantId?: string | null;
}>;

export type EmployeeLifecycleRepositoryState = {
  states: EmployeeLifecycleState[];
  onboardingRecords: EmployeeLifecycleOnboardingRecord[];
  movementRecords: EmployeeLifecycleMovementRecord[];
  probationRecords: EmployeeLifecycleProbationRecord[];
  contractRecords: EmployeeLifecycleContractRecord[];
  suspensionRecords: EmployeeLifecycleSuspensionRecord[];
  exitRecords: EmployeeLifecycleExitRecord[];
};

export type EmployeeLifecycleRepositoryMutationResult =
  EmployeeLifecycleRepositoryState;

const employeeLifecycleRepositoryStateSchema = z.object({
  states: employeeLifecycleStateSchema.array(),
  onboardingRecords: employeeLifecycleOnboardingRecordSchema
    .array()
    .default([]),
  movementRecords: employeeLifecycleMovementRecordSchema.array().default([]),
  probationRecords: employeeLifecycleProbationRecordSchema.array().default([]),
  contractRecords: employeeLifecycleContractRecordSchema.array().default([]),
  suspensionRecords: employeeLifecycleSuspensionRecordSchema
    .array()
    .default([]),
  exitRecords: employeeLifecycleExitRecordSchema.array().default([]),
});

const employeeLifecycleRepositoryScopeSchema = z.object({
  companyId: z.string().trim().min(1).nullable().optional(),
  tenantId: z.string().trim().min(1).nullable().optional(),
});

let repositoryFilePath: string =
  process.env.AFENDA_EMPLOYEE_LIFECYCLE_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_EMPLOYEE_LIFECYCLE_MANAGEMENT_STORE_PATH ??
  resolve(
    process.cwd(),
    ".cache",
    "hr-suite",
    "employee-lifecycle-management.repository.json"
  );

let cache: EmployeeLifecycleRepositoryState | null = null;

const emptyState = (): EmployeeLifecycleRepositoryState => ({
  states: [],
  onboardingRecords: [],
  movementRecords: [],
  probationRecords: [],
  contractRecords: [],
  suspensionRecords: [],
  exitRecords: [],
});

const serializeState = (state: EmployeeLifecycleRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const cloneState = (
  state: EmployeeLifecycleRepositoryState
): EmployeeLifecycleRepositoryState => structuredClone(state);

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readStateFromDisk = (): EmployeeLifecycleRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  return employeeLifecycleRepositoryStateSchema.parse(parsed);
};

const persistState = (state: EmployeeLifecycleRepositoryState): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const normalizeScope = (
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryScope | undefined => {
  if (scope === undefined) {
    return;
  }

  return employeeLifecycleRepositoryScopeSchema.parse(scope);
};

const matchesScope = (
  state: Pick<
    EmployeeLifecycleState | EmployeeLifecycleOnboardingRecord,
    "companyId" | "tenantId"
  >,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  if (scope?.tenantId !== undefined && state.tenantId !== scope.tenantId) {
    return false;
  }

  if (scope?.companyId !== undefined && state.companyId !== scope.companyId) {
    return false;
  }

  return true;
};

const filterScopedState = (
  state: EmployeeLifecycleRepositoryState,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryState => {
  if (scope === undefined) {
    return cloneState(state);
  }

  return {
    states: state.states.filter((entry) => matchesScope(entry, scope)),
    onboardingRecords: state.onboardingRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
    movementRecords: state.movementRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
    probationRecords: state.probationRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
    contractRecords: state.contractRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
    suspensionRecords: state.suspensionRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
    exitRecords: state.exitRecords.filter((entry) =>
      matchesScope(entry, scope)
    ),
  };
};

const assertStateMatchesScope = (
  state: EmployeeLifecycleRepositoryState,
  scope?: EmployeeLifecycleRepositoryScope
): void => {
  if (scope === undefined) {
    return;
  }

  const invalidState = state.states.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidOnboardingRecord = state.onboardingRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidMovementRecord = state.movementRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidProbationRecord = state.probationRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidContractRecord = state.contractRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidSuspensionRecord = state.suspensionRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  const invalidExitRecord = state.exitRecords.find(
    (entry) => !matchesScope(entry, scope)
  );
  if (
    invalidState ||
    invalidOnboardingRecord ||
    invalidMovementRecord ||
    invalidProbationRecord ||
    invalidContractRecord ||
    invalidSuspensionRecord ||
    invalidExitRecord
  ) {
    throw new Error(
      "Employee lifecycle repository state contains records outside the requested scope."
    );
  }
};

const mergeScopedState = (
  current: EmployeeLifecycleRepositoryState,
  next: EmployeeLifecycleRepositoryState,
  scope: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryState => {
  const retainedStates = current.states.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedOnboardingRecords = current.onboardingRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedMovementRecords = current.movementRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedProbationRecords = current.probationRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedContractRecords = current.contractRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedSuspensionRecords = current.suspensionRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );
  const retainedExitRecords = current.exitRecords.filter(
    (entry) => !matchesScope(entry, scope)
  );

  return {
    states: [...retainedStates, ...next.states],
    onboardingRecords: [
      ...retainedOnboardingRecords,
      ...next.onboardingRecords,
    ],
    movementRecords: [...retainedMovementRecords, ...next.movementRecords],
    probationRecords: [...retainedProbationRecords, ...next.probationRecords],
    contractRecords: [...retainedContractRecords, ...next.contractRecords],
    suspensionRecords: [
      ...retainedSuspensionRecords,
      ...next.suspensionRecords,
    ],
    exitRecords: [...retainedExitRecords, ...next.exitRecords],
  };
};

const loadRepositoryState = (): EmployeeLifecycleRepositoryState => {
  if (cache === null) {
    cache = readStateFromDisk();
  }

  return cloneState(cache);
};

const saveRepositoryState = (state: EmployeeLifecycleRepositoryState): void => {
  cache = cloneState(state);
  persistState(cache);
};

export const createEmployeeLifecycleRepositoryId = (): string => randomUUID();

export const getEmployeeLifecycleRepositoryPath = (): string =>
  repositoryFilePath;

export const setEmployeeLifecycleRepositoryPathForTesting = (
  nextPath: string
): void => {
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const resetEmployeeLifecycleRepositoryForTesting = (): void => {
  cache = emptyState();
  persistState(cache);
};

export const loadEmployeeLifecycleRepository = (
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleRepositoryState =>
  filterScopedState(loadRepositoryState(), normalizeScope(scope));

export const saveEmployeeLifecycleRepository = (
  nextState: EmployeeLifecycleRepositoryState,
  scope?: EmployeeLifecycleRepositoryScope
): void => {
  const normalizedScope = normalizeScope(scope);

  assertStateMatchesScope(nextState, normalizedScope);

  if (normalizedScope === undefined) {
    saveRepositoryState(nextState);
    return;
  }

  const currentState = loadRepositoryState();
  saveRepositoryState(
    mergeScopedState(currentState, nextState, normalizedScope)
  );
};

export const mutateEmployeeLifecycleRepository = <
  TResult = EmployeeLifecycleRepositoryMutationResult,
>(
  updater: (draft: EmployeeLifecycleRepositoryState) => TResult,
  scope?: EmployeeLifecycleRepositoryScope
): TResult => {
  const normalizedScope = normalizeScope(scope);
  const nextState = loadEmployeeLifecycleRepository(normalizedScope);
  const result = updater(nextState);
  saveEmployeeLifecycleRepository(nextState, normalizedScope);
  return result;
};

export const findEmployeeLifecycleStateByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleState | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.states.find((state) => state.employeeId === employeeId) ??
    null
  );
};

export const findEmployeeLifecycleOnboardingRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.onboardingRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const findEmployeeLifecycleProbationRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.probationRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const findEmployeeLifecycleMovementRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.movementRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const findEmployeeLifecycleContractRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.contractRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const findEmployeeLifecycleSuspensionRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.suspensionRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const findEmployeeLifecycleExitRecordByEmployeeId = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitRecord | null => {
  const repositoryState = loadEmployeeLifecycleRepository(scope);
  return (
    repositoryState.exitRecords.find(
      (record) => record.employeeId === employeeId
    ) ?? null
  );
};

export const upsertEmployeeLifecycleState = (
  nextState: EmployeeLifecycleState,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleState => {
  assertEmployeeLifecycleStateConsistent(nextState);

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.states.findIndex(
      (state) => state.employeeId === nextState.employeeId
    );

    if (index < 0) {
      draft.states = [...draft.states, nextState];
      return;
    }

    const nextStates = [...draft.states];
    nextStates[index] = nextState;
    draft.states = nextStates;
  }, scope);

  return nextState;
};

export const upsertEmployeeLifecycleOnboardingRecord = (
  nextRecord: EmployeeLifecycleOnboardingRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle onboarding record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.onboardingRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.onboardingRecords = [...draft.onboardingRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.onboardingRecords];
    nextRecords[index] = nextRecord;
    draft.onboardingRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const upsertEmployeeLifecycleProbationRecord = (
  nextRecord: EmployeeLifecycleProbationRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle probation record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.probationRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.probationRecords = [...draft.probationRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.probationRecords];
    nextRecords[index] = nextRecord;
    draft.probationRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const upsertEmployeeLifecycleMovementRecord = (
  nextRecord: EmployeeLifecycleMovementRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle movement record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.movementRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.movementRecords = [...draft.movementRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.movementRecords];
    nextRecords[index] = nextRecord;
    draft.movementRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const upsertEmployeeLifecycleContractRecord = (
  nextRecord: EmployeeLifecycleContractRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle contract record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.contractRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.contractRecords = [...draft.contractRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.contractRecords];
    nextRecords[index] = nextRecord;
    draft.contractRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const upsertEmployeeLifecycleSuspensionRecord = (
  nextRecord: EmployeeLifecycleSuspensionRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle suspension record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.suspensionRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.suspensionRecords = [...draft.suspensionRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.suspensionRecords];
    nextRecords[index] = nextRecord;
    draft.suspensionRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const upsertEmployeeLifecycleExitRecord = (
  nextRecord: EmployeeLifecycleExitRecord,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitRecord => {
  if (scope && !matchesScope(nextRecord, scope)) {
    throw new Error(
      "Employee lifecycle exit record does not match the requested scope."
    );
  }

  mutateEmployeeLifecycleRepository((draft) => {
    const index = draft.exitRecords.findIndex(
      (record) => record.employeeId === nextRecord.employeeId
    );

    if (index < 0) {
      draft.exitRecords = [...draft.exitRecords, nextRecord];
      return;
    }

    const nextRecords = [...draft.exitRecords];
    nextRecords[index] = nextRecord;
    draft.exitRecords = nextRecords;
  }, scope);

  return nextRecord;
};

export const removeEmployeeLifecycleOnboardingRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.onboardingRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.onboardingRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleProbationRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.probationRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.probationRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleMovementRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.movementRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.movementRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleContractRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.contractRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.contractRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleSuspensionRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.suspensionRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.suspensionRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleExitRecord = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextRecords = draft.exitRecords.filter((record) => {
      const shouldRemove = record.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.exitRecords = nextRecords;
  }, scope);

  return removed;
};

export const removeEmployeeLifecycleState = (
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): boolean => {
  let removed = false;

  mutateEmployeeLifecycleRepository((draft) => {
    const nextStates = draft.states.filter((state) => {
      const shouldRemove = state.employeeId === employeeId;
      if (shouldRemove) {
        removed = true;
      }
      return !shouldRemove;
    });

    draft.states = nextStates;
  }, scope);

  return removed;
};

export type EmployeeLifecycleRepositoryAuditEvent = Readonly<{
  actorId?: string | null;
  companyId?: string | null;
  createdAt: Date;
  employeeId: string;
  event: EmployeeLifecycleManagementAuditEvent;
  id: string;
  metadata: Record<string, unknown>;
  reason?: string | null;
  tenantId?: string | null;
}>;

export const employeeLifecycleRepositoryAuditEventSchema = z.object({
  actorId: z.string().trim().min(1).nullable().optional(),
  companyId: z.string().trim().min(1).nullable().optional(),
  createdAt: z.preprocess((value: unknown) => {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date;
    }

    return value;
  }, z.date()),
  employeeId: z.string().trim().min(1),
  event: z.enum([
    employeeLifecycleManagementAuditEvents.stateInitialized,
    employeeLifecycleManagementAuditEvents.transitionApplied,
    employeeLifecycleManagementAuditEvents.transitionRejected,
    employeeLifecycleManagementAuditEvents.historyRebuilt,
    employeeLifecycleManagementAuditEvents.probationStarted,
    employeeLifecycleManagementAuditEvents.probationReviewScheduled,
    employeeLifecycleManagementAuditEvents.probationReviewRecorded,
    employeeLifecycleManagementAuditEvents.probationExtended,
    employeeLifecycleManagementAuditEvents.probationConfirmationApproved,
    employeeLifecycleManagementAuditEvents.probationTerminationRecommended,
    employeeLifecycleManagementAuditEvents.movementRecorded,
    employeeLifecycleManagementAuditEvents.contractStarted,
    employeeLifecycleManagementAuditEvents.contractRenewed,
    employeeLifecycleManagementAuditEvents.contractReviewRecorded,
    employeeLifecycleManagementAuditEvents.contractReminderRecorded,
    employeeLifecycleManagementAuditEvents.suspensionStarted,
    employeeLifecycleManagementAuditEvents.suspensionReleased,
    employeeLifecycleManagementAuditEvents.suspensionResolved,
    employeeLifecycleManagementAuditEvents.resignationStarted,
    employeeLifecycleManagementAuditEvents.terminationStarted,
    employeeLifecycleManagementAuditEvents.retirementStarted,
    employeeLifecycleManagementAuditEvents.exitNoticeRecorded,
    employeeLifecycleManagementAuditEvents.exitOffboardingTriggered,
    employeeLifecycleManagementAuditEvents.exitArchived,
  ]),
  id: z.string().trim().min(1),
  metadata: z.record(z.string(), z.unknown()),
  reason: z.string().trim().nullable().optional(),
  tenantId: z.string().trim().min(1).nullable().optional(),
});
