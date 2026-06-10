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
  LamAttendanceCorrection,
  LamAttendanceRecord,
  LamAuditEvent,
  LamLeaveApplication,
  LamLeaveApprovalRoute,
  LamLeaveBalance,
  LamLeaveBlackoutPeriod,
  LamLeaveCarryForwardRule,
  LamLeaveDocument,
  LamLeaveEntitlementRule,
  LamLeaveType,
} from "./contracts/index.ts";
import {
  lamAttendanceCorrectionSchema,
  lamAttendanceRecordSchema,
  lamAuditEventSchema,
  lamCompanyAttendanceSettingsSchema,
  type LamCompanyAttendanceSettings,
  lamLeaveApplicationSchema,
  lamLeaveApprovalRouteSchema,
  lamLeaveBalanceSchema,
  lamLeaveBlackoutPeriodSchema,
  lamLeaveCarryForwardRuleSchema,
  lamLeaveDocumentSchema,
  lamLeaveEntitlementRuleSchema,
  lamLeaveTypeSchema,
} from "./schema.ts";

export type LamRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type LamRepositoryState = {
  attendanceCorrections: LamAttendanceCorrection[];
  attendanceRecords: LamAttendanceRecord[];
  auditEvents: LamAuditEvent[];
  companyAttendanceSettings: LamCompanyAttendanceSettings[];
  leaveApplications: LamLeaveApplication[];
  leaveApprovalRoutes: LamLeaveApprovalRoute[];
  leaveBalances: LamLeaveBalance[];
  leaveBlackoutPeriods: LamLeaveBlackoutPeriod[];
  leaveCarryForwardRules: LamLeaveCarryForwardRule[];
  leaveDocuments: LamLeaveDocument[];
  leaveEntitlementRules: LamLeaveEntitlementRule[];
  leaveTypes: LamLeaveType[];
};

type LamDatabaseModule = typeof import("@repo/database");

const emptyState = (): LamRepositoryState => ({
  attendanceCorrections: [],
  attendanceRecords: [],
  auditEvents: [],
  companyAttendanceSettings: [],
  leaveApplications: [],
  leaveApprovalRoutes: [],
  leaveBalances: [],
  leaveBlackoutPeriods: [],
  leaveCarryForwardRules: [],
  leaveDocuments: [],
  leaveEntitlementRules: [],
  leaveTypes: [],
});

let repositoryFilePath: string =
  process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_STORE_PATH ??
  resolve(
    process.cwd(),
    ".cache",
    "hr-suite",
    "leave-attendance-management.repository.json"
  );

let cache: LamRepositoryState | null = null;

const serializeRepositoryState = (state: LamRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const cloneState = (state: LamRepositoryState): LamRepositoryState =>
  structuredClone(state);

const shouldUseDatabaseRepository = (scope?: LamRepositoryScope): boolean =>
  process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL) &&
  Boolean(scope?.tenantId);

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): LamRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as Partial<
    Record<keyof LamRepositoryState, unknown[]>
  >;

  return {
    attendanceCorrections: lamAttendanceCorrectionSchema
      .array()
      .parse(parsed.attendanceCorrections ?? []),
    attendanceRecords: lamAttendanceRecordSchema
      .array()
      .parse(parsed.attendanceRecords ?? []),
    auditEvents: lamAuditEventSchema.array().parse(parsed.auditEvents ?? []),
    companyAttendanceSettings: lamCompanyAttendanceSettingsSchema
      .array()
      .parse(parsed.companyAttendanceSettings ?? []),
    leaveApplications: lamLeaveApplicationSchema
      .array()
      .parse(parsed.leaveApplications ?? []),
    leaveApprovalRoutes: lamLeaveApprovalRouteSchema
      .array()
      .parse(parsed.leaveApprovalRoutes ?? []),
    leaveBalances: lamLeaveBalanceSchema
      .array()
      .parse(parsed.leaveBalances ?? []),
    leaveBlackoutPeriods: lamLeaveBlackoutPeriodSchema
      .array()
      .parse(parsed.leaveBlackoutPeriods ?? []),
    leaveCarryForwardRules: lamLeaveCarryForwardRuleSchema
      .array()
      .parse(parsed.leaveCarryForwardRules ?? []),
    leaveDocuments: lamLeaveDocumentSchema
      .array()
      .parse(parsed.leaveDocuments ?? []),
    leaveEntitlementRules: lamLeaveEntitlementRuleSchema
      .array()
      .parse(parsed.leaveEntitlementRules ?? []),
    leaveTypes: lamLeaveTypeSchema.array().parse(parsed.leaveTypes ?? []),
  };
};

const persistRepositoryState = (state: LamRepositoryState): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeRepositoryState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const loadDatabaseModule = async (): Promise<LamDatabaseModule> =>
  import("@repo/database");

const scopeFilters = (
  table: { companyId: unknown; tenantId: unknown },
  scope: LamRepositoryScope
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
}): LamAuditEvent =>
  lamAuditEventSchema.parse({
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
  scope: LamRepositoryScope
): Promise<LamRepositoryState> => {
  const dbModule = await loadDatabaseModule();
  const { database, timeDatabaseQuery } = dbModule;

  const [
    attendanceCorrections,
    attendanceRecords,
    companyAttendanceSettings,
    leaveTypes,
    leaveEntitlementRules,
    leaveCarryForwardRules,
    leaveBalances,
    leaveBlackoutPeriods,
    leaveApprovalRoutes,
    leaveApplications,
    leaveDocuments,
    auditReferences,
  ] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamAttendanceCorrections)
          .where(scopeFilters(dbModule.lamAttendanceCorrections, scope)),
      { operation: "select", resource: "lam_attendance_corrections" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamAttendanceRecords)
          .where(scopeFilters(dbModule.lamAttendanceRecords, scope)),
      { operation: "select", resource: "lam_attendance_records" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamCompanyAttendanceSettings)
          .where(scopeFilters(dbModule.lamCompanyAttendanceSettings, scope)),
      { operation: "select", resource: "lam_company_attendance_settings" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveTypes)
          .where(scopeFilters(dbModule.lamLeaveTypes, scope)),
      { operation: "select", resource: "lam_leave_types" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveEntitlementRules)
          .where(scopeFilters(dbModule.lamLeaveEntitlementRules, scope)),
      { operation: "select", resource: "lam_leave_entitlement_rules" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveCarryForwardRules)
          .where(scopeFilters(dbModule.lamLeaveCarryForwardRules, scope)),
      { operation: "select", resource: "lam_leave_carry_forward_rules" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveBalances)
          .where(scopeFilters(dbModule.lamLeaveBalances, scope)),
      { operation: "select", resource: "lam_leave_balances" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveBlackoutPeriods)
          .where(scopeFilters(dbModule.lamLeaveBlackoutPeriods, scope)),
      { operation: "select", resource: "lam_leave_blackout_periods" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveApprovalRoutes)
          .where(scopeFilters(dbModule.lamLeaveApprovalRoutes, scope)),
      { operation: "select", resource: "lam_leave_approval_routes" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveApplications)
          .where(scopeFilters(dbModule.lamLeaveApplications, scope)),
      { operation: "select", resource: "lam_leave_applications" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamLeaveDocuments)
          .where(scopeFilters(dbModule.lamLeaveDocuments, scope)),
      { operation: "select", resource: "lam_leave_documents" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(dbModule.lamAuditReferences)
          .where(scopeFilters(dbModule.lamAuditReferences, scope)),
      { operation: "select", resource: "lam_audit_references" }
    ),
  ]);

  return {
    attendanceCorrections: lamAttendanceCorrectionSchema
      .array()
      .parse(attendanceCorrections),
    attendanceRecords: lamAttendanceRecordSchema
      .array()
      .parse(attendanceRecords),
    companyAttendanceSettings: lamCompanyAttendanceSettingsSchema
      .array()
      .parse(
        companyAttendanceSettings.map((row) => ({
          id: row.id,
          companyId: row.companyId,
          attendanceCorrectionsEnabled: row.attendanceCorrectionsEnabled,
          updatedAt: row.updatedAt,
          updatedBy: row.updatedBy,
        }))
      ),
    auditEvents: auditReferences.map(mapAuditReferenceToEvent),
    leaveApplications: lamLeaveApplicationSchema
      .array()
      .parse(leaveApplications),
    leaveApprovalRoutes: lamLeaveApprovalRouteSchema
      .array()
      .parse(leaveApprovalRoutes),
    leaveDocuments: lamLeaveDocumentSchema.array().parse(leaveDocuments),
    leaveBalances: lamLeaveBalanceSchema.array().parse(leaveBalances),
    leaveBlackoutPeriods: lamLeaveBlackoutPeriodSchema
      .array()
      .parse(leaveBlackoutPeriods),
    leaveCarryForwardRules: lamLeaveCarryForwardRuleSchema
      .array()
      .parse(leaveCarryForwardRules),
    leaveEntitlementRules: lamLeaveEntitlementRuleSchema
      .array()
      .parse(leaveEntitlementRules),
    leaveTypes: lamLeaveTypeSchema.array().parse(leaveTypes),
  };
};

const upsertRows = async <T extends { id: string }>(args: {
  dbModule: LamDatabaseModule;
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
  state: LamRepositoryState,
  scope: LamRepositoryScope
): Promise<void> => {
  if (!scope.tenantId) {
    throw new Error(
      "tenantId is required for leave-attendance database persistence"
    );
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
      rows: state.attendanceCorrections.map(attachScope),
      table: dbModule.lamAttendanceCorrections,
    });
    await upsertRows({
      dbModule,
      rows: state.attendanceRecords.map(attachScope),
      table: dbModule.lamAttendanceRecords,
    });
    await upsertRows({
      dbModule,
      rows: state.companyAttendanceSettings.map((row) =>
        attachScope({
          ...row,
          attendanceCorrectionsEnabled: row.attendanceCorrectionsEnabled,
        })
      ),
      table: dbModule.lamCompanyAttendanceSettings,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveTypes.map(attachScope),
      table: dbModule.lamLeaveTypes,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveEntitlementRules.map(attachScope),
      table: dbModule.lamLeaveEntitlementRules,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveCarryForwardRules.map(attachScope),
      table: dbModule.lamLeaveCarryForwardRules,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveBalances.map(attachScope),
      table: dbModule.lamLeaveBalances,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveBlackoutPeriods.map(attachScope),
      table: dbModule.lamLeaveBlackoutPeriods,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveApprovalRoutes.map(attachScope),
      table: dbModule.lamLeaveApprovalRoutes,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveApplications.map(attachScope),
      table: dbModule.lamLeaveApplications,
    });
    await upsertRows({
      dbModule,
      rows: state.leaveDocuments.map(attachScope),
      table: dbModule.lamLeaveDocuments,
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
      table: dbModule.lamAuditReferences,
    });
  });
};

export const getLamRepositoryPath = (): string => repositoryFilePath;

export const setLamRepositoryPathForTesting = (nextPath: string): void => {
  process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const enableLamDatabaseRepositoryForTesting = (): void => {
  delete process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_REPOSITORY_MODE;
  cache = null;
};

export const resetLamRepositoryCacheForTesting = (): void => {
  cache = null;
};

export const resetLamRepositoryForTesting = async (): Promise<void> => {
  cache = emptyState();
  persistRepositoryState(cache);
  await Promise.resolve();
};

export const loadLamRepository = async (
  scope?: LamRepositoryScope
): Promise<LamRepositoryState> => {
  if (shouldUseDatabaseRepository(scope)) {
    return await loadDatabaseRepository(scope ?? {});
  }

  if (cache === null) {
    cache = readRepositoryStateFromDisk();
  }

  return cloneState(cache);
};

export const saveLamRepository = async (
  nextState: LamRepositoryState,
  scope?: LamRepositoryScope
): Promise<void> => {
  if (shouldUseDatabaseRepository(scope)) {
    await saveDatabaseRepository(nextState, scope ?? {});
    return;
  }

  cache = cloneState(nextState);
  persistRepositoryState(cache);
};

export const mutateLamRepository = async (
  updater: (draft: LamRepositoryState) => void,
  scope?: LamRepositoryScope
): Promise<LamRepositoryState> => {
  const nextState = await loadLamRepository(scope);
  updater(nextState);
  await saveLamRepository(nextState, scope);
  return loadLamRepository(scope);
};

export const createLamRecordId = (): string => randomUUID();

export const upsertLamEntity = <T extends { id: string }>(
  collection: T[],
  entity: T
): T[] => {
  const index = collection.findIndex((item) => item.id === entity.id);
  if (index === -1) {
    return [...collection, entity];
  }

  const nextCollection = [...collection];
  nextCollection[index] = entity;
  return nextCollection;
};
