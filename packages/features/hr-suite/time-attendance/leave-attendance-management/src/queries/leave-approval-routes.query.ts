import "server-only";

import type {
  LamLeaveApprovalRoute,
  ListLamLeaveApprovalRoutesQuery,
} from "../contracts/index.ts";
import { listLamLeaveApprovalRoutesQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  filterByCompany,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
  readContext,
} from "./shared.ts";

const matchesScopeField = (
  routeScope: LamLeaveApprovalRoute["scope"],
  field: keyof NonNullable<LamLeaveApprovalRoute["scope"]>,
  expected?: string | null
): boolean => {
  if (!expected) {
    return true;
  }

  return routeScope?.[field] === expected;
};

export async function listLamLeaveApprovalRoutesRecords(
  query: ListLamLeaveApprovalRoutesQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveApprovalRoute[]> {
  const parsed = listLamLeaveApprovalRoutesQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.leaveApprovalRoutes, ctx.companyId)
      .filter((entry) =>
        parsed.active === undefined ? true : entry.active === parsed.active
      )
      .filter((entry) =>
        parsed.leaveTypeId ? entry.leaveTypeId === parsed.leaveTypeId : true
      )
      .filter((entry) =>
        matchesScopeField(entry.scope, "countryCode", parsed.countryCode)
      )
      .filter((entry) =>
        matchesScopeField(
          entry.scope,
          "legalEntityCode",
          parsed.legalEntityCode
        )
      )
      .filter((entry) =>
        matchesScopeField(
          entry.scope,
          "workLocationCode",
          parsed.workLocationCode
        )
      )
      .filter((entry) =>
        matchesScopeField(entry.scope, "employmentType", parsed.employmentType)
      )
      .filter((entry) => matchesScopeField(entry.scope, "grade", parsed.grade))
      .filter((entry) =>
        matchesScopeField(entry.scope, "policyGroupId", parsed.policyGroupId)
      )
      .filter((entry) =>
        matchesScopeField(entry.scope, "departmentId", parsed.departmentId)
      )
      .filter((entry) => matchesSearch([entry.code, entry.title], term))
      .sort(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveApprovalRouteById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveApprovalRoute | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.leaveApprovalRoutes, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
