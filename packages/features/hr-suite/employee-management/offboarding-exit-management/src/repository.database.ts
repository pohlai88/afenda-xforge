import "server-only";

import { database, timeDatabaseQuery } from "@repo/database/db";
import {
  offboardingApprovalSteps,
  offboardingAuditReferences,
  offboardingCases,
} from "@repo/database/schema";
import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import type {
  OffboardingApprovalStepRecord,
  OffboardingAuditEvent,
  OffboardingRepositoryState,
} from "./contracts/index.ts";
import type { OffboardingRepositoryScope } from "./repository.shared.ts";
import { assertNoDuplicateOpenCases } from "./repository.shared.ts";
import {
  offboardingApprovalStepSchema,
  offboardingAuditEventSchema,
  offboardingCaseSchema,
} from "./schema.ts";

const scopeFilters = (
  table: { companyId: unknown; tenantId: unknown },
  scope: OffboardingRepositoryScope
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
  companyId: string | null;
  createdAt: Date;
  entityId: string;
  entityType: string;
  id: string;
  metadata: Record<string, unknown> | null;
  reason: string | null;
  sensitive: boolean;
  summary: string | null;
  tenantId: string;
}): OffboardingAuditEvent =>
  offboardingAuditEventSchema.parse({
    id: row.id,
    tenantId: row.tenantId,
    companyId: row.companyId,
    actorId: row.actorId,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.summary,
    reason: row.reason,
    metadata: row.metadata ?? {},
    sensitive: row.sensitive,
    createdAt: row.createdAt,
  });

export const loadOffboardingDatabaseRepository = async (
  scope: OffboardingRepositoryScope
): Promise<OffboardingRepositoryState> => {
  const [cases, approvals, auditReferences] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(offboardingCases)
          .where(scopeFilters(offboardingCases, scope)),
      { operation: "select", resource: "offboarding_cases" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(offboardingApprovalSteps)
          .where(scopeFilters(offboardingApprovalSteps, scope)),
      { operation: "select", resource: "offboarding_approval_steps" }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(offboardingAuditReferences)
          .where(scopeFilters(offboardingAuditReferences, scope)),
      { operation: "select", resource: "offboarding_audit_references" }
    ),
  ]);

  return {
    cases: offboardingCaseSchema.array().parse(cases),
    approvals: offboardingApprovalStepSchema.array().parse(approvals),
    auditEvents: auditReferences.map(mapAuditReferenceToEvent),
  };
};

const upsertRows = async <T extends { id: string }>(args: {
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
    await database
      .insert(args.table as never)
      .values(row as never)
      .onConflictDoUpdate({
        target: table.id as never,
        set: row as never,
      });
  }
};

export const saveOffboardingDatabaseRepository = async (
  state: OffboardingRepositoryState,
  scope: OffboardingRepositoryScope
): Promise<void> => {
  if (!scope.tenantId) {
    throw new Error(
      "tenantId is required for offboarding database persistence"
    );
  }

  assertNoDuplicateOpenCases(state);

  const tenantId = scope.tenantId;
  const attachScope = <T extends { companyId?: string | null }>(
    row: T
  ): T & { tenantId: string } => ({
    ...row,
    tenantId,
  });

  await database.transaction(async () => {
    await upsertRows({
      rows: state.cases.map(attachScope),
      table: offboardingCases,
    });
    await upsertRows({
      rows: state.approvals.map(
        (
          approval
        ): OffboardingApprovalStepRecord & {
          companyId?: string | null;
          tenantId: string;
        } => attachScope(approval)
      ),
      table: offboardingApprovalSteps,
    });
    await upsertRows({
      rows: state.auditEvents.map((event) =>
        attachScope({
          id: event.id,
          companyId: event.companyId ?? null,
          actorId: event.actorId ?? null,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          summary: event.summary ?? null,
          reason: event.reason ?? null,
          sensitive: event.sensitive,
          metadata: event.metadata,
          createdAt: event.createdAt,
        })
      ),
      table: offboardingAuditReferences,
    });
  });
};
