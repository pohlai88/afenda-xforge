import type {
  LamEmployeeEntitlementProfile,
  LamEntitlementRuleScope,
  LamLeaveBalance,
  LamLeaveCarryForwardRule,
} from "../schema.ts";
import { lamLeaveBalanceCarryForwardResultSchema } from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";
import {
  isEntitlementRuleEffectiveOn,
  matchesEntitlementRuleScope,
} from "./entitlement.ts";

const countScopeSpecificity = (
  scope?: Partial<LamEntitlementRuleScope>
): number =>
  scope
    ? Object.values(scope).filter(
        (value) => value != null && String(value).trim().length > 0
      ).length
    : 0;

export const selectApplicableCarryForwardRule = (args: {
  asOfDate: Date;
  employee: LamEmployeeEntitlementProfile;
  leaveTypeId: string;
  rules: readonly LamLeaveCarryForwardRule[];
}): LamLeaveCarryForwardRule | null => {
  const candidates = args.rules.filter(
    (rule) =>
      rule.leaveTypeId === args.leaveTypeId &&
      rule.companyId === args.employee.companyId &&
      isEntitlementRuleEffectiveOn(rule, args.asOfDate) &&
      matchesEntitlementRuleScope(args.employee, rule.scope)
  );

  if (candidates.length === 0) {
    return null;
  }

  return (
    [...candidates].sort((left, right) => {
      const specificityDelta =
        countScopeSpecificity(right.scope) - countScopeSpecificity(left.scope);
      if (specificityDelta !== 0) {
        return specificityDelta;
      }

      return right.effectiveFrom.getTime() - left.effectiveFrom.getTime();
    })[0] ?? null
  );
};

export const projectLeaveBalanceCarryForward = (args: {
  asOfDate: Date;
  employee: LamEmployeeEntitlementProfile;
  leaveTypeId: string;
  previousBalance: LamLeaveBalance | null;
  rules: readonly LamLeaveCarryForwardRule[];
  sourcePeriodYear: number;
  targetPeriodYear: number;
}) => {
  const unusedDays = args.previousBalance
    ? Math.max(computeRemainingBalance(args.previousBalance), 0)
    : 0;

  const applicableRule = selectApplicableCarryForwardRule({
    asOfDate: args.asOfDate,
    employee: args.employee,
    leaveTypeId: args.leaveTypeId,
    rules: args.rules,
  });

  if (!applicableRule) {
    return lamLeaveBalanceCarryForwardResultSchema.parse({
      employeeId: args.employee.employeeId,
      companyId: args.employee.companyId,
      leaveTypeId: args.leaveTypeId,
      sourcePeriodYear: args.sourcePeriodYear,
      targetPeriodYear: args.targetPeriodYear,
      matched: false,
      carryForwardRuleId: null,
      carryForwardRuleCode: null,
      unusedDays,
      carryForwardDays: 0,
      forfeitDays: unusedDays,
      processedAt: new Date(),
    });
  }

  const carryForwardDays = Math.min(
    unusedDays,
    applicableRule.maxCarryForwardDays
  );
  const forfeitDays =
    applicableRule.forfeitUnused && unusedDays > carryForwardDays
      ? unusedDays - carryForwardDays
      : 0;

  return lamLeaveBalanceCarryForwardResultSchema.parse({
    employeeId: args.employee.employeeId,
    companyId: args.employee.companyId,
    leaveTypeId: args.leaveTypeId,
    sourcePeriodYear: args.sourcePeriodYear,
    targetPeriodYear: args.targetPeriodYear,
    matched: true,
    carryForwardRuleId: applicableRule.id,
    carryForwardRuleCode: applicableRule.code,
    unusedDays,
    carryForwardDays,
    forfeitDays,
    processedAt: new Date(),
  });
};
