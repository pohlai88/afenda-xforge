import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import {
  hrOrgAuditEventSchema,
  hrOrgPositionRecordSchema,
  hrOrgReportingRelationshipRecordSchema,
  hrOrgUnitRecordSchema,
} from "./schema.ts";
import {
  emptyState,
  type HrOrgRepositoryScope,
  type HrOrgRepositoryState,
} from "./repository.shared.ts";

const defaultRepositoryPath = resolve(
  /* turbopackIgnore: true */ process.cwd(),
  ".cache",
  "hr-suite",
  "organizational-chart-hierarchy.repository.json"
);

const repositoryStateSchema = z.object({
  auditEvents: hrOrgAuditEventSchema.array().default([]),
  positions: hrOrgPositionRecordSchema.array().default([]),
  reportingRelationships: hrOrgReportingRelationshipRecordSchema
    .array()
    .default([]),
  units: hrOrgUnitRecordSchema.array().default([]),
});

let repositoryFilePath: string =
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_REPOSITORY_PATH ??
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_STORE_PATH ??
  defaultRepositoryPath;

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): HrOrgRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  return repositoryStateSchema.parse(JSON.parse(content) as unknown);
};

const serializeRepositoryState = (state: HrOrgRepositoryState): string =>
  JSON.stringify(state);

const persistRepositoryState = (state: HrOrgRepositoryState): void => {
  ensureRepositoryDirectory();
  writeFileSync(repositoryFilePath, serializeRepositoryState(state), "utf8");
};

export const getHrOrgRepositoryPath = (): string => repositoryFilePath;

export const setHrOrgRepositoryPathForTesting = (nextPath: string): void => {
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(/* turbopackIgnore: true */ nextPath);
};

export const resetHrOrgFileRepositoryForTesting = async (): Promise<void> => {
  persistRepositoryState(emptyState());
  await Promise.resolve();
};

export const loadHrOrgFileRepository = async (
  _scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => readRepositoryStateFromDisk();

export const saveHrOrgFileRepository = async (
  nextState: HrOrgRepositoryState,
  _scope?: HrOrgRepositoryScope
): Promise<void> => {
  persistRepositoryState(nextState);
};
