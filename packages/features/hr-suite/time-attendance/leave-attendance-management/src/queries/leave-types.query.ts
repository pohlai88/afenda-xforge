import "server-only";

import type {
  LamLeaveType,
  ListLamLeaveTypesQuery,
} from "../contracts/index.ts";
import { listLamLeaveTypesQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { leaveTypeMatchesPolicyGroupFilter } from "../shared/leave-type-policy-group.ts";
import {
  filterByCompany,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
  readContext,
} from "./shared.ts";

export async function listLamLeaveTypesRecords(
  query: ListLamLeaveTypesQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveType[]> {
  const parsed = listLamLeaveTypesQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.leaveTypes, ctx.companyId)
      .filter((entry) =>
        parsed.active === undefined ? true : entry.active === parsed.active
      )
      .filter((entry) => (parsed.kind ? entry.kind === parsed.kind : true))
      .filter((entry) =>
        leaveTypeMatchesPolicyGroupFilter({
          entryPolicyGroupId: entry.policyGroupId,
          filterPolicyGroupId: parsed.policyGroupId,
          unscopedPolicyGroupOnly: parsed.unscopedPolicyGroupOnly,
        })
      )
      .filter((entry) =>
        matchesSearch([entry.code, entry.name, entry.kind], term)
      )
      .sort((left, right) => left.code.localeCompare(right.code)),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveTypeById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveType | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.leaveTypes, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
