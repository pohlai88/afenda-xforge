import type {
  ComplianceFilingRecord,
  ListComplianceFilingsQuery,
} from "../contracts/index.ts";
import { listComplianceFilingsQuerySchema } from "../contracts/index.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceFilingsRecords(
  query: ListComplianceFilingsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceFilingRecord[]> {
  const parsed = listComplianceFilingsQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const term = normalizeSearchTerm(parsed.search);

  return paginate(
    scoped.filings
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        matchesSearch(
          [
            entry.filingCode,
            entry.title,
            entry.jurisdictionSource,
            entry.confirmationReference,
            entry.notes,
          ],
          term
        )
      ),
    parsed.page,
    parsed.pageSize
  );
}
