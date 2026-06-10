import type { LamRepositoryState } from "../repository.ts";
import type {
  LamLeaveApplication,
  LamLeaveApplicationStatus,
  LamLeaveReportEntry,
} from "../schema.ts";
import { lamLeaveReportEntrySchema } from "../schema.ts";
import { countInclusiveCalendarDaysInPeriod } from "./attendance-summary.ts";

export type ListLeaveReportFilters = {
  companyId?: string;
  employeeId?: string;
  employeeIds?: readonly string[];
  leaveTypeId?: string;
  status?: LamLeaveApplicationStatus;
  periodStart: Date;
  periodEnd: Date;
};

export const filterLeaveApplicationsForReport = (
  applications: readonly LamLeaveApplication[],
  args: ListLeaveReportFilters
): LamLeaveApplication[] =>
  applications
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
    .filter((entry) => (args.status ? entry.status === args.status : true))
    .filter(
      (entry) =>
        countInclusiveCalendarDaysInPeriod(
          entry.startDate,
          entry.endDate,
          args.periodStart,
          args.periodEnd
        ) > 0
    );

export const projectLeaveReportEntry = (args: {
  employeeId: string;
  companyId?: string;
  periodStart: Date;
  periodEnd: Date;
  applications: readonly LamLeaveApplication[];
}): LamLeaveReportEntry => {
  const daysByType: Record<string, number> = {};
  const applicationsByStatus: Record<string, number> = {};
  let totalDays = 0;

  for (const application of args.applications) {
    const overlapDays = countInclusiveCalendarDaysInPeriod(
      application.startDate,
      application.endDate,
      args.periodStart,
      args.periodEnd
    );
    if (overlapDays <= 0) {
      continue;
    }

    totalDays += overlapDays;
    daysByType[application.leaveTypeId] =
      (daysByType[application.leaveTypeId] ?? 0) + overlapDays;
    applicationsByStatus[application.status] =
      (applicationsByStatus[application.status] ?? 0) + 1;
  }

  return lamLeaveReportEntrySchema.parse({
    id: `${args.employeeId}:${args.periodStart.toISOString()}:${args.periodEnd.toISOString()}`,
    companyId: args.companyId,
    employeeId: args.employeeId,
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
    totalApplications: args.applications.length,
    totalDays,
    daysByType,
    applicationsByStatus,
  });
};

export const listLeaveReportEntries = (
  state: LamRepositoryState,
  filters: ListLeaveReportFilters
): LamLeaveReportEntry[] => {
  const applications = filterLeaveApplicationsForReport(
    state.leaveApplications,
    filters
  );

  const employeeIds = new Set(applications.map((entry) => entry.employeeId));

  return [...employeeIds]
    .sort((left, right) => left.localeCompare(right))
    .map((employeeId) =>
      projectLeaveReportEntry({
        employeeId,
        companyId: filters.companyId,
        periodStart: filters.periodStart,
        periodEnd: filters.periodEnd,
        applications: applications.filter(
          (entry) => entry.employeeId === employeeId
        ),
      })
    );
};
