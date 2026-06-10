import { leaveAttendanceManagementAuditEvents } from "../contracts/index.ts";
import type { LamRepositoryState } from "../repository.ts";
import type {
  LamApprovedLeavePayrollReference,
  LamAuditEvent,
  LamLeaveApplication,
  LamLeaveType,
  LamPayrollReferenceExportBatch,
  LamUnpaidLeavePayrollReference,
} from "../schema.ts";
import {
  lamApprovedLeavePayrollReferenceSchema,
  lamUnpaidLeavePayrollReferenceSchema,
} from "../schema.ts";

export const isUnpaidLeaveType = (leaveType: LamLeaveType): boolean =>
  leaveType.kind === "unpaid" || !leaveType.paid;

export const shouldReserveLeaveBalance = (leaveType: LamLeaveType): boolean =>
  !isUnpaidLeaveType(leaveType);

export const findActiveLeaveTypeForApplication = (
  draft: Pick<LamRepositoryState, "leaveTypes">,
  application: LamLeaveApplication,
  companyId: string
): LamLeaveType | null =>
  draft.leaveTypes.find(
    (entry) =>
      entry.id === application.leaveTypeId &&
      entry.companyId === companyId &&
      entry.active
  ) ?? null;

export const buildUnpaidLeaveSourceReference = (
  application: LamLeaveApplication,
  leaveType: LamLeaveType
): string =>
  `lam:unpaid-leave:${application.companyId ?? "global"}:${application.id}:${leaveType.code}`;

export const buildApprovedLeaveSourceReference = (
  application: LamLeaveApplication,
  leaveType: LamLeaveType
): string =>
  `lam:approved-leave:${application.companyId ?? "global"}:${application.id}:${leaveType.code}`;

const collectStringIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0
  );
};

export const resolveExportedPayrollReferenceApplicationIds = (
  auditEvents: readonly LamAuditEvent[]
): Set<string> =>
  resolveExportedPayrollReferenceIds(auditEvents).leaveApplicationIds;

export const resolveExportedPayrollReferenceAttendanceRecordIds = (
  auditEvents: readonly LamAuditEvent[]
): Set<string> =>
  resolveExportedPayrollReferenceIds(auditEvents).attendanceRecordIds;

export const resolveExportedPayrollReferenceIds = (
  auditEvents: readonly LamAuditEvent[]
): { leaveApplicationIds: Set<string>; attendanceRecordIds: Set<string> } => {
  const leaveApplicationIds = new Set<string>();
  const attendanceRecordIds = new Set<string>();

  for (const event of auditEvents) {
    if (
      event.action !==
      leaveAttendanceManagementAuditEvents.payrollReferenceExported
    ) {
      continue;
    }

    const metadata = event.metadata ?? {};
    for (const id of collectStringIds(metadata.leaveApplicationIds)) {
      leaveApplicationIds.add(id.trim());
    }
    for (const id of collectStringIds(metadata.attendanceRecordIds)) {
      attendanceRecordIds.add(id.trim());
    }
  }

  return { leaveApplicationIds, attendanceRecordIds };
};

const overlapsPayPeriod = (
  application: LamLeaveApplication,
  payPeriodStart?: Date,
  payPeriodEnd?: Date
): boolean => {
  if (!(payPeriodStart || payPeriodEnd)) {
    return true;
  }

  const start = payPeriodStart ?? payPeriodEnd;
  const end = payPeriodEnd ?? payPeriodStart;
  if (!(start && end)) {
    return true;
  }

  return application.startDate <= end && application.endDate >= start;
};

export const projectUnpaidLeavePayrollReference = (args: {
  application: LamLeaveApplication;
  leaveType: LamLeaveType;
  exportedApplicationIds: ReadonlySet<string>;
  exportBatch?: LamPayrollReferenceExportBatch | null;
}): LamUnpaidLeavePayrollReference | null => {
  if (!isUnpaidLeaveType(args.leaveType)) {
    return null;
  }

  if (args.application.status !== "approved") {
    return null;
  }

  const exportedAt =
    args.exportBatch?.exportedAt ??
    (args.exportedApplicationIds.has(args.application.id)
      ? args.application.approvedAt
      : null);

  return lamUnpaidLeavePayrollReferenceSchema.parse({
    id: args.application.id,
    companyId: args.application.companyId,
    employeeId: args.application.employeeId,
    leaveApplicationId: args.application.id,
    leaveTypeId: args.application.leaveTypeId,
    leaveTypeCode: args.leaveType.code,
    leaveTypeKind: args.leaveType.kind,
    paid: false,
    applicationStatus: args.application.status,
    startDate: args.application.startDate,
    endDate: args.application.endDate,
    totalDays: args.application.totalDays,
    approvedAt: args.application.approvedAt,
    approvedBy: args.application.approvedBy,
    deductionCategory: "unpaid_leave",
    sourceReference: buildUnpaidLeaveSourceReference(
      args.application,
      args.leaveType
    ),
    exportBatchId: args.exportBatch?.id,
    exportedAt: exportedAt ?? undefined,
  });
};

export const projectApprovedLeavePayrollReference = (args: {
  application: LamLeaveApplication;
  leaveType: LamLeaveType;
  exportedApplicationIds: ReadonlySet<string>;
  exportBatch?: LamPayrollReferenceExportBatch | null;
}): LamApprovedLeavePayrollReference | null => {
  if (args.application.status !== "approved") {
    return null;
  }

  const exportedAt =
    args.exportBatch?.exportedAt ??
    (args.exportedApplicationIds.has(args.application.id)
      ? args.application.approvedAt
      : null);

  return lamApprovedLeavePayrollReferenceSchema.parse({
    id: args.application.id,
    companyId: args.application.companyId,
    employeeId: args.application.employeeId,
    leaveApplicationId: args.application.id,
    leaveTypeId: args.application.leaveTypeId,
    leaveTypeCode: args.leaveType.code,
    leaveTypeKind: args.leaveType.kind,
    paid: !isUnpaidLeaveType(args.leaveType),
    applicationStatus: args.application.status,
    startDate: args.application.startDate,
    endDate: args.application.endDate,
    totalDays: args.application.totalDays,
    approvedAt: args.application.approvedAt,
    approvedBy: args.application.approvedBy,
    deductionCategory: "approved_leave",
    sourceReference: buildApprovedLeaveSourceReference(
      args.application,
      args.leaveType
    ),
    exportBatchId: args.exportBatch?.id,
    exportedAt: exportedAt ?? undefined,
  });
};

export type ListPayrollReferenceFilters = {
  companyId?: string;
  employeeId?: string;
  payPeriodStart?: Date;
  payPeriodEnd?: Date;
  exportStatus?: "pending" | "exported" | "all";
};

export type ListUnpaidLeavePayrollReferenceFilters =
  ListPayrollReferenceFilters;
export type ListApprovedLeavePayrollReferenceFilters =
  ListPayrollReferenceFilters;

export const listApprovedLeavePayrollReferences = (
  state: LamRepositoryState,
  filters: ListApprovedLeavePayrollReferenceFilters = {}
): LamApprovedLeavePayrollReference[] => {
  const exportedApplicationIds = resolveExportedPayrollReferenceApplicationIds(
    state.auditEvents
  );
  const exportStatus = filters.exportStatus ?? "all";

  return state.leaveApplications
    .filter((application) =>
      filters.companyId ? application.companyId === filters.companyId : true
    )
    .filter((application) =>
      filters.employeeId ? application.employeeId === filters.employeeId : true
    )
    .filter((application) =>
      overlapsPayPeriod(
        application,
        filters.payPeriodStart,
        filters.payPeriodEnd
      )
    )
    .map((application) => {
      const leaveType = findActiveLeaveTypeForApplication(
        state,
        application,
        application.companyId ?? filters.companyId ?? ""
      );
      if (!leaveType) {
        return null;
      }

      return projectApprovedLeavePayrollReference({
        application,
        leaveType,
        exportedApplicationIds,
      });
    })
    .filter((reference): reference is LamApprovedLeavePayrollReference => {
      if (!reference) {
        return false;
      }

      const isExported = exportedApplicationIds.has(
        reference.leaveApplicationId
      );
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
        right.startDate.getTime() - left.startDate.getTime() ||
        right.leaveApplicationId.localeCompare(left.leaveApplicationId)
    );
};

export const listUnpaidLeavePayrollReferences = (
  state: LamRepositoryState,
  filters: ListUnpaidLeavePayrollReferenceFilters = {}
): LamUnpaidLeavePayrollReference[] => {
  const exportedApplicationIds = resolveExportedPayrollReferenceApplicationIds(
    state.auditEvents
  );
  const exportStatus = filters.exportStatus ?? "all";

  return state.leaveApplications
    .filter((application) =>
      filters.companyId ? application.companyId === filters.companyId : true
    )
    .filter((application) =>
      filters.employeeId ? application.employeeId === filters.employeeId : true
    )
    .filter((application) =>
      overlapsPayPeriod(
        application,
        filters.payPeriodStart,
        filters.payPeriodEnd
      )
    )
    .map((application) => {
      const leaveType = findActiveLeaveTypeForApplication(
        state,
        application,
        application.companyId ?? filters.companyId ?? ""
      );
      if (!leaveType) {
        return null;
      }

      return projectUnpaidLeavePayrollReference({
        application,
        leaveType,
        exportedApplicationIds,
      });
    })
    .filter((reference): reference is LamUnpaidLeavePayrollReference => {
      if (!reference) {
        return false;
      }

      const isExported = exportedApplicationIds.has(
        reference.leaveApplicationId
      );
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
        right.startDate.getTime() - left.startDate.getTime() ||
        right.leaveApplicationId.localeCompare(left.leaveApplicationId)
    );
};
