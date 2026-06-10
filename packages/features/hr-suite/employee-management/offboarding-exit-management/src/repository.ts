import "server-only";

import { createRequire } from "node:module";
import type { OffboardingRepositoryState } from "./contracts/index.ts";
import {
  createOffboardingRepositoryId,
  shouldUseDatabaseRepository,
  type OffboardingRepositoryScope,
} from "./repository.shared.ts";

export { createOffboardingRepositoryId };
export type { OffboardingRepositoryScope };

type OffboardingFileRepositoryModule = typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadOffboardingFileRepositoryModule =
  (): OffboardingFileRepositoryModule =>
    nodeRequire("./repository.file.ts") as OffboardingFileRepositoryModule;

export const loadOffboardingRepository = async (
  scope?: OffboardingRepositoryScope
): Promise<OffboardingRepositoryState> => {
  if (shouldUseDatabaseRepository(scope)) {
    const { loadOffboardingDatabaseRepository } = await import(
      "./repository.database.ts"
    );
    return loadOffboardingDatabaseRepository(scope ?? {});
  }

  return loadOffboardingFileRepositoryModule().loadOffboardingFileRepository(
    scope
  );
};

export const saveOffboardingRepository = async (
  nextState: OffboardingRepositoryState,
  scope?: OffboardingRepositoryScope
): Promise<void> => {
  if (shouldUseDatabaseRepository(scope)) {
    const { saveOffboardingDatabaseRepository } = await import(
      "./repository.database.ts"
    );
    await saveOffboardingDatabaseRepository(nextState, scope ?? {});
    return;
  }

  await loadOffboardingFileRepositoryModule().saveOffboardingFileRepository(
    nextState,
    scope
  );
};

export const mutateOffboardingRepository = async <
  TResult = OffboardingRepositoryState,
>(
  updater: (draft: OffboardingRepositoryState) => TResult,
  scope?: OffboardingRepositoryScope
): Promise<TResult> => {
  const nextState = await loadOffboardingRepository(scope);
  const result = updater(nextState);
  await saveOffboardingRepository(nextState, scope);
  return result;
};
