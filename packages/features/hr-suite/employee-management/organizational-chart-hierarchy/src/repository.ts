import "server-only";

export type {
  HrOrgRepositoryScope,
  HrOrgRepositoryState,
} from "./repository.shared.ts";
export {
  createHrOrgRecordId,
  emptyHrOrgRepositoryState,
} from "./repository.shared.ts";

import {
  normalizeScope,
  resolveRepositoryScope,
  shouldUseDatabaseRepository,
} from "./repository.shared.ts";

export const loadHrOrgRepository = async (
  scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => {
  const normalizedScope = normalizeScope(scope);
  const resolvedScope = resolveRepositoryScope(normalizedScope);

  if (shouldUseDatabaseRepository(normalizedScope) && resolvedScope) {
    const { loadHrOrgDatabaseRepository } = await import(
      "./repository.database.ts"
    );
    return loadHrOrgDatabaseRepository(resolvedScope);
  }

  const { loadHrOrgFileRepository } = await import("./repository.file.ts");
  return loadHrOrgFileRepository(normalizedScope);
};

export const saveHrOrgRepository = async (
  nextState: HrOrgRepositoryState,
  scope?: HrOrgRepositoryScope
): Promise<void> => {
  const normalizedScope = normalizeScope(scope);
  const resolvedScope = resolveRepositoryScope(normalizedScope);

  if (shouldUseDatabaseRepository(normalizedScope) && resolvedScope) {
    const { saveHrOrgDatabaseRepository } = await import(
      "./repository.database.ts"
    );
    await saveHrOrgDatabaseRepository(nextState, resolvedScope);
    return;
  }

  const { saveHrOrgFileRepository } = await import("./repository.file.ts");
  await saveHrOrgFileRepository(nextState, normalizedScope);
};

export const mutateHrOrgRepository = async (
  updater: (draft: HrOrgRepositoryState) => void,
  scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => {
  const nextState = await loadHrOrgRepository(scope);
  updater(nextState);
  await saveHrOrgRepository(nextState, scope);
  return loadHrOrgRepository(scope);
};
