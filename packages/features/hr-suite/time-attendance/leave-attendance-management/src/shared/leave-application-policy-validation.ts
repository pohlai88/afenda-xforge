import {
  assertEntitlementRuleEligibility,
  assertLeaveTypeEligibility,
  assertMaxConsecutiveDays,
  assertNoLeaveOverlap,
  assertNotInBlackout,
  assertNoticePeriod,
  assertTotalDaysMatchDateRange,
  assertValidLeaveDateRange,
} from "../projector/application-policy.ts";
import type {
  LamLeaveApplication,
  LamLeaveBlackoutPeriod,
  LamLeaveEntitlementRule,
  LamLeaveType,
} from "../schema.ts";
import { lamEmployeeEntitlementProfileSchema } from "../schema.ts";
import { assertLeaveTypeAccessibleToPolicyGroup } from "./leave-type-policy-group.ts";

export const lamLeaveBlackoutPeriodFieldLabels = {
  code: "Code",
  reason: "Reason",
  startDate: "Start Date",
  endDate: "End Date",
  leaveTypeId: "Leave Type",
  scope: "Scope",
  active: "Active",
} as const;

export type LeaveApplicationPolicyValidationInput = {
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  hireDate?: Date | null;
  gender?: "male" | "female" | null;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  policyGroupId?: string | null;
  departmentId?: string | null;
  excludeApplicationId?: string | null;
  evaluatedAt: Date;
};

type LeaveApplicationPolicyDraft = {
  leaveTypes: readonly LamLeaveType[];
  leaveEntitlementRules: readonly LamLeaveEntitlementRule[];
  leaveBlackoutPeriods: readonly LamLeaveBlackoutPeriod[];
  leaveApplications: readonly LamLeaveApplication[];
};

export const requiresLeaveApplicationEmployeeProfile = (args: {
  leaveType: LamLeaveType;
  entitlementRules: readonly LamLeaveEntitlementRule[];
}): boolean =>
  args.entitlementRules.length > 0 ||
  args.leaveType.eligibilityTenureMonthsMin != null ||
  Boolean(args.leaveType.eligibilityGender);

export const buildLeaveApplicationScopeProfile = (args: {
  companyId: string;
  employeeId: string;
  hireDate: Date;
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  policyGroupId?: string | null;
  departmentId?: string | null;
}) =>
  lamEmployeeEntitlementProfileSchema.parse({
    companyId: args.companyId,
    employeeId: args.employeeId,
    hireDate: args.hireDate,
    countryCode: args.countryCode,
    legalEntityCode: args.legalEntityCode,
    workLocationCode: args.workLocationCode,
    employmentType: args.employmentType,
    grade: args.grade,
    policyGroupId: args.policyGroupId,
    departmentId: args.departmentId,
  });

export const assertLeaveApplicationPolicyGates = (
  draft: LeaveApplicationPolicyDraft,
  input: LeaveApplicationPolicyValidationInput
): LamLeaveType => {
  assertValidLeaveDateRange(input.startDate, input.endDate);

  const leaveType = draft.leaveTypes.find(
    (entry) =>
      entry.id === input.leaveTypeId &&
      entry.companyId === input.companyId &&
      entry.active
  );
  if (!leaveType) {
    throw new Error(
      `Active leave type "${input.leaveTypeId}" was not found for this company`
    );
  }

  assertLeaveTypeAccessibleToPolicyGroup({
    leaveType,
    employeePolicyGroupId: input.policyGroupId,
  });

  const entitlementRulesForType = draft.leaveEntitlementRules.filter(
    (entry) =>
      entry.companyId === input.companyId &&
      entry.leaveTypeId === input.leaveTypeId &&
      entry.active
  );

  if (
    requiresLeaveApplicationEmployeeProfile({
      leaveType,
      entitlementRules: entitlementRulesForType,
    }) &&
    !input.hireDate
  ) {
    throw new Error(
      "Employee hireDate is required for leave application policy validation"
    );
  }

  assertTotalDaysMatchDateRange(
    input.startDate,
    input.endDate,
    input.totalDays
  );
  assertMaxConsecutiveDays(input.totalDays, leaveType.maxConsecutiveDays);
  assertNoticePeriod(
    input.evaluatedAt,
    input.startDate,
    leaveType.minNoticeDays
  );

  if (input.hireDate) {
    assertLeaveTypeEligibility({
      leaveType,
      hireDate: input.hireDate,
      gender: input.gender ?? null,
      asOfDate: input.startDate,
    });

    if (entitlementRulesForType.length > 0) {
      assertEntitlementRuleEligibility({
        employee: buildLeaveApplicationScopeProfile({
          companyId: input.companyId,
          employeeId: input.employeeId,
          hireDate: input.hireDate,
          countryCode: input.countryCode,
          legalEntityCode: input.legalEntityCode,
          workLocationCode: input.workLocationCode,
          employmentType: input.employmentType,
          grade: input.grade,
          policyGroupId: input.policyGroupId,
          departmentId: input.departmentId,
        }),
        leaveTypeId: input.leaveTypeId,
        rules: draft.leaveEntitlementRules,
        asOfDate: input.startDate,
      });
    }
  }

  const scopeProfile = buildLeaveApplicationScopeProfile({
    companyId: input.companyId,
    employeeId: input.employeeId,
    hireDate: input.hireDate ?? input.startDate,
    countryCode: input.countryCode,
    legalEntityCode: input.legalEntityCode,
    workLocationCode: input.workLocationCode,
    employmentType: input.employmentType,
    grade: input.grade,
    policyGroupId: input.policyGroupId,
    departmentId: input.departmentId,
  });

  assertNotInBlackout({
    blackoutPeriods: draft.leaveBlackoutPeriods,
    companyId: input.companyId,
    leaveTypeId: input.leaveTypeId,
    startDate: input.startDate,
    endDate: input.endDate,
    employee: scopeProfile,
  });

  assertNoLeaveOverlap({
    applications: draft.leaveApplications,
    employeeId: input.employeeId,
    startDate: input.startDate,
    endDate: input.endDate,
    excludeId: input.excludeApplicationId,
  });

  return leaveType;
};
