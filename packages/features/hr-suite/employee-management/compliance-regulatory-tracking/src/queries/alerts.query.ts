import "server-only";

import type {
  ComplianceAlert,
  ListComplianceAlertsQuery,
} from "../contracts/index.ts";
import { listComplianceAlertsQuerySchema } from "../contracts/index.ts";
import {
  buildComplianceReadModels,
  projectComplianceAlerts,
} from "../projector.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceAlertsRecords(
  query: ListComplianceAlertsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceAlert[]> {
  const parsed = listComplianceAlertsQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const { alerts } = buildComplianceReadModels({
    obligations: scoped.obligations,
    workerProfiles: scoped.workerProfiles,
    evidence: scoped.evidence,
    exceptions: scoped.exceptions,
    correctiveActions: scoped.correctiveActions,
  });
  const term = normalizeSearchTerm(parsed.search);

  const alertStateById = new Map(
    scoped.alertStates.map((entry) => [entry.alertId, entry.status])
  );

  return paginate(
    projectComplianceAlerts(alerts)
      .map((entry) => ({
        ...entry,
        status: alertStateById.get(entry.id) ?? entry.status,
      }))
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.severity ? entry.severity === parsed.severity : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        matchesSearch([entry.kind, entry.message, entry.obligationId], term)
      ),
    parsed.page,
    parsed.pageSize
  );
}
