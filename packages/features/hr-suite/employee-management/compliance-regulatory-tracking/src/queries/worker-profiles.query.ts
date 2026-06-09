import "server-only";

import type {
  ComplianceWorkerProfile,
  ListComplianceWorkerProfilesQuery,
} from "../contracts/index.ts";
import { listComplianceWorkerProfilesQuerySchema } from "../contracts/index.ts";
import { loadComplianceRepository } from "../repository.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  filterByCompany,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
  readContext,
} from "./shared.ts";

export async function listComplianceWorkerProfilesRecords(
  query: ListComplianceWorkerProfilesQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceWorkerProfile[]> {
  const parsed = listComplianceWorkerProfilesQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadComplianceRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.workerProfiles, ctx.companyId)
      .filter((entry) =>
        parsed.active === undefined ? true : entry.active === parsed.active
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        parsed.countryCode ? entry.countryCode === parsed.countryCode : true
      )
      .filter((entry) =>
        parsed.legalEntityCode
          ? entry.legalEntityCode === parsed.legalEntityCode
          : true
      )
      .filter((entry) =>
        parsed.workLocationCode
          ? entry.workLocationCode === parsed.workLocationCode
          : true
      )
      .filter((entry) =>
        parsed.departmentId ? entry.departmentId === parsed.departmentId : true
      )
      .filter((entry) =>
        matchesSearch(
          [entry.employeeNumber, entry.employeeId, entry.displayName],
          term
        )
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getComplianceWorkerProfileById(
  id: string,
  context?: ComplianceReadContext
): Promise<ComplianceWorkerProfile | null> {
  const ctx = readContext(context);
  const state = await loadComplianceRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.workerProfiles, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
