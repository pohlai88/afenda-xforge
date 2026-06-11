import "server-only";

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import type { OffboardingRepositoryState } from "./contracts/index.ts";
import type { OffboardingRepositoryScope } from "./repository.shared.ts";
import {
  assertNoDuplicateOpenCases,
  emptyState,
  matchesScope,
} from "./repository.shared.ts";
import { offboardingRepositoryStateSchema } from "./schema.ts";

let repositoryFilePath: string =
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_STORE_PATH ??
  resolve(
    /* turbopackIgnore: true */ tmpdir(),
    "afenda",
    "hr-suite",
    "offboarding-exit-management.repository.json"
  );

const serializeState = (state: OffboardingRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readStateFromDisk = (): OffboardingRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  return offboardingRepositoryStateSchema.parse(
    JSON.parse(readFileSync(repositoryFilePath, "utf8")) as unknown
  );
};

const persistState = (state: OffboardingRepositoryState): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

export const getOffboardingRepositoryPath = (): string => repositoryFilePath;

export const setOffboardingRepositoryPathForTesting = (
  nextPath: string
): void => {
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(/* turbopackIgnore: true */ nextPath);
};

export const resetOffboardingFileRepositoryForTesting =
  async (): Promise<void> => {
    persistState(emptyState());
    await Promise.resolve();
  };

export const loadOffboardingFileRepository = (
  scope?: OffboardingRepositoryScope
): OffboardingRepositoryState => {
  const state = readStateFromDisk();
  if (!scope) {
    return state;
  }

  return {
    cases: state.cases.filter((record) => matchesScope(record, scope)),
    approvals: state.approvals.filter((record) => matchesScope(record, scope)),
    auditEvents: state.auditEvents.filter((event) =>
      matchesScope(event, scope)
    ),
  };
};

export const saveOffboardingFileRepository = (
  nextState: OffboardingRepositoryState,
  scope?: OffboardingRepositoryScope
): void => {
  assertNoDuplicateOpenCases(nextState);

  if (!scope) {
    persistState(nextState);
    return;
  }

  const current = readStateFromDisk();
  persistState({
    cases: [
      ...current.cases.filter((record) => !matchesScope(record, scope)),
      ...nextState.cases,
    ],
    approvals: [
      ...current.approvals.filter((record) => !matchesScope(record, scope)),
      ...nextState.approvals,
    ],
    auditEvents: [
      ...current.auditEvents.filter((event) => !matchesScope(event, scope)),
      ...nextState.auditEvents,
    ],
  });
};
