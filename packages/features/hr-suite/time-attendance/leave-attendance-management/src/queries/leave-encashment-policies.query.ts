import "server-only";

import type {
  LamLeaveEncashmentPolicy,
  ListLamLeaveEncashmentPoliciesQuery,
} from "../contracts/index.ts";
import { listLamLeaveEncashmentPoliciesQuerySchema } from "../contracts/index.ts";
import { isEntitlementRuleEffectiveOn } from "../projector/entitlement.ts";
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
  ruleScope: LamLeaveEncashmentPolicy["scope"],
  field: keyof NonNullable<LamLeaveEncashmentPolicy["scope"]>,
  expected?: string | null
): boolean => {
  if (!expected) {
    return true;
  }

  return ruleScope?.[field] === expected;
};

export async function listLamLeaveEncashmentPoliciesRecords(
  query: ListLamLeaveEncashmentPoliciesQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveEncashmentPolicy[]> {
  const parsed = listLamLeaveEncashmentPoliciesQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);
  const term = normalizeSearchTerm(parsed.search);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByCompany(state.leaveEncashmentPolicies, ctx.companyId)
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
          ? isEntitlementRuleEffectiveOn(entry, parsed.effectiveOn)
          : true
      )
      .filter((entry) =>
        matchesSearch([entry.code, entry.title, entry.leaveTypeId], term)
      )
      .sort((left, right) => left.code.localeCompare(right.code)),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveEncashmentPolicyById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveEncashmentPolicy | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  return (
    filterByCompany(state.leaveEncashmentPolicies, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
