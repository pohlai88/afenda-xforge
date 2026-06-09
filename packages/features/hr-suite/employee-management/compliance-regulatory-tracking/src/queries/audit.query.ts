import "server-only";

import type {
  ComplianceAuditEvent,
  ListComplianceAuditQuery,
} from "../contracts/index.ts";
import { listComplianceAuditQuerySchema } from "../contracts/index.ts";
import { projectComplianceAuditEvents } from "../projector.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceAuditTrailRecords(
  query: ListComplianceAuditQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceAuditEvent[]> {
  const parsed = listComplianceAuditQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const term = normalizeSearchTerm(parsed.search);
  const auditEvents = scoped.ctx.canViewSensitive
    ? scoped.auditEvents
    : scoped.auditEvents.map((entry) => ({
        ...entry,
        after: undefined,
        before: undefined,
      }));

  return paginate(
    projectComplianceAuditEvents(
      auditEvents
        .filter((entry) =>
          parsed.entityType ? entry.entityType === parsed.entityType : true
        )
        .filter((entry) =>
          parsed.action ? entry.action === parsed.action : true
        )
        .filter((entry) =>
          matchesSearch(
            [entry.action, entry.summary ?? "", entry.reason ?? ""],
            term
          )
        )
    ),
    parsed.page,
    parsed.pageSize
  );
}
