import "server-only";

import type {
  CalculateLamLeaveEntitlementInput,
  LamEntitlementCalculationResult,
} from "../contracts/index.ts";
import { calculateLamLeaveEntitlementInputSchema } from "../contracts/index.ts";
import { projectLeaveEntitlementCalculation } from "../projector/entitlement.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { lamEmployeeEntitlementProfileSchema } from "../schema.ts";
import { filterByCompany, readContext } from "./shared.ts";

const resolveLeaveTypeIds = (args: {
  companyId: string;
  leaveTypeId?: string | null;
  rules: readonly { leaveTypeId: string; companyId?: string | null }[];
}): string[] => {
  if (args.leaveTypeId) {
    return [args.leaveTypeId];
  }

  return [
    ...new Set(
      args.rules
        .filter((entry) => entry.companyId === args.companyId)
        .map((entry) => entry.leaveTypeId)
    ),
  ];
};

export async function calculateLamLeaveEntitlement(
  input: CalculateLamLeaveEntitlementInput,
  context?: LamReadContext
): Promise<readonly LamEntitlementCalculationResult[]> {
  const parsed = calculateLamLeaveEntitlementInputSchema.parse(input);
  const ctx = readContext(context);

  if (!ctx.canRead) {
    return [];
  }

  const state = await loadLamRepository(ctx);
  const companyId = ctx.companyId ?? parsed.companyId;
  if (!companyId) {
    return [];
  }

  const asOfDate = parsed.asOfDate ?? new Date();
  const periodYear = parsed.periodYear ?? asOfDate.getFullYear();
  const employee = lamEmployeeEntitlementProfileSchema.parse({
    companyId,
    employeeId: parsed.employeeId,
    hireDate: parsed.hireDate,
    countryCode: parsed.countryCode,
    legalEntityCode: parsed.legalEntityCode,
    workLocationCode: parsed.workLocationCode,
    employmentType: parsed.employmentType,
    grade: parsed.grade,
    policyGroupId: parsed.policyGroupId,
    departmentId: parsed.departmentId,
  });

  const leaveTypeIds = resolveLeaveTypeIds({
    companyId,
    leaveTypeId: parsed.leaveTypeId,
    rules: filterByCompany(state.leaveEntitlementRules, companyId),
  });

  return leaveTypeIds.map((leaveTypeId) =>
    projectLeaveEntitlementCalculation({
      asOfDate,
      employee,
      leaveTypeId,
      periodYear,
      rules: filterByCompany(state.leaveEntitlementRules, companyId),
    })
  );
}
