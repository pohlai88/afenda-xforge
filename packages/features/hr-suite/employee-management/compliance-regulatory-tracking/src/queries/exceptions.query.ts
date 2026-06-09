import "server-only";

import type {
  ComplianceException,
  ListComplianceExceptionsQuery,
} from "../contracts/index.ts";
import { listComplianceExceptionsQuerySchema } from "../contracts/index.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceExceptionsRecords(
  query: ListComplianceExceptionsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceException[]> {
  const parsed = listComplianceExceptionsQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const term = normalizeSearchTerm(parsed.search);

  return paginate(
    scoped.exceptions
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        matchesSearch([entry.reason, entry.resolutionNotes ?? ""], term)
      ),
    parsed.page,
    parsed.pageSize
  );
}
