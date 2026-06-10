import "server-only";

import type {
  LamLeaveBlackoutPeriod,
  ListLamLeaveBlackoutPeriodsQuery,
} from "../contracts/index.ts";
import { listLamLeaveBlackoutPeriodsQuerySchema } from "../contracts/index.ts";
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
  periodScope: LamLeaveBlackoutPeriod["scope"],
  field: keyof NonNullable<LamLeaveBlackoutPeriod["scope"]>,
  expected?: string | null
): boolean => {
  if (!expected) {
    return true;
  }

  return periodScope?.[field] === expected;
};

const isBlackoutEffectiveOn = (
  period: LamLeaveBlackoutPeriod,
  effectiveOn: Date
): boolean =>
  period.startDate.getTime() <= effectiveOn.getTime() &&
  period.endDate.getTime() >= effectiveOn.getTime();

export async function listLamLeaveBlackoutPeriodsRecords(
  query: ListLamLeaveBlackoutPeriodsQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveBlackoutPeriod[]> {
  const parsed = listLamLeaveBlackoutPeriodsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.leaveBlackoutPeriods, ctx.companyId)
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
      .filter((entry) =>
        parsed.effectiveOn
          ? isBlackoutEffectiveOn(entry, parsed.effectiveOn)
          : true
      )
      .filter((entry) =>
        matchesSearch([entry.code, entry.title, entry.reason], term)
      )
      .sort(
        (left, right) => left.startDate.getTime() - right.startDate.getTime()
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveBlackoutPeriodById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveBlackoutPeriod | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.leaveBlackoutPeriods, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
