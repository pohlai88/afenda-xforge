import type { LamRepositoryState } from "../repository.ts";
import type {
  LamAttendanceRecord,
  LamAttendanceSummary,
  LamLeaveApplication,
} from "../schema.ts";
import { lamAttendanceSummarySchema } from "../schema.ts";

const MS_PER_DAY = 86_400_000;

const startOfUtcDay = (value: Date): number =>
  Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());

export const countInclusiveCalendarDaysInPeriod = (
  rangeStart: Date,
  rangeEnd: Date,
  periodStart: Date,
  periodEnd: Date
): number => {
  const overlapStart = Math.max(
    startOfUtcDay(rangeStart),
    startOfUtcDay(periodStart)
  );
  const overlapEnd = Math.min(
    startOfUtcDay(rangeEnd),
    startOfUtcDay(periodEnd)
  );

  if (overlapEnd < overlapStart) {
    return 0;
  }

  return Math.floor((overlapEnd - overlapStart) / MS_PER_DAY) + 1;
};

export const isDateWithinPeriod = (
  value: Date,
  periodStart: Date,
  periodEnd: Date
): boolean =>
  startOfUtcDay(value) >= startOfUtcDay(periodStart) &&
  startOfUtcDay(value) <= startOfUtcDay(periodEnd);

export const filterAttendanceRecordsForSummary = (
  records: readonly LamAttendanceRecord[],
  args: {
    companyId?: string;
    employeeId?: string;
    employeeIds?: readonly string[];
    attendanceStatus?: LamAttendanceRecord["status"];
    periodStart: Date;
    periodEnd: Date;
  }
): LamAttendanceRecord[] =>
  records
    .filter((entry) =>
      args.companyId ? entry.companyId === args.companyId : true
    )
    .filter((entry) =>
      args.employeeId ? entry.employeeId === args.employeeId : true
    )
    .filter((entry) =>
      args.employeeIds && args.employeeIds.length > 0
        ? args.employeeIds.includes(entry.employeeId)
        : true
    )
    .filter((entry) =>
      args.attendanceStatus ? entry.status === args.attendanceStatus : true
    )
    .filter((entry) =>
      isDateWithinPeriod(entry.attendanceDate, args.periodStart, args.periodEnd)
    );

export const filterApprovedLeaveApplicationsForSummary = (
  applications: readonly LamLeaveApplication[],
  args: {
    companyId?: string;
    employeeId?: string;
    employeeIds?: readonly string[];
    leaveTypeId?: string;
    periodStart: Date;
    periodEnd: Date;
  }
): LamLeaveApplication[] =>
  applications
    .filter((entry) => entry.status === "approved")
    .filter((entry) =>
      args.companyId ? entry.companyId === args.companyId : true
    )
    .filter((entry) =>
      args.employeeId ? entry.employeeId === args.employeeId : true
    )
    .filter((entry) =>
      args.employeeIds && args.employeeIds.length > 0
        ? args.employeeIds.includes(entry.employeeId)
        : true
    )
    .filter((entry) =>
      args.leaveTypeId ? entry.leaveTypeId === args.leaveTypeId : true
    )
    .filter(
      (entry) =>
        countInclusiveCalendarDaysInPeriod(
          entry.startDate,
          entry.endDate,
          args.periodStart,
          args.periodEnd
        ) > 0
    );

export const projectAttendanceSummary = (args: {
  employeeId: string;
  companyId?: string;
  periodStart: Date;
  periodEnd: Date;
  attendanceRecords: readonly LamAttendanceRecord[];
  leaveApplications: readonly LamLeaveApplication[];
}): LamAttendanceSummary => {
  const leaveTakenByType: Record<string, number> = {};
  let leaveTakenDays = 0;

  for (const application of args.leaveApplications) {
    const overlapDays = countInclusiveCalendarDaysInPeriod(
      application.startDate,
      application.endDate,
      args.periodStart,
      args.periodEnd
    );
    if (overlapDays <= 0) {
      continue;
    }

    leaveTakenDays += overlapDays;
    leaveTakenByType[application.leaveTypeId] =
      (leaveTakenByType[application.leaveTypeId] ?? 0) + overlapDays;
  }

  const countByStatus = (status: LamAttendanceRecord["status"]): number =>
    args.attendanceRecords.filter((entry) => entry.status === status).length;

  return lamAttendanceSummarySchema.parse({
    id: `${args.employeeId}:${args.periodStart.toISOString()}:${args.periodEnd.toISOString()}`,
    companyId: args.companyId,
    employeeId: args.employeeId,
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
    daysWorked: countByStatus("present"),
    absentDays: countByStatus("absent"),
    lateDays: countByStatus("late"),
    earlyOutDays: countByStatus("early_out"),
    halfDays: countByStatus("half_day"),
    missingPunchDays: countByStatus("missing_punch"),
    restDays: countByStatus("rest_day"),
    offDays: countByStatus("off_day"),
    publicHolidayDays: countByStatus("public_holiday"),
    totalRecords: args.attendanceRecords.length,
    leaveTakenDays,
    leaveTakenByType,
  });
};

export type ListAttendanceSummaryFilters = {
  companyId?: string;
  employeeId?: string;
  employeeIds?: readonly string[];
  attendanceStatus?: LamAttendanceRecord["status"];
  leaveTypeId?: string;
  periodStart: Date;
  periodEnd: Date;
};

export const resolveEmployeeIdsFilter = (args: {
  employeeId?: string | null;
  employeeIds?: readonly string[] | null;
}): string[] | undefined => {
  if (args.employeeIds?.length) {
    return [...args.employeeIds];
  }

  if (args.employeeId) {
    return [args.employeeId];
  }

  return;
};

export const listAttendanceSummaries = (
  state: LamRepositoryState,
  filters: ListAttendanceSummaryFilters
): LamAttendanceSummary[] => {
  const attendanceRecords = filterAttendanceRecordsForSummary(
    state.attendanceRecords,
    filters
  );
  const leaveApplications = filterApprovedLeaveApplicationsForSummary(
    state.leaveApplications,
    filters
  );

  const attendanceEmployeeIds = attendanceRecords.map(
    (entry) => entry.employeeId
  );
  const employeeIds = new Set<string>(
    filters.attendanceStatus
      ? attendanceEmployeeIds
      : [
          ...attendanceEmployeeIds,
          ...leaveApplications.map((entry) => entry.employeeId),
        ]
  );

  return [...employeeIds]
    .sort((left, right) => left.localeCompare(right))
    .map((employeeId) =>
      projectAttendanceSummary({
        employeeId,
        companyId: filters.companyId,
        periodStart: filters.periodStart,
        periodEnd: filters.periodEnd,
        attendanceRecords: attendanceRecords.filter(
          (entry) => entry.employeeId === employeeId
        ),
        leaveApplications: leaveApplications.filter(
          (entry) => entry.employeeId === employeeId
        ),
      })
    );
};
