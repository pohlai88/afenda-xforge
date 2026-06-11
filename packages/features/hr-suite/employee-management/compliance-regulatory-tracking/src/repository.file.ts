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
import type {
  ComplianceAlertState,
  ComplianceAuditEvent,
  ComplianceCorrectiveAction,
  ComplianceEvidenceArtifact,
  ComplianceException,
  ComplianceFilingRecord,
  ComplianceObligation,
  ComplianceWorkerProfile,
} from "./contracts/index.ts";
import {
  complianceAlertStateSchema,
  complianceAuditEventSchema,
  complianceCorrectiveActionSchema,
  complianceEvidenceArtifactSchema,
  complianceExceptionSchema,
  complianceFilingRecordSchema,
  complianceObligationSchema,
  complianceWorkerProfileSchema,
} from "./schema.ts";

export type ComplianceRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type ComplianceRepositoryState = {
  alertStates: ComplianceAlertState[];
  auditEvents: ComplianceAuditEvent[];
  correctiveActions: ComplianceCorrectiveAction[];
  evidence: ComplianceEvidenceArtifact[];
  exceptions: ComplianceException[];
  filings: ComplianceFilingRecord[];
  obligations: ComplianceObligation[];
  workerProfiles: ComplianceWorkerProfile[];
};

type ComplianceDatabaseModule = typeof import("@repo/database");

const emptyState = (): ComplianceRepositoryState => ({
  alertStates: [],
  auditEvents: [],
  correctiveActions: [],
  evidence: [],
  exceptions: [],
  filings: [],
  obligations: [],
  workerProfiles: [],
});

const repositoryFilePath: string =
  process.env.AFENDA_COMPLIANCE_REGULATORY_TRACKING_REPOSITORY_PATH ??
  process.env.AFENDA_COMPLIANCE_REGULATORY_TRACKING_STORE_PATH ??
  resolve(
    /* turbopackIgnore: true */ process.cwd(),
    ".cache",
    "hr-suite",
    "compliance-regulatory-tracking.repository.json"
  );

type ComplianceRepositoryRuntimeState = {
  cache: ComplianceRepositoryState | null;
  repositoryFilePath: string;
};

const complianceRepositoryStateKey = Symbol.for(
  "afenda.compliance-regulatory-tracking.repository-state"
);

const globalComplianceRepositoryState = globalThis as typeof globalThis & {
  [complianceRepositoryStateKey]?: ComplianceRepositoryRuntimeState;
};

globalComplianceRepositoryState[complianceRepositoryStateKey] ??= {
  cache: null,
  repositoryFilePath,
};
const runtimeState =
  globalComplianceRepositoryState[complianceRepositoryStateKey];

const serializeRepositoryState = (state: ComplianceRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const cloneState = (
  state: ComplianceRepositoryState
): ComplianceRepositoryState => structuredClone(state);

const shouldUseDatabaseRepository = (
  scope?: ComplianceRepositoryScope
): boolean =>
  process.env.AFENDA_COMPLIANCE_REGULATORY_TRACKING_REPOSITORY_MODE !==
    "file" &&
  Boolean(process.env.DATABASE_URL) &&
  Boolean(scope?.tenantId);

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(runtimeState.repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): ComplianceRepositoryState => {
  if (!existsSync(runtimeState.repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(runtimeState.repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as Partial<
    Record<keyof ComplianceRepositoryState, unknown[]>
  >;

  return {
    alertStates: complianceAlertStateSchema
      .array()
      .parse(parsed.alertStates ?? []),
    auditEvents: complianceAuditEventSchema
      .array()
      .parse(parsed.auditEvents ?? []),
    correctiveActions: complianceCorrectiveActionSchema
      .array()
      .parse(parsed.correctiveActions ?? []),
    evidence: complianceEvidenceArtifactSchema
      .array()
      .parse(parsed.evidence ?? []),
    exceptions: complianceExceptionSchema
      .array()
      .parse(parsed.exceptions ?? []),
    filings: complianceFilingRecordSchema.array().parse(parsed.filings ?? []),
    obligations: complianceObligationSchema
      .array()
      .parse(parsed.obligations ?? []),
    workerProfiles: complianceWorkerProfileSchema
      .array()
      .parse(parsed.workerProfiles ?? []),
  };
};

const persistRepositoryState = (state: ComplianceRepositoryState): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${runtimeState.repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeRepositoryState(state), "utf8");
  renameSync(temporaryPath, runtimeState.repositoryFilePath);
};

const loadDatabaseModule = async (): Promise<ComplianceDatabaseModule> =>
  import("@repo/database");

const scopeFilters = (
  table: { companyId: unknown; tenantId: unknown },
  scope: ComplianceRepositoryScope
): SQL | undefined => {
  const filters = [eq(table.tenantId as never, scope.tenantId as never)];

  if (scope.companyId) {
    filters.push(eq(table.companyId as never, scope.companyId as never));
  }

  return and(...filters);
};

const mapAuditReferenceToEvent = (row: {
  action: string;
  companyId: string | null;
  createdAt: Date;
  entityId: string;
  entityType: string;
  id: string;
  metadata: Record<string, unknown> | null;
}): ComplianceAuditEvent =>
  complianceAuditEventSchema.parse({
    id: row.id,
    companyId: row.companyId,
    actorId: null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.action,
    reason: null,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt,
  });

const loadDatabaseRepository = async (
  scope: ComplianceRepositoryScope
): Promise<ComplianceRepositoryState> => {
  const dbModule = await loadDatabaseModule();
  const { database, timeDatabaseQuery } = dbModule;

  const [
    obligations,
    workerProfiles,
    evidence,
    exceptions,
    correctiveActions,
    filings,
    alertStates,
    auditReferences,
  ] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceObligations)
          .where(scopeFilters(dbModule.complianceObligations, scope)),
      { operation: "select", resource: "compliance_obligations" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceWorkerProfiles)
          .where(scopeFilters(dbModule.complianceWorkerProfiles, scope)),
      { operation: "select", resource: "compliance_worker_profiles" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceEvidenceArtifacts)
          .where(scopeFilters(dbModule.complianceEvidenceArtifacts, scope)),
      { operation: "select", resource: "compliance_evidence_artifacts" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceExceptions)
          .where(scopeFilters(dbModule.complianceExceptions, scope)),
      { operation: "select", resource: "compliance_exceptions" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceCorrectiveActions)
          .where(scopeFilters(dbModule.complianceCorrectiveActions, scope)),
      { operation: "select", resource: "compliance_corrective_actions" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceFilings)
          .where(scopeFilters(dbModule.complianceFilings, scope)),
      { operation: "select", resource: "compliance_filings" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceAlertStates)
          .where(scopeFilters(dbModule.complianceAlertStates, scope)),
      { operation: "select", resource: "compliance_alert_states" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.complianceAuditReferences)
          .where(scopeFilters(dbModule.complianceAuditReferences, scope)),
      { operation: "select", resource: "compliance_audit_references" }
    ),
  ]);

  return {
    alertStates: complianceAlertStateSchema.array().parse(alertStates),
    auditEvents: auditReferences.map(mapAuditReferenceToEvent),
    correctiveActions: complianceCorrectiveActionSchema
      .array()
      .parse(correctiveActions),
    evidence: complianceEvidenceArtifactSchema.array().parse(evidence),
    exceptions: complianceExceptionSchema.array().parse(exceptions),
    filings: complianceFilingRecordSchema.array().parse(filings),
    obligations: complianceObligationSchema.array().parse(obligations),
    workerProfiles: complianceWorkerProfileSchema.array().parse(workerProfiles),
  };
};

const upsertRows = async <T extends { id: string }>(args: {
  dbModule: ComplianceDatabaseModule;
  rows: readonly T[];
  table: unknown;
}): Promise<void> => {
  if (args.rows.length === 0) {
    return;
  }

  const table = args.table as {
    id: unknown;
  };

  for (const row of args.rows) {
    await args.dbModule.database
      .insert(args.table as never)
      .values(row as never)
      .onConflictDoUpdate({
        target: table.id as never,
        set: row as never,
      });
  }
};

const saveDatabaseRepository = async (
  state: ComplianceRepositoryState,
  scope: ComplianceRepositoryScope
): Promise<void> => {
  if (!scope.tenantId) {
    throw new Error("tenantId is required for compliance database persistence");
  }

  const dbModule = await loadDatabaseModule();
  const tenantId = scope.tenantId;
  const attachScope = <T extends { companyId?: string | null }>(
    row: T
  ): T & { tenantId: string } => ({
    ...row,
    tenantId,
  });

  await dbModule.database.transaction(async () => {
    await upsertRows({
      dbModule,
      rows: state.obligations.map(attachScope),
      table: dbModule.complianceObligations,
    });
    await upsertRows({
      dbModule,
      rows: state.workerProfiles.map(attachScope),
      table: dbModule.complianceWorkerProfiles,
    });
    await upsertRows({
      dbModule,
      rows: state.evidence.map(attachScope),
      table: dbModule.complianceEvidenceArtifacts,
    });
    await upsertRows({
      dbModule,
      rows: state.exceptions.map(attachScope),
      table: dbModule.complianceExceptions,
    });
    await upsertRows({
      dbModule,
      rows: state.correctiveActions.map(attachScope),
      table: dbModule.complianceCorrectiveActions,
    });
    await upsertRows({
      dbModule,
      rows: state.filings.map(attachScope),
      table: dbModule.complianceFilings,
    });
    await upsertRows({
      dbModule,
      rows: state.alertStates.map(attachScope),
      table: dbModule.complianceAlertStates,
    });
    await upsertRows({
      dbModule,
      rows: state.auditEvents.map((event) =>
        attachScope({
          id: event.id,
          auditEventId: null,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          companyId: event.companyId ?? null,
          metadata: event.metadata,
          createdAt: event.createdAt,
        })
      ),
      table: dbModule.complianceAuditReferences,
    });
  });
};

export const getComplianceRepositoryPath = (): string =>
  runtimeState.repositoryFilePath;

export const setComplianceRepositoryPathForTesting = (
  nextPath: string
): void => {
  process.env.AFENDA_COMPLIANCE_REGULATORY_TRACKING_REPOSITORY_MODE = "file";
  runtimeState.repositoryFilePath = resolve(
    /* turbopackIgnore: true */ nextPath
  );
  runtimeState.cache = null;
};

export const resetComplianceRepositoryForTesting = async (): Promise<void> => {
  runtimeState.cache = emptyState();
  persistRepositoryState(runtimeState.cache);
  await Promise.resolve();
};

export const loadComplianceRepository = async (
  scope?: ComplianceRepositoryScope
): Promise<ComplianceRepositoryState> => {
  if (shouldUseDatabaseRepository(scope)) {
    return await loadDatabaseRepository(scope ?? {});
  }

  if (runtimeState.cache === null) {
    runtimeState.cache = readRepositoryStateFromDisk();
  }

  return cloneState(runtimeState.cache);
};

export const saveComplianceRepository = async (
  nextState: ComplianceRepositoryState,
  scope?: ComplianceRepositoryScope
): Promise<void> => {
  if (shouldUseDatabaseRepository(scope)) {
    await saveDatabaseRepository(nextState, scope ?? {});
    return;
  }

  runtimeState.cache = cloneState(nextState);
  persistRepositoryState(runtimeState.cache);
};

export const mutateComplianceRepository = async (
  updater: (draft: ComplianceRepositoryState) => void,
  scope?: ComplianceRepositoryScope
): Promise<ComplianceRepositoryState> => {
  const nextState = await loadComplianceRepository(scope);
  updater(nextState);
  await saveComplianceRepository(nextState, scope);
  return loadComplianceRepository(scope);
};

export const createComplianceRecordId = (): string => randomUUID();
