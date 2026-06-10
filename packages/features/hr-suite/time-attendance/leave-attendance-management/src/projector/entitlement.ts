import type {
  LamEmployeeEntitlementProfile,
  LamEntitlementRuleScope,
  LamLeaveEntitlementRule,
} from "../schema.ts";
import {
  lamAccrualRuleSchema,
  lamEntitlementCalculationResultSchema,
} from "../schema.ts";

export const computeTenureMonths = (hireDate: Date, asOfDate: Date): number => {
  const years = asOfDate.getFullYear() - hireDate.getFullYear();
  const months = asOfDate.getMonth() - hireDate.getMonth();
  const total = years * 12 + months;

  if (asOfDate.getDate() < hireDate.getDate()) {
    return Math.max(total - 1, 0);
  }

  return Math.max(total, 0);
};

export const isEntitlementRuleEffectiveOn = (
  rule: {
    active: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
  },
  asOfDate: Date
): boolean => {
  if (!rule.active) {
    return false;
  }

  if (rule.effectiveFrom.getTime() > asOfDate.getTime()) {
    return false;
  }

  if (rule.effectiveTo && rule.effectiveTo.getTime() < asOfDate.getTime()) {
    return false;
  }

  return true;
};

const scopeFieldMatches = (
  expected: string | null | undefined,
  actual: string | null | undefined
): boolean => !expected || expected === actual;

export const matchesEntitlementRuleScope = (
  profile: LamEmployeeEntitlementProfile,
  scope?: Partial<LamEntitlementRuleScope>
): boolean => {
  if (!scope) {
    return true;
  }

  return (
    scopeFieldMatches(scope.countryCode, profile.countryCode) &&
    scopeFieldMatches(scope.legalEntityCode, profile.legalEntityCode) &&
    scopeFieldMatches(scope.workLocationCode, profile.workLocationCode) &&
    scopeFieldMatches(scope.employmentType, profile.employmentType) &&
    scopeFieldMatches(scope.grade, profile.grade) &&
    scopeFieldMatches(scope.policyGroupId, profile.policyGroupId) &&
    scopeFieldMatches(scope.departmentId, profile.departmentId)
  );
};

export const matchesEntitlementRuleTenure = (
  profile: LamEmployeeEntitlementProfile,
  rule: LamLeaveEntitlementRule,
  asOfDate: Date
): boolean => {
  const tenureMonths = computeTenureMonths(profile.hireDate, asOfDate);

  if (rule.tenureMonthsMin != null && tenureMonths < rule.tenureMonthsMin) {
    return false;
  }

  if (rule.tenureMonthsMax != null && tenureMonths > rule.tenureMonthsMax) {
    return false;
  }

  return true;
};

const countScopeSpecificity = (
  scope?: Partial<LamEntitlementRuleScope>
): number =>
  scope
    ? Object.values(scope).filter(
        (value) => value != null && String(value).trim().length > 0
      ).length
    : 0;

export const selectApplicableEntitlementRule = (args: {
  asOfDate: Date;
  employee: LamEmployeeEntitlementProfile;
  leaveTypeId: string;
  rules: readonly LamLeaveEntitlementRule[];
}): LamLeaveEntitlementRule | null => {
  const candidates = args.rules.filter(
    (rule) =>
      rule.leaveTypeId === args.leaveTypeId &&
      rule.companyId === args.employee.companyId &&
      isEntitlementRuleEffectiveOn(rule, args.asOfDate) &&
      matchesEntitlementRuleScope(args.employee, rule.scope) &&
      matchesEntitlementRuleTenure(args.employee, rule, args.asOfDate)
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

const daysInMonth = (month: number, year: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

const monthsRemainingInPeriodYear = (
  periodYear: number,
  fromDate: Date
): number => {
  const periodEnd = new Date(Date.UTC(periodYear, 11, 31));
  if (fromDate.getTime() > periodEnd.getTime()) {
    return 0;
  }

  const startMonth =
    fromDate.getFullYear() === periodYear ? fromDate.getMonth() : 0;
  const startDay =
    fromDate.getFullYear() === periodYear ? fromDate.getDate() : 1;
  const monthFraction =
    startDay > 1 ? (startDay - 1) / daysInMonth(startMonth, periodYear) : 0;
  const monthsLeft = 12 - startMonth - monthFraction;

  return Math.max(Math.min(monthsLeft, 12), 0);
};

export const calculateEarnedEntitlementDays = (args: {
  asOfDate: Date;
  employee: LamEmployeeEntitlementProfile;
  periodYear: number;
  rule: LamLeaveEntitlementRule;
}): number => {
  const accrualRule = lamAccrualRuleSchema.parse(
    args.rule.accrualRule ?? "annual_grant"
  );
  const annualEntitlement = args.rule.entitlementDays;

  if (accrualRule === "annual_grant") {
    return annualEntitlement;
  }

  if (accrualRule === "monthly_accrual") {
    let monthIndex = 0;
    if (args.asOfDate.getFullYear() === args.periodYear) {
      monthIndex = args.asOfDate.getMonth() + 1;
    } else if (args.asOfDate.getFullYear() > args.periodYear) {
      monthIndex = 12;
    }
    const earned = (annualEntitlement / 12) * monthIndex;
    return Math.min(Math.round(earned * 100) / 100, annualEntitlement);
  }

  const periodStart = new Date(Date.UTC(args.periodYear, 0, 1));
  const hireInPeriod =
    args.employee.hireDate.getTime() > periodStart.getTime()
      ? args.employee.hireDate
      : periodStart;
  const monthsRemaining = monthsRemainingInPeriodYear(
    args.periodYear,
    hireInPeriod
  );
  const prorated = (annualEntitlement / 12) * monthsRemaining;

  return Math.min(Math.round(prorated * 100) / 100, annualEntitlement);
};

export const projectLeaveEntitlementCalculation = (args: {
  asOfDate: Date;
  employee: LamEmployeeEntitlementProfile;
  leaveTypeId: string;
  periodYear: number;
  rules: readonly LamLeaveEntitlementRule[];
}) => {
  const applicableRule = selectApplicableEntitlementRule({
    asOfDate: args.asOfDate,
    employee: args.employee,
    leaveTypeId: args.leaveTypeId,
    rules: args.rules,
  });

  if (!applicableRule) {
    return lamEntitlementCalculationResultSchema.parse({
      employeeId: args.employee.employeeId,
      companyId: args.employee.companyId,
      leaveTypeId: args.leaveTypeId,
      periodYear: args.periodYear,
      asOfDate: args.asOfDate,
      matched: false,
      entitlementRuleId: null,
      entitlementRuleCode: null,
      entitlementDays: 0,
      earnedDays: 0,
      accrualRule: null,
      tenureMonths: computeTenureMonths(args.employee.hireDate, args.asOfDate),
      calculatedAt: new Date(),
    });
  }

  const earnedDays = calculateEarnedEntitlementDays({
    asOfDate: args.asOfDate,
    employee: args.employee,
    periodYear: args.periodYear,
    rule: applicableRule,
  });

  return lamEntitlementCalculationResultSchema.parse({
    employeeId: args.employee.employeeId,
    companyId: args.employee.companyId,
    leaveTypeId: args.leaveTypeId,
    periodYear: args.periodYear,
    asOfDate: args.asOfDate,
    matched: true,
    entitlementRuleId: applicableRule.id,
    entitlementRuleCode: applicableRule.code,
    entitlementDays: applicableRule.entitlementDays,
    earnedDays,
    accrualRule: lamAccrualRuleSchema.parse(
      applicableRule.accrualRule ?? "annual_grant"
    ),
    tenureMonths: computeTenureMonths(args.employee.hireDate, args.asOfDate),
    calculatedAt: new Date(),
  });
};
