import "server-only";

import type {
  ComplianceObligation,
  ListComplianceObligationsQuery,
} from "../contracts/index.ts";
import { listComplianceObligationsQuerySchema } from "../contracts/index.ts";
import { loadComplianceRepository } from "../repository.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  filterByCompany,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
  readContext,
} from "./shared.ts";

export async function listComplianceObligationsRecords(
  query: ListComplianceObligationsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceObligation[]> {
  const parsed = listComplianceObligationsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadComplianceRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.obligations, ctx.companyId)
      .filter((entry) =>
        parsed.active === undefined ? true : entry.active === parsed.active
      )
      .filter((entry) =>
        parsed.requirementKind
          ? entry.requirementKind === parsed.requirementKind
          : true
      )
      .filter((entry) =>
        parsed.severity ? entry.severity === parsed.severity : true
      )
      .filter((entry) =>
        parsed.countryCode
          ? entry.scope.countryCode === parsed.countryCode
          : true
      )
      .filter((entry) =>
        parsed.legalEntityCode
          ? entry.scope.legalEntityCode === parsed.legalEntityCode
          : true
      )
      .filter((entry) =>
        parsed.workLocationCode
          ? entry.scope.workLocationCode === parsed.workLocationCode
          : true
      )
      .filter((entry) =>
        parsed.departmentId
          ? entry.scope.departmentId === parsed.departmentId
          : true
      )
      .filter((entry) =>
        matchesSearch(
          [
            entry.code,
            entry.title,
            entry.description ?? "",
            entry.jurisdictionSource,
          ],
          term
        )
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getComplianceObligationById(
  id: string,
  context?: ComplianceReadContext
): Promise<ComplianceObligation | null> {
  const ctx = readContext(context);
  const state = await loadComplianceRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.obligations, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
