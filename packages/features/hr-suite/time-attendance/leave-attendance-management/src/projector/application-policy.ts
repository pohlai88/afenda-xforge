import type {
  LamEmployeeEntitlementProfile,
  LamLeaveApplication,
  LamLeaveBlackoutPeriod,
  LamLeaveEntitlementRule,
  LamLeaveType,
} from "../schema.ts";
import {
  computeTenureMonths,
  matchesEntitlementRuleScope,
  selectApplicableEntitlementRule,
} from "./entitlement.ts";

export const OVERLAPPING_LEAVE_APPLICATION_STATUSES = [
  "submitted",
  "pending_approval",
  "approved",
] as const;

export const calendarDaysBetween = (from: Date, to: Date): number => {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUtc - fromUtc) / 86_400_000);
};

export const inclusiveCalendarDays = (startDate: Date, endDate: Date): number =>
  calendarDaysBetween(startDate, endDate) + 1;

export const assertTotalDaysMatchDateRange = (
  startDate: Date,
  endDate: Date,
  totalDays: number
): void => {
  const expected = inclusiveCalendarDays(startDate, endDate);
  if (totalDays !== expected) {
    throw new Error(
      `totalDays must be ${expected} for the selected date range; ${totalDays} provided`
    );
  }
};

export const assertValidLeaveDateRange = (
  startDate: Date,
  endDate: Date
): void => {
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error("endDate must be on or after startDate");
  }
};

const dateRangesOverlap = (
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date
): boolean =>
  leftStart.getTime() <= rightEnd.getTime() &&
  leftEnd.getTime() >= rightStart.getTime();

export const assertMaxConsecutiveDays = (
  totalDays: number,
  maxConsecutiveDays: number | null | undefined
): void => {
  if (maxConsecutiveDays == null) {
    return;
  }

  if (totalDays > maxConsecutiveDays) {
    throw new Error(
      `Maximum consecutive leave is ${maxConsecutiveDays} day(s); ${totalDays} requested`
    );
  }
};

export const assertNoticePeriod = (
  submittedAt: Date,
  startDate: Date,
  minNoticeDays: number | null | undefined
): void => {
  if (minNoticeDays == null) {
    return;
  }

  const noticeDays = calendarDaysBetween(submittedAt, startDate);
  if (noticeDays < minNoticeDays) {
    throw new Error(
      `Minimum notice period is ${minNoticeDays} day(s); ${noticeDays} day(s) given`
    );
  }
};

export const assertLeaveTypeEligibility = (args: {
  leaveType: LamLeaveType;
  hireDate?: Date | null;
  gender?: "male" | "female" | null;
  asOfDate: Date;
}): void => {
  if (
    args.leaveType.eligibilityGender &&
    args.gender !== args.leaveType.eligibilityGender
  ) {
    throw new Error(
      `Leave type "${args.leaveType.code}" requires eligibility gender "${args.leaveType.eligibilityGender}"`
    );
  }

  if (args.leaveType.eligibilityTenureMonthsMin != null) {
    if (!args.hireDate) {
      throw new Error(
        `hireDate is required to validate eligibility for leave type "${args.leaveType.code}"`
      );
    }

    const tenureMonths = computeTenureMonths(args.hireDate, args.asOfDate);
    if (tenureMonths < args.leaveType.eligibilityTenureMonthsMin) {
      throw new Error(
        `Minimum tenure for leave type "${args.leaveType.code}" is ${args.leaveType.eligibilityTenureMonthsMin} month(s); employee has ${tenureMonths}`
      );
    }
  }
};

export const assertEntitlementRuleEligibility = (args: {
  employee: LamEmployeeEntitlementProfile;
  leaveTypeId: string;
  rules: readonly LamLeaveEntitlementRule[];
  asOfDate: Date;
}): void => {
  const matched = selectApplicableEntitlementRule({
    asOfDate: args.asOfDate,
    employee: args.employee,
    leaveTypeId: args.leaveTypeId,
    rules: args.rules,
  });

  if (!matched) {
    throw new Error(
      `No applicable leave entitlement rule matches employee ${args.employee.employeeId} for leave type ${args.leaveTypeId}`
    );
  }
};

export const assertNoLeaveOverlap = (args: {
  applications: readonly LamLeaveApplication[];
  employeeId: string;
  startDate: Date;
  endDate: Date;
  excludeId?: string | null;
}): void => {
  const conflicting = args.applications.find(
    (entry) =>
      entry.employeeId === args.employeeId &&
      entry.id !== args.excludeId &&
      OVERLAPPING_LEAVE_APPLICATION_STATUSES.includes(
        entry.status as (typeof OVERLAPPING_LEAVE_APPLICATION_STATUSES)[number]
      ) &&
      dateRangesOverlap(
        entry.startDate,
        entry.endDate,
        args.startDate,
        args.endDate
      )
  );

  if (conflicting) {
    throw new Error(
      `Leave application overlaps with existing application "${conflicting.id}" (${conflicting.startDate.toISOString()} – ${conflicting.endDate.toISOString()})`
    );
  }
};

export const assertNotInBlackout = (args: {
  blackoutPeriods: readonly LamLeaveBlackoutPeriod[];
  companyId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  employee: LamEmployeeEntitlementProfile;
}): void => {
  const blocked = args.blackoutPeriods.find((period) => {
    if (!period.active || period.companyId !== args.companyId) {
      return false;
    }

    if (period.leaveTypeId && period.leaveTypeId !== args.leaveTypeId) {
      return false;
    }

    if (!matchesEntitlementRuleScope(args.employee, period.scope)) {
      return false;
    }

    return dateRangesOverlap(
      period.startDate,
      period.endDate,
      args.startDate,
      args.endDate
    );
  });

  if (blocked) {
    throw new Error(
      `Leave dates fall within blackout period "${blocked.code}" (${blocked.startDate.toISOString()} – ${blocked.endDate.toISOString()}): ${blocked.reason}`
    );
  }
};

export const sanitizeLeaveDocumentFileName = (fileName: string): string => {
  const normalized = fileName
    .trim()
    .replaceAll("\\", "/")
    .split("/")
    .pop()
    ?.replace(/[^\w.\-()+\s]/g, "_")
    .replace(/\s+/g, "-");

  if (!normalized || normalized === "." || normalized === "..") {
    throw new Error("fileName must contain a valid base file name");
  }

  return normalized;
};
