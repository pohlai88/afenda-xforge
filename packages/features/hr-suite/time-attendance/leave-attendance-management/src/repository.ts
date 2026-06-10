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
import { writeAuditEventInTransaction } from "@repo/audit";
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
import { mapLamAuditEventToCanonicalInput } from "./lam-canonical-audit.ts";
import type {
  LamAttendancePolicy,
  LamCompanyAttendanceSettings,
  LamHolidayCalendar,
  LamLeaveEncashmentPolicy,
  LamLeaveEncashmentRequest,
  LamWorkCalendar,
} from "./schema.ts";
import {
  lamAttendanceCorrectionSchema,
  lamAttendancePolicySchema,
  lamAttendanceRecordSchema,
  lamAuditEventSchema,
  lamCompanyAttendanceSettingsSchema,
  lamHolidayCalendarSchema,
  lamLeaveApplicationSchema,
  lamLeaveApprovalRouteSchema,
  lamLeaveBalanceSchema,
  lamLeaveBlackoutPeriodSchema,
  lamLeaveCarryForwardRuleSchema,
  lamLeaveDocumentSchema,
  lamLeaveEncashmentPolicySchema,
  lamLeaveEncashmentRequestSchema,
  lamLeaveEntitlementRuleSchema,
  lamLeaveTypeSchema,
  lamWorkCalendarSchema,
} from "./schema.ts";

export type LamRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type LamRepositoryState = {
  attendanceCorrections: LamAttendanceCorrection[];
  attendancePolicies: LamAttendancePolicy[];
  attendanceRecords: LamAttendanceRecord[];
  auditEvents: LamAuditEvent[];
  companyAttendanceSettings: LamCompanyAttendanceSettings[];
  holidayCalendars: LamHolidayCalendar[];
  leaveApplications: LamLeaveApplication[];
  leaveApprovalRoutes: LamLeaveApprovalRoute[];
  leaveBalances: LamLeaveBalance[];
  leaveBlackoutPeriods: LamLeaveBlackoutPeriod[];
  leaveCarryForwardRules: LamLeaveCarryForwardRule[];
  leaveDocuments: LamLeaveDocument[];
  leaveEncashmentPolicies: LamLeaveEncashmentPolicy[];
  leaveEncashmentRequests: LamLeaveEncashmentRequest[];
  leaveEntitlementRules: LamLeaveEntitlementRule[];
  leaveTypes: LamLeaveType[];
  workCalendars: LamWorkCalendar[];
};

type LamDatabaseModule = typeof import("@repo/database");

const emptyState = (): LamRepositoryState => ({
  attendanceCorrections: [],
  attendancePolicies: [],
  attendanceRecords: [],
  auditEvents: [],
  companyAttendanceSettings: [],
  holidayCalendars: [],
  leaveApplications: [],
  leaveApprovalRoutes: [],
  leaveBalances: [],
  leaveBlackoutPeriods: [],
  leaveCarryForwardRules: [],
  leaveDocuments: [],
  leaveEncashmentPolicies: [],
  leaveEncashmentRequests: [],
  leaveEntitlementRules: [],
  leaveTypes: [],
  workCalendars: [],
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

const isDatabaseRepositoryModeConfigured = (): boolean =>
  process.env.AFENDA_LEAVE_ATTENDANCE_MANAGEMENT_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL);

const shouldUseDatabaseRepository = (scope?: LamRepositoryScope): boolean =>
  isDatabaseRepositoryModeConfigured() && Boolean(scope?.tenantId);

const LAM_AUDIT_PAYLOAD_METADATA_KEY = "__lamAuditPayload";

type LamAuditDatabasePayload = {
  actorId?: string | null;
  summary?: string | null;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
};

const assertDatabaseRepositoryScope = (scope?: LamRepositoryScope): void => {
  if (isDatabaseRepositoryModeConfigured() && !scope?.tenantId) {
    throw new Error(
      "tenantId is required when leave-attendance-management database repository mode is active"
    );
  }
};

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
    attendancePolicies: lamAttendancePolicySchema
      .array()
      .parse(parsed.attendancePolicies ?? []),
    attendanceRecords: lamAttendanceRecordSchema
      .array()
      .parse(parsed.attendanceRecords ?? []),
    auditEvents: lamAuditEventSchema.array().parse(parsed.auditEvents ?? []),
    companyAttendanceSettings: lamCompanyAttendanceSettingsSchema
      .array()
      .parse(parsed.companyAttendanceSettings ?? []),
    holidayCalendars: lamHolidayCalendarSchema
      .array()
      .parse(parsed.holidayCalendars ?? []),
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
    leaveEncashmentPolicies: lamLeaveEncashmentPolicySchema
      .array()
      .parse(parsed.leaveEncashmentPolicies ?? []),
    leaveEncashmentRequests: lamLeaveEncashmentRequestSchema
      .array()
      .parse(parsed.leaveEncashmentRequests ?? []),
    leaveEntitlementRules: lamLeaveEntitlementRuleSchema
      .array()
      .parse(parsed.leaveEntitlementRules ?? []),
    leaveTypes: lamLeaveTypeSchema.array().parse(parsed.leaveTypes ?? []),
    workCalendars: lamWorkCalendarSchema
      .array()
      .parse(parsed.workCalendars ?? []),
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
  actorId: string | null;
  after: Record<string, unknown> | null;
  before: Record<string, unknown> | null;
  companyId: string | null;
  createdAt: Date;
  entityId: string;
  entityType: string;
  id: string;
  metadata: Record<string, unknown> | null;
  reason: string | null;
  summary: string | null;
}): LamAuditEvent => {
  const metadata = row.metadata ?? {};
  const payload = metadata[LAM_AUDIT_PAYLOAD_METADATA_KEY] as
    | LamAuditDatabasePayload
    | undefined;
  const publicMetadata = { ...metadata };
  delete publicMetadata[LAM_AUDIT_PAYLOAD_METADATA_KEY];

  return lamAuditEventSchema.parse({
    id: row.id,
    companyId: row.companyId,
    actorId: row.actorId ?? payload?.actorId ?? null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.summary ?? payload?.summary ?? row.action,
    reason: row.reason ?? payload?.reason ?? null,
    metadata: publicMetadata,
    before: row.before ?? payload?.before,
    after: row.after ?? payload?.after,
    createdAt: row.createdAt,
  });
};

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
    attendancePolicies: [],
    attendanceRecords: lamAttendanceRecordSchema
      .array()
      .parse(attendanceRecords),
    companyAttendanceSettings: lamCompanyAttendanceSettingsSchema.array().parse(
      companyAttendanceSettings.map((row) => ({
        id: row.id,
        companyId: row.companyId,
        attendanceCorrectionsEnabled: row.attendanceCorrectionsEnabled,
        updatedAt: row.updatedAt,
        updatedBy: row.updatedBy,
      }))
    ),
    auditEvents: auditReferences.map(mapAuditReferenceToEvent),
    holidayCalendars: [],
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
    leaveEncashmentPolicies: [],
    leaveEncashmentRequests: [],
    leaveEntitlementRules: lamLeaveEntitlementRuleSchema
      .array()
      .parse(leaveEntitlementRules),
    leaveTypes: lamLeaveTypeSchema.array().parse(leaveTypes),
    workCalendars: [],
  };
};

type LamDatabaseClient = Pick<
  LamDatabaseModule["database"],
  "insert" | "select"
>;

const upsertRows = async <T extends { id: string }>(args: {
  db: LamDatabaseClient;
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
    await args.db
      .insert(args.table as never)
      .values(row as never)
      .onConflictDoUpdate({
        target: table.id as never,
        set: row as never,
      });
  }
};

const toPersistedAuditRecord = (
  event: LamAuditEvent,
  auditEventId: string
): {
  id: string;
  auditEventId: string;
  action: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  companyId: string | null;
  summary: string | null;
  reason: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
} => ({
  id: event.id,
  auditEventId,
  action: event.action,
  actorId: event.actorId ?? null,
  entityType: event.entityType,
  entityId: event.entityId,
  companyId: event.companyId ?? null,
  summary: event.summary ?? null,
  reason: event.reason ?? null,
  before:
    event.before === undefined
      ? null
      : (event.before as Record<string, unknown>),
  after:
    event.after === undefined ? null : (event.after as Record<string, unknown>),
  metadata: event.metadata,
  createdAt: event.createdAt,
});

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

  await dbModule.database.transaction(async (tx) => {
    const existingAuditReferences = await tx
      .select({
        auditEventId: dbModule.lamAuditReferences.auditEventId,
        id: dbModule.lamAuditReferences.id,
      })
      .from(dbModule.lamAuditReferences)
      .where(eq(dbModule.lamAuditReferences.tenantId, tenantId));
    const canonicalAuditEventIds = new Map(
      existingAuditReferences.map((row) => [row.id, row.auditEventId])
    );

    await upsertRows({
      db: tx,
      rows: state.attendanceCorrections.map(attachScope),
      table: dbModule.lamAttendanceCorrections,
    });
    await upsertRows({
      db: tx,
      rows: state.attendanceRecords.map(attachScope),
      table: dbModule.lamAttendanceRecords,
    });
    await upsertRows({
      db: tx,
      rows: state.companyAttendanceSettings.map((row) =>
        attachScope({
          ...row,
          attendanceCorrectionsEnabled: row.attendanceCorrectionsEnabled,
        })
      ),
      table: dbModule.lamCompanyAttendanceSettings,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveTypes.map(attachScope),
      table: dbModule.lamLeaveTypes,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveEntitlementRules.map(attachScope),
      table: dbModule.lamLeaveEntitlementRules,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveCarryForwardRules.map(attachScope),
      table: dbModule.lamLeaveCarryForwardRules,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveBalances.map(attachScope),
      table: dbModule.lamLeaveBalances,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveBlackoutPeriods.map(attachScope),
      table: dbModule.lamLeaveBlackoutPeriods,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveApprovalRoutes.map(attachScope),
      table: dbModule.lamLeaveApprovalRoutes,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveApplications.map(attachScope),
      table: dbModule.lamLeaveApplications,
    });
    await upsertRows({
      db: tx,
      rows: state.leaveDocuments.map(attachScope),
      table: dbModule.lamLeaveDocuments,
    });

    for (const event of state.auditEvents) {
      let canonicalAuditEventId = canonicalAuditEventIds.get(event.id) ?? null;

      if (!canonicalAuditEventId) {
        const canonicalEvent = await writeAuditEventInTransaction(
          tx,
          mapLamAuditEventToCanonicalInput(event, scope)
        );
        canonicalAuditEventId = canonicalEvent.id;
      }

      await upsertRows({
        db: tx,
        rows: [
          attachScope(toPersistedAuditRecord(event, canonicalAuditEventId)),
        ],
        table: dbModule.lamAuditReferences,
      });
    }
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
  assertDatabaseRepositoryScope(scope);

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
  assertDatabaseRepositoryScope(scope);

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
