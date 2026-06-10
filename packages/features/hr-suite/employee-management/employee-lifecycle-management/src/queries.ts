import "server-only";

import type { EmployeeLifecycleManagementPolicyContext } from "./policy.ts";
import type {
  EmployeeLifecycleHistoryEntry,
  EmployeeLifecycleOverviewEntry,
  EmployeeLifecycleOverviewSnapshot,
  EmployeeLifecycleStageSummary,
  EmployeeLifecycleTaskEntry,
} from "./projector.ts";
import {
  projectEmployeeLifecycleAuditTrailEntries,
  projectEmployeeLifecycleHistoryEntries,
  projectEmployeeLifecycleOverviewEntries,
  projectEmployeeLifecycleOverviewSnapshot,
  projectEmployeeLifecycleStageSummaries,
  projectEmployeeLifecycleTaskEntries,
} from "./projector.ts";
import type { EmployeeLifecycleRepositoryScope } from "./repository.ts";
import {
  findEmployeeLifecycleContractRecordByEmployeeId,
  findEmployeeLifecycleExitRecordByEmployeeId,
  findEmployeeLifecycleMovementRecordByEmployeeId,
  findEmployeeLifecycleOnboardingRecordByEmployeeId,
  findEmployeeLifecycleProbationRecordByEmployeeId,
  findEmployeeLifecycleStateByEmployeeId,
  findEmployeeLifecycleSuspensionRecordByEmployeeId,
  loadEmployeeLifecycleRepository,
} from "./repository.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleContractReminderEntry,
  EmployeeLifecycleContractReviewEntry,
  EmployeeLifecycleExitEntry,
  EmployeeLifecycleExitReadModel,
  EmployeeLifecycleMovementEntry,
  EmployeeLifecycleMovementReadModel,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleOnboardingTask,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleProbationReviewEntry,
  EmployeeLifecycleSuspensionEntry,
  EmployeeLifecycleSuspensionReadModel,
} from "./schema.ts";
import {
  buildEmployeeLifecycleContractReadModel,
  buildEmployeeLifecycleExitReadModel,
  buildEmployeeLifecycleMovementReadModel,
  buildEmployeeLifecycleOnboardingReadModel,
  buildEmployeeLifecycleProbationReadModel,
  buildEmployeeLifecycleSuspensionReadModel,
} from "./schema.ts";

export function getEmployeeLifecycleOnboardingStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOnboardingReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleOnboardingReadModel({
    state,
    record: findEmployeeLifecycleOnboardingRecordByEmployeeId(
      employeeId,
      scope
    ),
  });
}

export function listEmployeeLifecycleOnboardingTasks(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleOnboardingTask[] {
  return getEmployeeLifecycleOnboardingStatus(employeeId, scope)?.tasks ?? [];
}

export function listEmployeeLifecycleOnboardingStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleOnboardingReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleOnboardingReadModel({
        state,
        record: findEmployeeLifecycleOnboardingRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleOnboardingReadModel =>
        readModel !== null
    );
}

export function getEmployeeLifecycleProbationStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleProbationReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleProbationReadModel({
    state,
    record: findEmployeeLifecycleProbationRecordByEmployeeId(employeeId, scope),
  });
}

export function listEmployeeLifecycleProbationReviews(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleProbationReviewEntry[] {
  return (
    getEmployeeLifecycleProbationStatus(employeeId, scope)?.reviewHistory ?? []
  );
}

export function listEmployeeLifecycleProbationStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleProbationReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleProbationReadModel({
        state,
        record: findEmployeeLifecycleProbationRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleProbationReadModel =>
        readModel !== null
    );
}

export function getEmployeeLifecycleContractStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope,
  referenceNow?: Date
): EmployeeLifecycleContractReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleContractReadModel({
    now: referenceNow,
    state,
    record: findEmployeeLifecycleContractRecordByEmployeeId(employeeId, scope),
  });
}

export function listEmployeeLifecycleContractReviewEntries(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleContractReviewEntry[] {
  return (
    getEmployeeLifecycleContractStatus(employeeId, scope)?.reviewHistory ?? []
  );
}

export function listEmployeeLifecycleContractReminderEntries(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleContractReminderEntry[] {
  return (
    getEmployeeLifecycleContractStatus(employeeId, scope)?.reminderHistory ?? []
  );
}

export function listEmployeeLifecycleContractStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleContractReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleContractReadModel({
        state,
        record: findEmployeeLifecycleContractRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleContractReadModel =>
        readModel !== null
    )
    .sort(
      (left, right) =>
        left.expiryAt.getTime() - right.expiryAt.getTime() ||
        left.employeeId.localeCompare(right.employeeId)
    );
}

export function getEmployeeLifecycleExitStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleExitReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleExitReadModel({
    state,
    record: findEmployeeLifecycleExitRecordByEmployeeId(employeeId, scope),
  });
}

export function listEmployeeLifecycleExitEntries(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleExitEntry[] {
  return getEmployeeLifecycleExitStatus(employeeId, scope)?.entries ?? [];
}

export function listEmployeeLifecycleExitStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleExitReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleExitReadModel({
        state,
        record: findEmployeeLifecycleExitRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleExitReadModel =>
        readModel !== null
    )
    .sort(
      (left, right) =>
        left.startedAt.getTime() - right.startedAt.getTime() ||
        left.employeeId.localeCompare(right.employeeId)
    );
}

export function getEmployeeLifecycleSuspensionStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleSuspensionReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleSuspensionReadModel({
    state,
    record: findEmployeeLifecycleSuspensionRecordByEmployeeId(
      employeeId,
      scope
    ),
  });
}

export function listEmployeeLifecycleSuspensionEntries(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleSuspensionEntry[] {
  return getEmployeeLifecycleSuspensionStatus(employeeId, scope)?.entries ?? [];
}

export function listEmployeeLifecycleSuspensionStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleSuspensionReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleSuspensionReadModel({
        state,
        record: findEmployeeLifecycleSuspensionRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleSuspensionReadModel =>
        readModel !== null
    )
    .sort(
      (left, right) =>
        left.startedAt.getTime() - right.startedAt.getTime() ||
        left.employeeId.localeCompare(right.employeeId)
    );
}

export function getEmployeeLifecycleMovementStatus(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleMovementReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleMovementReadModel({
    state,
    record: findEmployeeLifecycleMovementRecordByEmployeeId(employeeId, scope),
  });
}

export function listEmployeeLifecycleMovementEntries(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleMovementEntry[] {
  return getEmployeeLifecycleMovementStatus(employeeId, scope)?.movements ?? [];
}

export function listEmployeeLifecycleMovementStatuses(
  scope?: EmployeeLifecycleRepositoryScope
): readonly EmployeeLifecycleMovementReadModel[] {
  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) =>
      buildEmployeeLifecycleMovementReadModel({
        state,
        record: findEmployeeLifecycleMovementRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      })
    )
    .filter(
      (readModel): readModel is EmployeeLifecycleMovementReadModel =>
        readModel !== null
    );
}

export function getEmployeeLifecycleOverviewSnapshot(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleOverviewSnapshot {
  return projectEmployeeLifecycleOverviewSnapshot(scope, context);
}

export function listEmployeeLifecycleOverviewEntries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): readonly EmployeeLifecycleOverviewEntry[] {
  return projectEmployeeLifecycleOverviewEntries(scope, context);
}

export function getEmployeeLifecycleOverviewEntry(
  employeeId: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleOverviewEntry | null {
  return (
    listEmployeeLifecycleOverviewEntries(scope, context).find(
      (entry) => entry.employeeId === employeeId
    ) ?? null
  );
}

export function listEmployeeLifecycleStageSummaries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): readonly EmployeeLifecycleStageSummary[] {
  return projectEmployeeLifecycleStageSummaries(scope, context);
}

export function listEmployeeLifecycleHistoryEntries(
  employeeId?: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): readonly EmployeeLifecycleHistoryEntry[] {
  return projectEmployeeLifecycleHistoryEntries(scope, {
    ...context,
    employeeId,
  });
}

export function listEmployeeLifecycleAuditTrailEntries(
  employeeId?: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): readonly EmployeeLifecycleHistoryEntry[] {
  return projectEmployeeLifecycleAuditTrailEntries(scope, {
    ...context,
    employeeId,
  });
}

export function listEmployeeLifecycleTaskEntries(
  employeeId?: string,
  scope?: EmployeeLifecycleRepositoryScope,
  context?: EmployeeLifecycleManagementPolicyContext
): readonly EmployeeLifecycleTaskEntry[] {
  return projectEmployeeLifecycleTaskEntries(scope, {
    ...context,
    employeeId,
  });
}

export {
  employeeLifecycleHistoryEntrySchema,
  employeeLifecycleOverviewEntrySchema,
  employeeLifecycleOverviewSnapshotSchema,
  employeeLifecycleStageSummarySchema,
  employeeLifecycleTaskEntrySchema,
} from "./projector.ts";
export {
  employeeLifecycleContractReadModelSchema,
  employeeLifecycleExitReadModelSchema,
  employeeLifecycleMovementReadModelSchema,
  employeeLifecycleOnboardingReadModelSchema,
  employeeLifecycleProbationReadModelSchema,
  employeeLifecycleSuspensionReadModelSchema,
} from "./schema.ts";
