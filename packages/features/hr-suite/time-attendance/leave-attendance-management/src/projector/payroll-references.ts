import type { LamRepositoryState } from "../repository.ts";
import type {
  LamPayrollDeductionCategory,
  LamPayrollReference,
} from "../schema.ts";
import { lamPayrollDeductionCategoryValues } from "../schema.ts";
import { listAttendancePayrollReferences } from "./attendance-payroll-references.ts";
import { listLeaveEncashmentPayrollReferences } from "./leave-encashment-payroll-references.ts";
import type { ListPayrollReferenceFilters } from "./unpaid-leave-payroll-references.ts";
import {
  listApprovedLeavePayrollReferences,
  listUnpaidLeavePayrollReferences,
} from "./unpaid-leave-payroll-references.ts";

export type ListLamPayrollReferenceFilters = ListPayrollReferenceFilters & {
  deductionCategory?: LamPayrollDeductionCategory | "all";
};

export const DEFAULT_PAYROLL_EXPORT_CATEGORIES = [
  ...lamPayrollDeductionCategoryValues,
] as const;

const ATTENDANCE_CATEGORIES = new Set<
  Extract<
    LamPayrollDeductionCategory,
    "absence" | "lateness" | "attendance_deduction"
  >
>(["absence", "lateness", "attendance_deduction"]);

const resolveCategories = (
  deductionCategory?: LamPayrollDeductionCategory | "all"
): LamPayrollDeductionCategory[] => {
  if (!deductionCategory || deductionCategory === "all") {
    return [...DEFAULT_PAYROLL_EXPORT_CATEGORIES];
  }

  return [deductionCategory];
};

const resolveReferenceSortDate = (reference: LamPayrollReference): number => {
  if ("attendanceDate" in reference) {
    return reference.attendanceDate.getTime();
  }

  if ("startDate" in reference) {
    return reference.startDate.getTime();
  }

  return reference.payPeriodStart.getTime();
};

const comparePayrollReferences = (
  left: LamPayrollReference,
  right: LamPayrollReference
): number => {
  const leftDate = resolveReferenceSortDate(left);
  const rightDate = resolveReferenceSortDate(right);

  return (
    rightDate - leftDate ||
    left.deductionCategory.localeCompare(right.deductionCategory) ||
    left.id.localeCompare(right.id)
  );
};

export const listPayrollReferences = (
  state: LamRepositoryState,
  filters: ListLamPayrollReferenceFilters = {}
): LamPayrollReference[] => {
  const categories = resolveCategories(filters.deductionCategory);
  const references: LamPayrollReference[] = [];

  for (const category of categories) {
    if (category === "unpaid_leave") {
      references.push(
        ...listUnpaidLeavePayrollReferences(state, {
          companyId: filters.companyId,
          employeeId: filters.employeeId,
          payPeriodStart: filters.payPeriodStart,
          payPeriodEnd: filters.payPeriodEnd,
          exportStatus: filters.exportStatus,
        })
      );
      continue;
    }

    if (category === "approved_leave") {
      references.push(
        ...listApprovedLeavePayrollReferences(state, {
          companyId: filters.companyId,
          employeeId: filters.employeeId,
          payPeriodStart: filters.payPeriodStart,
          payPeriodEnd: filters.payPeriodEnd,
          exportStatus: filters.exportStatus,
        })
      );
      continue;
    }

    if (category === "leave_encashment") {
      references.push(
        ...listLeaveEncashmentPayrollReferences(state, {
          companyId: filters.companyId,
          employeeId: filters.employeeId,
          payPeriodStart: filters.payPeriodStart,
          payPeriodEnd: filters.payPeriodEnd,
          exportStatus: filters.exportStatus,
        })
      );
      continue;
    }

    if (ATTENDANCE_CATEGORIES.has(category)) {
      references.push(
        ...listAttendancePayrollReferences(state, {
          companyId: filters.companyId,
          employeeId: filters.employeeId,
          payPeriodStart: filters.payPeriodStart,
          payPeriodEnd: filters.payPeriodEnd,
          exportStatus: filters.exportStatus,
          deductionCategory: category,
        })
      );
    }
  }

  return references.sort(comparePayrollReferences);
};

export const collectPayrollReferenceExportIds = (
  references: readonly LamPayrollReference[]
): {
  referenceIds: string[];
  leaveApplicationIds: string[];
  attendanceRecordIds: string[];
  encashmentRequestIds: string[];
} => {
  const referenceIds: string[] = [];
  const leaveApplicationIds: string[] = [];
  const attendanceRecordIds: string[] = [];
  const encashmentRequestIds: string[] = [];

  for (const reference of references) {
    referenceIds.push(reference.id);

    if ("leaveApplicationId" in reference) {
      leaveApplicationIds.push(reference.leaveApplicationId);
      continue;
    }

    if ("encashmentRequestId" in reference) {
      encashmentRequestIds.push(reference.encashmentRequestId);
      continue;
    }

    if ("attendanceRecordId" in reference) {
      attendanceRecordIds.push(reference.attendanceRecordId);
    }
  }

  return {
    referenceIds: [...new Set(referenceIds)],
    leaveApplicationIds: [...new Set(leaveApplicationIds)],
    attendanceRecordIds: [...new Set(attendanceRecordIds)],
    encashmentRequestIds: [...new Set(encashmentRequestIds)],
  };
};
