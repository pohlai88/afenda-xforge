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
import type {
  HrOrgAuditEvent,
  HrOrgPositionRecord,
  HrOrgReportingRelationshipRecord,
  HrOrgUnitRecord,
} from "./contracts/domain.contract.ts";
import {
  hrOrgAuditEventSchema,
  hrOrgPositionRecordSchema,
  hrOrgReportingRelationshipRecordSchema,
  hrOrgUnitRecordSchema,
} from "./schema.ts";

export type HrOrgRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

type HrOrgRepositoryResolvedScope = {
  companyId: string;
  tenantId: string;
};

export type HrOrgRepositoryState = {
  auditEvents: HrOrgAuditEvent[];
  positions: HrOrgPositionRecord[];
  reportingRelationships: HrOrgReportingRelationshipRecord[];
  units: HrOrgUnitRecord[];
};

type HrOrgDatabaseModule = typeof import("@repo/database");

const defaultRepositoryPath = resolve(
  process.cwd(),
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

let cache: HrOrgRepositoryState | null = null;

const emptyState = (): HrOrgRepositoryState => ({
  auditEvents: [],
  positions: [],
  reportingRelationships: [],
  units: [],
});

export const emptyHrOrgRepositoryState: () => HrOrgRepositoryState = emptyState;

const cloneState = (state: HrOrgRepositoryState): HrOrgRepositoryState =>
  structuredClone(state);

const normalizeScopeValue = (
  value: string | null | undefined
): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeScope = (
  scope?: HrOrgRepositoryScope
): HrOrgRepositoryScope => ({
  companyId:
    scope?.companyId === undefined
      ? undefined
      : normalizeScopeValue(scope.companyId),
  tenantId:
    scope?.tenantId === undefined
      ? undefined
      : normalizeScopeValue(scope.tenantId),
});

const resolveRepositoryScope = (
  scope?: HrOrgRepositoryScope
): HrOrgRepositoryResolvedScope | null => {
  const tenantId = normalizeScopeValue(scope?.tenantId);
  const companyId = normalizeScopeValue(scope?.companyId);

  if (!(tenantId && companyId)) {
    return null;
  }

  return { companyId, tenantId };
};

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
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeRepositoryState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const loadDatabaseModule = async (): Promise<HrOrgDatabaseModule> =>
  import("@repo/database");

const shouldUseDatabaseRepository = (scope?: HrOrgRepositoryScope): boolean =>
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_REPOSITORY_MODE !==
    "file" &&
  Boolean(process.env.DATABASE_URL) &&
  resolveRepositoryScope(scope) !== null;

const scopeFilter = (
  table: { companyId: unknown; tenantId: unknown },
  scope: HrOrgRepositoryResolvedScope
): SQL =>
  and(
    eq(table.tenantId as never, scope.tenantId),
    eq(table.companyId as never, scope.companyId)
  ) as SQL;

const mapUnitRow = (row: unknown): HrOrgUnitRecord =>
  hrOrgUnitRecordSchema.parse(row);

const mapPositionRow = (row: unknown): HrOrgPositionRecord =>
  hrOrgPositionRecordSchema.parse(row);

const mapReportingRelationshipRow = (
  row: unknown
): HrOrgReportingRelationshipRecord =>
  hrOrgReportingRelationshipRecordSchema.parse(row);

const mapAuditEventRow = (row: {
  action: string;
  actorId: string;
  companyId: string | null;
  createdAt: Date;
  entityType: string | null;
  id: string;
  metadata: Record<string, unknown> | null;
  reason: string;
  summary: string;
  targetId: string;
  tenantId: string;
  occurredAt: Date;
}): HrOrgAuditEvent =>
  hrOrgAuditEventSchema.parse({
    id: row.id,
    tenantId: row.tenantId,
    companyId: row.companyId,
    actorId: row.actorId,
    action: row.action,
    entityType: row.entityType ?? "organization_unit",
    entityId: row.targetId,
    summary: row.summary,
    reason: row.reason || null,
    metadata: row.metadata ?? {},
    createdAt: row.occurredAt ?? row.createdAt,
  });

const validateScope = (
  row: { companyId?: string | null; tenantId?: string | null },
  scope: HrOrgRepositoryResolvedScope
): void => {
  if (
    row.companyId !== undefined &&
    row.companyId !== null &&
    row.companyId !== scope.companyId
  ) {
    throw new Error("Repository company scope mismatch");
  }

  if (
    row.tenantId !== undefined &&
    row.tenantId !== null &&
    row.tenantId !== scope.tenantId
  ) {
    throw new Error("Repository tenant scope mismatch");
  }
};

const attachScope = <
  T extends { companyId?: string | null; tenantId?: string | null },
>(
  row: T,
  scope: HrOrgRepositoryResolvedScope
): T & HrOrgRepositoryResolvedScope => {
  validateScope(row, scope);

  return {
    ...row,
    companyId: scope.companyId,
    tenantId: scope.tenantId,
  };
};

const mapAuditEventToDatabaseRow = (
  event: HrOrgAuditEvent,
  scope: HrOrgRepositoryResolvedScope
): {
  id: string;
  tenantId: string;
  companyId: string;
  grantId: null;
  actorId: string;
  actorType: string;
  actorRole: null;
  module: string;
  surface: string;
  route: null;
  subjectType: string;
  subjectId: string;
  action: string;
  summary: string;
  outcome: string;
  targetType: string;
  targetId: string;
  targetDisplayName: null;
  reason: string;
  policyReference: null;
  approvalId: null;
  channel: null;
  requestId: string;
  operationId: null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  diff: Record<string, unknown>[];
  metadata: Record<string, unknown> | null;
  occurredAt: Date;
  createdAt: Date;
} => ({
  id: event.id,
  tenantId: scope.tenantId,
  companyId: scope.companyId,
  grantId: null,
  actorId: event.actorId ?? "system",
  actorType: "user",
  actorRole: null,
  module: "hr-suite",
  surface: "organizational-chart-hierarchy",
  route: null,
  subjectType: event.entityType,
  subjectId: event.entityId,
  action: event.action,
  summary: event.summary,
  outcome: "success",
  targetType: event.entityType,
  targetId: event.entityId,
  targetDisplayName: null,
  reason: event.reason ?? "",
  policyReference: null,
  approvalId: null,
  channel: null,
  requestId: event.id,
  operationId: null,
  before: {},
  after: event.metadata,
  diff: [],
  metadata: event.metadata,
  occurredAt: event.createdAt,
  createdAt: event.createdAt,
});

const loadDatabaseRepository = async (
  scope: HrOrgRepositoryResolvedScope
): Promise<HrOrgRepositoryState> => {
  const dbModule = await loadDatabaseModule();

  const [units, positions, reportingRelationships, auditEvents] =
    await Promise.all([
      dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .select()
            .from(dbModule.hrOrgUnits)
            .where(scopeFilter(dbModule.hrOrgUnits, scope)),
        {
          operation: "select",
          resource: "hr_org_units",
        }
      ),
      dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .select()
            .from(dbModule.hrOrgPositions)
            .where(scopeFilter(dbModule.hrOrgPositions, scope)),
        {
          operation: "select",
          resource: "hr_org_positions",
        }
      ),
      dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .select()
            .from(dbModule.hrOrgReportingRelationships)
            .where(scopeFilter(dbModule.hrOrgReportingRelationships, scope)),
        {
          operation: "select",
          resource: "hr_org_reporting_relationships",
        }
      ),
      dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .select({
              action: dbModule.auditEvents.action,
              actorId: dbModule.auditEvents.actorId,
              companyId: dbModule.auditEvents.companyId,
              createdAt: dbModule.auditEvents.createdAt,
              entityType: dbModule.auditEvents.subjectType,
              id: dbModule.auditEvents.id,
              metadata: dbModule.auditEvents.metadata,
              reason: dbModule.auditEvents.reason,
              summary: dbModule.auditEvents.summary,
              targetId: dbModule.auditEvents.targetId,
              tenantId: dbModule.auditEvents.tenantId,
              occurredAt: dbModule.auditEvents.occurredAt,
            })
            .from(dbModule.auditEvents)
            .where(
              and(
                eq(dbModule.auditEvents.tenantId, scope.tenantId),
                eq(dbModule.auditEvents.companyId, scope.companyId),
                eq(
                  dbModule.auditEvents.surface,
                  "organizational-chart-hierarchy"
                )
              )
            ),
        {
          operation: "select",
          resource: "audit_events",
        }
      ),
    ]);

  return {
    auditEvents: auditEvents.map(mapAuditEventRow),
    positions: positions.map(mapPositionRow),
    reportingRelationships: reportingRelationships.map(
      mapReportingRelationshipRow
    ),
    units: units.map(mapUnitRow),
  };
};

const saveDatabaseRepository = async (
  state: HrOrgRepositoryState,
  scope: HrOrgRepositoryResolvedScope
): Promise<void> => {
  const dbModule = await loadDatabaseModule();

  const scopedUnits = state.units.map((row) => attachScope(row, scope));
  const scopedPositions = state.positions.map((row) => attachScope(row, scope));
  const scopedReportingRelationships = state.reportingRelationships.map((row) =>
    attachScope(row, scope)
  );
  const scopedAuditEvents = state.auditEvents.map((row) =>
    mapAuditEventToDatabaseRow(row, scope)
  );

  await dbModule.database.transaction(async () => {
    await dbModule.timeDatabaseQuery(
      () =>
        dbModule.database
          .delete(dbModule.hrOrgStructureAuditReferences)
          .where(scopeFilter(dbModule.hrOrgStructureAuditReferences, scope)),
      {
        operation: "delete",
        resource: "hr_org_structure_audit_references",
      }
    );
    await dbModule.timeDatabaseQuery(
      () =>
        dbModule.database
          .delete(dbModule.hrOrgReportingRelationships)
          .where(scopeFilter(dbModule.hrOrgReportingRelationships, scope)),
      {
        operation: "delete",
        resource: "hr_org_reporting_relationships",
      }
    );
    await dbModule.timeDatabaseQuery(
      () =>
        dbModule.database
          .delete(dbModule.hrOrgPositions)
          .where(scopeFilter(dbModule.hrOrgPositions, scope)),
      {
        operation: "delete",
        resource: "hr_org_positions",
      }
    );
    await dbModule.timeDatabaseQuery(
      () =>
        dbModule.database
          .delete(dbModule.hrOrgUnits)
          .where(scopeFilter(dbModule.hrOrgUnits, scope)),
      {
        operation: "delete",
        resource: "hr_org_units",
      }
    );
    await dbModule.timeDatabaseQuery(
      () =>
        dbModule.database
          .delete(dbModule.auditEvents)
          .where(
            and(
              eq(dbModule.auditEvents.tenantId, scope.tenantId),
              eq(dbModule.auditEvents.companyId, scope.companyId),
              eq(dbModule.auditEvents.surface, "organizational-chart-hierarchy")
            )
          ),
      {
        operation: "delete",
        resource: "audit_events",
      }
    );

    for (const row of scopedUnits) {
      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database.insert(dbModule.hrOrgUnits).values(row as never),
        {
          operation: "insert",
          resource: "hr_org_units",
        }
      );
    }

    for (const row of scopedPositions) {
      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .insert(dbModule.hrOrgPositions)
            .values(row as never),
        {
          operation: "insert",
          resource: "hr_org_positions",
        }
      );
    }

    for (const row of scopedReportingRelationships) {
      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .insert(dbModule.hrOrgReportingRelationships)
            .values(row as never),
        {
          operation: "insert",
          resource: "hr_org_reporting_relationships",
        }
      );
    }

    for (const row of scopedAuditEvents) {
      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database.insert(dbModule.auditEvents).values(row as never),
        {
          operation: "insert",
          resource: "audit_events",
        }
      );
      await dbModule.timeDatabaseQuery(
        () =>
          dbModule.database
            .insert(dbModule.hrOrgStructureAuditReferences)
            .values({
              id: randomUUID(),
              tenantId: scope.tenantId,
              companyId: scope.companyId,
              auditEventId: row.id,
              entityType: row.targetType,
              entityId: row.targetId,
              action: row.action,
              summary: row.summary,
              metadata: row.metadata,
              createdAt: row.createdAt,
            } as never),
        {
          operation: "insert",
          resource: "hr_org_structure_audit_references",
        }
      );
    }
  });
};

export const getHrOrgRepositoryPath = (): string => repositoryFilePath;

export const setHrOrgRepositoryPathForTesting = (nextPath: string): void => {
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const resetHrOrgRepositoryForTesting = async (): Promise<void> => {
  cache = emptyState();
  persistRepositoryState(cache);
  await Promise.resolve();
};

export const createHrOrgRecordId = (): string => randomUUID();

export const loadHrOrgRepository = async (
  scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => {
  const normalizedScope = normalizeScope(scope);
  const resolvedScope = resolveRepositoryScope(normalizedScope);

  if (shouldUseDatabaseRepository(normalizedScope) && resolvedScope) {
    return await loadDatabaseRepository(resolvedScope);
  }

  if (cache === null) {
    cache = readRepositoryStateFromDisk();
  }

  return cloneState(cache);
};

export const saveHrOrgRepository = async (
  nextState: HrOrgRepositoryState,
  scope?: HrOrgRepositoryScope
): Promise<void> => {
  const normalizedScope = normalizeScope(scope);
  const resolvedScope = resolveRepositoryScope(normalizedScope);

  if (shouldUseDatabaseRepository(normalizedScope) && resolvedScope) {
    await saveDatabaseRepository(nextState, resolvedScope);
    return;
  }

  cache = cloneState(nextState);
  persistRepositoryState(cache);
};

export const mutateHrOrgRepository = async (
  updater: (draft: HrOrgRepositoryState) => void,
  scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => {
  const nextState = await loadHrOrgRepository(scope);
  updater(nextState);
  await saveHrOrgRepository(nextState, scope);
  return await loadHrOrgRepository(scope);
};
