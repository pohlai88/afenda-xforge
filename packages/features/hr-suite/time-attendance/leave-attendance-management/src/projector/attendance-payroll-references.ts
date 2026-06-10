import type { LamRepositoryState } from "../repository.ts";
import type {
  LamAttendancePayrollReference,
  LamAttendanceRecord,
  LamAttendanceStatus,
  LamPayrollDeductionCategory,
  LamPayrollReferenceExportBatch,
} from "../schema.ts";
import { lamAttendancePayrollReferenceSchema } from "../schema.ts";
import type { ListPayrollReferenceFilters } from "./unpaid-leave-payroll-references.ts";
import { resolveExportedPayrollReferenceAttendanceRecordIds } from "./unpaid-leave-payroll-references.ts";

const startOfUtcDay = (value: Date): number =>
  Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());

const isDateWithinPayPeriod = (
  value: Date,
  payPeriodStart?: Date,
  payPeriodEnd?: Date
): boolean => {
  if (!(payPeriodStart || payPeriodEnd)) {
    return true;
  }

  const day = startOfUtcDay(value);
  if (payPeriodStart && day < startOfUtcDay(payPeriodStart)) {
    return false;
  }

  if (payPeriodEnd && day > startOfUtcDay(payPeriodEnd)) {
    return false;
  }

  return true;
};

export const mapAttendanceStatusToDeductionCategory = (
  status: LamAttendanceStatus
): Extract<
  LamPayrollDeductionCategory,
  "absence" | "lateness" | "attendance_deduction"
> | null => {
  switch (status) {
    case "absent":
      return "absence";
    case "late":
      return "lateness";
    case "early_out":
    case "half_day":
    case "missing_punch":
      return "attendance_deduction";
    default:
      return null;
  }
};

export const buildAttendancePayrollSourceReference = (
  record: LamAttendanceRecord,
  deductionCategory: LamPayrollDeductionCategory
): string =>
  `lam:${deductionCategory}:${record.companyId ?? "global"}:${record.id}:${record.attendanceDate.toISOString()}`;

export const projectAttendancePayrollReference = (args: {
  record: LamAttendanceRecord;
  exportedRecordIds: ReadonlySet<string>;
  exportBatch?: LamPayrollReferenceExportBatch | null;
}): LamAttendancePayrollReference | null => {
  const deductionCategory = mapAttendanceStatusToDeductionCategory(
    args.record.status
  );
  if (!deductionCategory) {
    return null;
  }

  const exportedAt =
    args.exportBatch?.exportedAt ??
    (args.exportedRecordIds.has(args.record.id) ? args.record.updatedAt : null);

  return lamAttendancePayrollReferenceSchema.parse({
    id: args.record.id,
    companyId: args.record.companyId,
    employeeId: args.record.employeeId,
    attendanceRecordId: args.record.id,
    attendanceDate: args.record.attendanceDate,
    attendanceStatus: args.record.status,
    deductionCategory,
    sourceReference: buildAttendancePayrollSourceReference(
      args.record,
      deductionCategory
    ),
    exportBatchId: args.exportBatch?.id,
    exportedAt: exportedAt ?? undefined,
  });
};

export type ListAttendancePayrollReferenceFilters =
  ListPayrollReferenceFilters & {
    deductionCategory?: Extract<
      LamPayrollDeductionCategory,
      "absence" | "lateness" | "attendance_deduction"
    >;
  };

export const listAttendancePayrollReferences = (
  state: LamRepositoryState,
  filters: ListAttendancePayrollReferenceFilters = {}
): LamAttendancePayrollReference[] => {
  const exportedRecordIds = resolveExportedPayrollReferenceAttendanceRecordIds(
    state.auditEvents
  );
  const exportStatus = filters.exportStatus ?? "all";

  return state.attendanceRecords
    .filter((record) =>
      filters.companyId ? record.companyId === filters.companyId : true
    )
    .filter((record) =>
      filters.employeeId ? record.employeeId === filters.employeeId : true
    )
    .filter((record) =>
      isDateWithinPayPeriod(
        record.attendanceDate,
        filters.payPeriodStart,
        filters.payPeriodEnd
      )
    )
    .map((record) =>
      projectAttendancePayrollReference({
        record,
        exportedRecordIds,
      })
    )
    .filter((reference): reference is LamAttendancePayrollReference => {
      if (!reference) {
        return false;
      }

      if (
        filters.deductionCategory &&
        reference.deductionCategory !== filters.deductionCategory
      ) {
        return false;
      }

      const isExported = exportedRecordIds.has(reference.attendanceRecordId);
      if (exportStatus === "pending") {
        return !isExported;
      }

      if (exportStatus === "exported") {
        return isExported;
      }

      return true;
    })
    .sort(
      (left, right) =>
        right.attendanceDate.getTime() - left.attendanceDate.getTime() ||
        right.attendanceRecordId.localeCompare(left.attendanceRecordId)
    );
};
