import "server-only";

import type {
  ComplianceCorrectiveAction,
  ListComplianceCorrectiveActionsQuery,
} from "../contracts/index.ts";
import { listComplianceCorrectiveActionsQuerySchema } from "../contracts/index.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceCorrectiveActionsRecords(
  query: ListComplianceCorrectiveActionsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceCorrectiveAction[]> {
  const parsed = listComplianceCorrectiveActionsQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const term = normalizeSearchTerm(parsed.search);

  return paginate(
    scoped.correctiveActions
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        matchesSearch([entry.title, entry.description ?? ""], term)
      ),
    parsed.page,
    parsed.pageSize
  );
}
