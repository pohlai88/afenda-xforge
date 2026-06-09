import "server-only";

import type {
  ComplianceCalendarItem,
  ListComplianceCalendarQuery,
} from "../contracts/index.ts";
import { listComplianceCalendarQuerySchema } from "../contracts/index.ts";
import {
  buildComplianceReadModels,
  projectComplianceCalendarItems,
} from "../projector.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceCalendarItemsRecords(
  query: ListComplianceCalendarQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceCalendarItem[]> {
  const parsed = listComplianceCalendarQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const { calendarItems } = buildComplianceReadModels({
    obligations: scoped.obligations,
    workerProfiles: scoped.workerProfiles,
    evidence: scoped.evidence,
    exceptions: scoped.exceptions,
    correctiveActions: scoped.correctiveActions,
  });
  const term = normalizeSearchTerm(parsed.search);

  const filingCalendarItems: ComplianceCalendarItem[] = scoped.filings.map(
    (filing) => ({
      id: `${filing.id}:calendar:filing`,
      companyId: filing.companyId,
      employeeId: "filing",
      obligationId: filing.obligationId,
      requirementId: filing.id,
      kind: "filing",
      status:
        filing.status === "submitted" || filing.status === "accepted"
          ? "done"
          : "open",
      severity: "high",
      title: filing.title,
      dueAt: filing.dueAt,
    })
  );

  return paginate(
    projectComplianceCalendarItems([...calendarItems, ...filingCalendarItems])
      .filter((entry) => (parsed.kind ? entry.kind === parsed.kind : true))
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        matchesSearch(
          [entry.title, entry.obligationId, entry.requirementId],
          term
        )
      ),
    parsed.page,
    parsed.pageSize
  );
}
