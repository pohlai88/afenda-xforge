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
import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { OffboardingCaseRecord } from "./contracts/index.ts";
import type {
  OffboardingRepositoryScope,
  ResolvedOffboardingRepositoryScope,
} from "./policy.ts";
import { resolveOffboardingRepositoryScope } from "./policy.ts";
import { offboardingCaseRecordSchema } from "./schema.ts";

type OffboardingDatabaseModule = typeof import("@repo/database");

export type OffboardingRepositoryState = {
  cases: OffboardingCaseRecord[];
};

const offboardingRepositoryStateSchema = z.object({
  cases: offboardingCaseRecordSchema.array().default([]),
});

const emptyState = (): OffboardingRepositoryState => ({
  cases: [],
});

const defaultRepositoryPath = resolve(
  process.cwd(),
  ".cache",
  "hr-suite",
  "offboarding-exit-management.repository.json"
);

let repositoryFilePath: string =
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_STORE_PATH ??
  defaultRepositoryPath;

let cache: OffboardingRepositoryState | null = null;

const cloneState = (
  state: OffboardingRepositoryState
): OffboardingRepositoryState => structuredClone(state);

const serializeState = (state: OffboardingRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): OffboardingRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  return offboardingRepositoryStateSchema.parse(JSON.parse(content) as unknown);
};

const persistRepositoryState = (state: OffboardingRepositoryState): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const loadDatabaseModule = async (): Promise<OffboardingDatabaseModule> =>
  import("@repo/database");

const shouldUseDatabaseRepository = (
  scope?: OffboardingRepositoryScope
): boolean =>
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL) &&
  resolveOffboardingRepositoryScope(scope) !== null;

const scopeFilter = (
  table: { companyId: unknown; tenantId: unknown },
  scope: ResolvedOffboardingRepositoryScope
): SQL =>
  and(
    eq(table.tenantId as never, scope.tenantId),
    eq(table.companyId as never, scope.companyId)
  ) as SQL;

const mapDatabaseRowToCase = (row: {
  caseNumber: string;
  caseTitle: string;
  companyId: string;
  coordinatorActorId: string | null;
  createdAt: Date;
  effectiveSeparationDate: Date | null;
  employeeId: string;
  exitType: string;
  id: string;
  lastWorkingDate: Date | null;
  lifecycleTriggerSnapshot: Record<string, unknown>;
  noticeEndDate: Date | null;
  noticeStartDate: Date | null;
  reasonSummary: string | null;
  rehireEligibility: string | null;
  requestedByActorId: string | null;
  status: string;
  tenantId: string;
  updatedAt: Date;
}): OffboardingCaseRecord =>
  offboardingCaseRecordSchema.parse({
    id: row.id,
    caseNumber: row.caseNumber,
    caseTitle: row.caseTitle,
    employeeId: row.employeeId,
    tenantId: row.tenantId,
    companyId: row.companyId,
    status: row.status,
    exitType: row.exitType,
    lifecycleTrigger: row.lifecycleTriggerSnapshot,
    effectiveSeparationDate: row.effectiveSeparationDate,
    lastWorkingDate: row.lastWorkingDate,
    noticeStartDate: row.noticeStartDate,
    noticeEndDate: row.noticeEndDate,
    coordinatorActorId: row.coordinatorActorId,
    requestedByActorId: row.requestedByActorId,
    reasonSummary: row.reasonSummary,
    rehireEligibility: row.rehireEligibility ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

const assertScopedCase = (
  record: OffboardingCaseRecord,
  scope: ResolvedOffboardingRepositoryScope
): void => {
  if (
    record.tenantId !== scope.tenantId ||
    record.companyId !== scope.companyId
  ) {
    throw new Error("Offboarding repository scope mismatch.");
  }
};

const mapCaseToDatabaseRow = (
  record: OffboardingCaseRecord,
  scope: ResolvedOffboardingRepositoryScope
): {
  caseNumber: string;
  caseTitle: string;
  companyId: string;
  coordinatorActorId: string | null;
  createdAt: Date;
  effectiveSeparationDate: Date | null;
  employeeId: string;
  exitType: string;
  id: string;
  lastWorkingDate: Date | null;
  lifecycleSourceEventId: string;
  lifecycleSourceFeatureId: string;
  lifecycleTriggerSnapshot: Record<string, unknown>;
  noticeEndDate: Date | null;
  noticeStartDate: Date | null;
  reasonSummary: string | null;
  rehireEligibility: string | null;
  requestedByActorId: string | null;
  status: string;
  tenantId: string;
  updatedAt: Date;
} => {
  assertScopedCase(record, scope);

  return {
    id: record.id,
    tenantId: scope.tenantId,
    companyId: scope.companyId,
    employeeId: record.employeeId,
    caseNumber: record.caseNumber,
    caseTitle: record.caseTitle,
    status: record.status,
    exitType: record.exitType,
    lifecycleSourceFeatureId: record.lifecycleTrigger.sourceFeatureId,
    lifecycleSourceEventId: record.lifecycleTrigger.sourceLifecycleEventId,
    lifecycleTriggerSnapshot: record.lifecycleTrigger,
    effectiveSeparationDate: record.effectiveSeparationDate ?? null,
    lastWorkingDate: record.lastWorkingDate ?? null,
    noticeStartDate: record.noticeStartDate ?? null,
    noticeEndDate: record.noticeEndDate ?? null,
    coordinatorActorId: record.coordinatorActorId ?? null,
    requestedByActorId: record.requestedByActorId ?? null,
    reasonSummary: record.reasonSummary ?? null,
    rehireEligibility: record.rehireEligibility ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const loadDatabaseRepository = async (
  scope: ResolvedOffboardingRepositoryScope
): Promise<OffboardingRepositoryState> => {
  const dbModule = await loadDatabaseModule();
  const rows = await dbModule.timeDatabaseQuery(
    () =>
      dbModule.database
        .select()
        .from(dbModule.hrOffboardingCases)
        .where(scopeFilter(dbModule.hrOffboardingCases, scope)),
    {
      operation: "select",
      resource: "hr_offboarding_cases",
    }
  );

  return {
    cases: rows.map(mapDatabaseRowToCase),
  };
};

const saveDatabaseRepository = async (
  state: OffboardingRepositoryState,
  scope: ResolvedOffboardingRepositoryScope
): Promise<void> => {
  const dbModule = await loadDatabaseModule();

  await dbModule.database.transaction(async () => {
    for (const record of state.cases) {
      const row = mapCaseToDatabaseRow(record, scope);

      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .insert(dbModule.hrOffboardingCases)
            .values(row as never)
            .onConflictDoUpdate({
              target: dbModule.hrOffboardingCases.id,
              set: row as never,
            }),
        {
          operation: "upsert",
          resource: "hr_offboarding_cases",
        }
      );
    }
  });
};

export const getOffboardingRepositoryPath = (): string => repositoryFilePath;

export const setOffboardingRepositoryPathForTesting = (
  nextPath: string
): void => {
  process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const resetOffboardingRepositoryForTesting = async (): Promise<void> => {
  cache = emptyState();
  persistRepositoryState(cache);
  await Promise.resolve();
};

export const createOffboardingCaseRecordId = (): string => randomUUID();

export const loadOffboardingRepository = async (
  scope?: OffboardingRepositoryScope
): Promise<OffboardingRepositoryState> => {
  const resolvedScope = resolveOffboardingRepositoryScope(scope);

  if (shouldUseDatabaseRepository(scope) && resolvedScope) {
    return await loadDatabaseRepository(resolvedScope);
  }

  if (cache === null) {
    cache = readRepositoryStateFromDisk();
  }

  return cloneState(cache);
};

export const saveOffboardingRepository = async (
  nextState: OffboardingRepositoryState,
  scope?: OffboardingRepositoryScope
): Promise<void> => {
  const resolvedScope = resolveOffboardingRepositoryScope(scope);

  if (shouldUseDatabaseRepository(scope) && resolvedScope) {
    await saveDatabaseRepository(nextState, resolvedScope);
    return;
  }

  cache = cloneState(nextState);
  persistRepositoryState(cache);
};

export const mutateOffboardingRepository = async (
  updater: (draft: OffboardingRepositoryState) => void,
  scope?: OffboardingRepositoryScope
): Promise<OffboardingRepositoryState> => {
  const nextState = await loadOffboardingRepository(scope);
  updater(nextState);
  await saveOffboardingRepository(nextState, scope);
  return await loadOffboardingRepository(scope);
};
