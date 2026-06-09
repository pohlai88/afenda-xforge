import "server-only";

import type { EmployeeLifecycleRepositoryScope } from "./repository.ts";
import {
  findEmployeeLifecycleContractRecordByEmployeeId,
  findEmployeeLifecycleMovementRecordByEmployeeId,
  findEmployeeLifecycleOnboardingRecordByEmployeeId,
  findEmployeeLifecycleProbationRecordByEmployeeId,
  findEmployeeLifecycleStateByEmployeeId,
  loadEmployeeLifecycleRepository,
} from "./repository.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleContractReminderEntry,
  EmployeeLifecycleContractReviewEntry,
  EmployeeLifecycleMovementEntry,
  EmployeeLifecycleMovementReadModel,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleOnboardingTask,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleProbationReviewEntry,
} from "./schema.ts";
import {
  buildEmployeeLifecycleContractReadModel,
  buildEmployeeLifecycleMovementReadModel,
  buildEmployeeLifecycleOnboardingReadModel,
  buildEmployeeLifecycleProbationReadModel,
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
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleContractReadModel | null {
  const state = findEmployeeLifecycleStateByEmployeeId(employeeId, scope);
  if (!state) {
    return null;
  }

  return buildEmployeeLifecycleContractReadModel({
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

export {
  employeeLifecycleContractReadModelSchema,
  employeeLifecycleMovementReadModelSchema,
  employeeLifecycleOnboardingReadModelSchema,
  employeeLifecycleProbationReadModelSchema,
} from "./schema.ts";
