import "server-only";

import { database, timeDatabaseQuery } from "@repo/database/db";
import {
  auditEvents,
  hrOrgPositions,
  hrOrgReportingRelationships,
  hrOrgStructureAuditReferences,
  hrOrgUnits,
} from "@repo/database/schema";
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
import type {
  HrOrgRepositoryResolvedScope,
  HrOrgRepositoryState,
} from "./repository.shared.ts";

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
  occurredAt: Date;
  reason: string;
  summary: string;
  targetId: string;
  tenantId: string;
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
) => ({
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
  diff: [] as Record<string, unknown>[],
  metadata: event.metadata,
  occurredAt: event.createdAt,
  createdAt: event.createdAt,
});

export const loadHrOrgDatabaseRepository = async (
  scope: HrOrgRepositoryResolvedScope
): Promise<HrOrgRepositoryState> => {
  const [units, positions, reportingRelationships, scopedAuditEvents] =
    await Promise.all([
      timeDatabaseQuery(
        () => database.select().from(hrOrgUnits).where(scopeFilter(hrOrgUnits, scope)),
        { operation: "select", resource: "hr_org_units" }
      ),
      timeDatabaseQuery(
        () =>
          database.select().from(hrOrgPositions).where(scopeFilter(hrOrgPositions, scope)),
        { operation: "select", resource: "hr_org_positions" }
      ),
      timeDatabaseQuery(
        () =>
          database
            .select()
            .from(hrOrgReportingRelationships)
            .where(scopeFilter(hrOrgReportingRelationships, scope)),
        { operation: "select", resource: "hr_org_reporting_relationships" }
      ),
      timeDatabaseQuery(
        () =>
          database
            .select({
              action: auditEvents.action,
              actorId: auditEvents.actorId,
              companyId: auditEvents.companyId,
              createdAt: auditEvents.createdAt,
              entityType: auditEvents.subjectType,
              id: auditEvents.id,
              metadata: auditEvents.metadata,
              occurredAt: auditEvents.occurredAt,
              reason: auditEvents.reason,
              summary: auditEvents.summary,
              targetId: auditEvents.targetId,
              tenantId: auditEvents.tenantId,
            })
            .from(auditEvents)
            .where(
              and(
                eq(auditEvents.tenantId, scope.tenantId),
                eq(auditEvents.companyId, scope.companyId),
                eq(auditEvents.surface, "organizational-chart-hierarchy")
              )
            ),
        { operation: "select", resource: "audit_events" }
      ),
    ]);

  return {
    auditEvents: scopedAuditEvents.map(mapAuditEventRow),
    positions: positions.map(mapPositionRow),
    reportingRelationships: reportingRelationships.map(
      mapReportingRelationshipRow
    ),
    units: units.map(mapUnitRow),
  };
};

export const saveHrOrgDatabaseRepository = async (
  state: HrOrgRepositoryState,
  scope: HrOrgRepositoryResolvedScope
): Promise<void> => {
  const scopedUnits = state.units.map((row) => attachScope(row, scope));
  const scopedPositions = state.positions.map((row) => attachScope(row, scope));
  const scopedReportingRelationships = state.reportingRelationships.map((row) =>
    attachScope(row, scope)
  );
  const scopedAuditEvents = state.auditEvents.map((row) =>
    mapAuditEventToDatabaseRow(row, scope)
  );

  await database.transaction(async () => {
    await timeDatabaseQuery(
      () =>
        database
          .delete(hrOrgStructureAuditReferences)
          .where(scopeFilter(hrOrgStructureAuditReferences, scope)),
      {
        operation: "delete",
        resource: "hr_org_structure_audit_references",
      }
    );
    await timeDatabaseQuery(
      () =>
        database
          .delete(hrOrgReportingRelationships)
          .where(scopeFilter(hrOrgReportingRelationships, scope)),
      {
        operation: "delete",
        resource: "hr_org_reporting_relationships",
      }
    );
    await timeDatabaseQuery(
      () =>
        database.delete(hrOrgPositions).where(scopeFilter(hrOrgPositions, scope)),
      {
        operation: "delete",
        resource: "hr_org_positions",
      }
    );
    await timeDatabaseQuery(
      () => database.delete(hrOrgUnits).where(scopeFilter(hrOrgUnits, scope)),
      {
        operation: "delete",
        resource: "hr_org_units",
      }
    );
    await timeDatabaseQuery(
      () =>
        database
          .delete(auditEvents)
          .where(
            and(
              eq(auditEvents.tenantId, scope.tenantId),
              eq(auditEvents.companyId, scope.companyId),
              eq(auditEvents.surface, "organizational-chart-hierarchy")
            )
          ),
      {
        operation: "delete",
        resource: "audit_events",
      }
    );

    for (const row of scopedUnits) {
      await timeDatabaseQuery(
        () => database.insert(hrOrgUnits).values(row as never),
        { operation: "insert", resource: "hr_org_units" }
      );
    }

    for (const row of scopedPositions) {
      await timeDatabaseQuery(
        () => database.insert(hrOrgPositions).values(row as never),
        { operation: "insert", resource: "hr_org_positions" }
      );
    }

    for (const row of scopedReportingRelationships) {
      await timeDatabaseQuery(
        () => database.insert(hrOrgReportingRelationships).values(row as never),
        { operation: "insert", resource: "hr_org_reporting_relationships" }
      );
    }

    for (const row of scopedAuditEvents) {
      await timeDatabaseQuery(
        () => database.insert(auditEvents).values(row as never),
        { operation: "insert", resource: "audit_events" }
      );
      await timeDatabaseQuery(
        () =>
          database.insert(hrOrgStructureAuditReferences).values({
            id: crypto.randomUUID(),
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
        { operation: "insert", resource: "hr_org_structure_audit_references" }
      );
    }
  });
};
