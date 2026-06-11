import "server-only";

import { createRequire } from "node:module";

export type {
  EmployeeLifecycleRepositoryAuditEvent,
  EmployeeLifecycleRepositoryMutationResult,
  EmployeeLifecycleRepositoryScope,
  EmployeeLifecycleRepositoryState,
} from "./repository.file.ts";

type EmployeeLifecycleRepositoryModule = typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadRepositoryModule = (): EmployeeLifecycleRepositoryModule =>
  nodeRequire("./repository.file.ts") as EmployeeLifecycleRepositoryModule;

export const createEmployeeLifecycleRepositoryId: EmployeeLifecycleRepositoryModule["createEmployeeLifecycleRepositoryId"] =
  (...args) =>
    loadRepositoryModule().createEmployeeLifecycleRepositoryId(...args);
export const employeeLifecycleRepositoryAuditEventSchema: EmployeeLifecycleRepositoryModule["employeeLifecycleRepositoryAuditEventSchema"] =
  loadRepositoryModule().employeeLifecycleRepositoryAuditEventSchema;
export const findEmployeeLifecycleContractRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleContractRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleContractRecordByEmployeeId(
      ...args
    );
export const findEmployeeLifecycleExitRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleExitRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleExitRecordByEmployeeId(...args);
export const findEmployeeLifecycleMovementRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleMovementRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleMovementRecordByEmployeeId(
      ...args
    );
export const findEmployeeLifecycleNotificationIntentByDedupeKey: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleNotificationIntentByDedupeKey"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleNotificationIntentByDedupeKey(
      ...args
    );
export const findEmployeeLifecycleOffboardingHandoffByDedupeKey: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleOffboardingHandoffByDedupeKey"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleOffboardingHandoffByDedupeKey(
      ...args
    );
export const findEmployeeLifecycleOnboardingRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleOnboardingRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleOnboardingRecordByEmployeeId(
      ...args
    );
export const findEmployeeLifecycleProbationRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleProbationRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleProbationRecordByEmployeeId(
      ...args
    );
export const findEmployeeLifecycleStateByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleStateByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleStateByEmployeeId(...args);
export const findEmployeeLifecycleSuspensionRecordByEmployeeId: EmployeeLifecycleRepositoryModule["findEmployeeLifecycleSuspensionRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().findEmployeeLifecycleSuspensionRecordByEmployeeId(
      ...args
    );
export const getEmployeeLifecycleRepositoryPath: EmployeeLifecycleRepositoryModule["getEmployeeLifecycleRepositoryPath"] =
  (...args) =>
    loadRepositoryModule().getEmployeeLifecycleRepositoryPath(...args);
export const listEmployeeLifecycleNotificationIntents: EmployeeLifecycleRepositoryModule["listEmployeeLifecycleNotificationIntents"] =
  (...args) =>
    loadRepositoryModule().listEmployeeLifecycleNotificationIntents(...args);
export const listEmployeeLifecycleOffboardingHandoffs: EmployeeLifecycleRepositoryModule["listEmployeeLifecycleOffboardingHandoffs"] =
  (...args) =>
    loadRepositoryModule().listEmployeeLifecycleOffboardingHandoffs(...args);
export const loadEmployeeLifecycleRepository: EmployeeLifecycleRepositoryModule["loadEmployeeLifecycleRepository"] =
  (...args) => loadRepositoryModule().loadEmployeeLifecycleRepository(...args);
export const mutateEmployeeLifecycleRepository: EmployeeLifecycleRepositoryModule["mutateEmployeeLifecycleRepository"] =
  (...args) =>
    loadRepositoryModule().mutateEmployeeLifecycleRepository(...args);
export const removeEmployeeLifecycleContractRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleContractRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleContractRecord(...args);
export const removeEmployeeLifecycleExitRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleExitRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleExitRecord(...args);
export const removeEmployeeLifecycleMovementRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleMovementRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleMovementRecord(...args);
export const removeEmployeeLifecycleOnboardingRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleOnboardingRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleOnboardingRecord(...args);
export const removeEmployeeLifecycleProbationRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleProbationRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleProbationRecord(...args);
export const removeEmployeeLifecycleState: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleState"] =
  (...args) => loadRepositoryModule().removeEmployeeLifecycleState(...args);
export const removeEmployeeLifecycleSuspensionRecord: EmployeeLifecycleRepositoryModule["removeEmployeeLifecycleSuspensionRecord"] =
  (...args) =>
    loadRepositoryModule().removeEmployeeLifecycleSuspensionRecord(...args);
export const saveEmployeeLifecycleRepository: EmployeeLifecycleRepositoryModule["saveEmployeeLifecycleRepository"] =
  (...args) => loadRepositoryModule().saveEmployeeLifecycleRepository(...args);
export const upsertEmployeeLifecycleContractRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleContractRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleContractRecord(...args);
export const upsertEmployeeLifecycleExitRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleExitRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleExitRecord(...args);
export const upsertEmployeeLifecycleMovementRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleMovementRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleMovementRecord(...args);
export const upsertEmployeeLifecycleNotificationIntent: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleNotificationIntent"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleNotificationIntent(...args);
export const upsertEmployeeLifecycleOffboardingHandoff: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleOffboardingHandoff"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleOffboardingHandoff(...args);
export const upsertEmployeeLifecycleOnboardingRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleOnboardingRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleOnboardingRecord(...args);
export const upsertEmployeeLifecycleProbationRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleProbationRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleProbationRecord(...args);
export const upsertEmployeeLifecycleState: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleState"] =
  (...args) => loadRepositoryModule().upsertEmployeeLifecycleState(...args);
export const upsertEmployeeLifecycleSuspensionRecord: EmployeeLifecycleRepositoryModule["upsertEmployeeLifecycleSuspensionRecord"] =
  (...args) =>
    loadRepositoryModule().upsertEmployeeLifecycleSuspensionRecord(...args);
export {
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
} from "./repository.testing.ts";
