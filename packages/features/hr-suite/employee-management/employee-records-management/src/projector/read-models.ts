import type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentsPageModel,
  HrEmployeeStatusHistoryPageModel,
  HrEmployeeStatusHistoryRecord,
} from "../schema.ts";
import {
  hrEmployeeAssignmentsPageModelSchema,
  hrEmployeeStatusHistoryPageModelSchema,
} from "../schema.ts";
import {
  projectHrEmployeeAssignment,
  projectHrEmployeeAssignmentViews,
  resolveCurrentHrEmployeeAssignment,
  sortHrEmployeeAssignments,
} from "./assignment.ts";
import {
  projectHrEmployeeStatusHistory,
  projectHrEmployeeStatusHistoryViews,
  resolveCurrentHrEmployeeStatusHistory,
  sortHrEmployeeStatusHistory,
} from "./status.ts";

const paginate = <T>(
  values: readonly T[],
  page: number,
  pageSize: number
): readonly T[] => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 25;
  const start = (safePage - 1) * safePageSize;
  return values.slice(start, start + safePageSize);
};

export function buildHrEmployeeAssignmentsPageModel(input: {
  assignments: readonly HrEmployeeAssignmentRecord[];
  employeeId?: string;
  organizationId?: string | null;
  asOf?: Date;
  current?: boolean;
  page?: number;
  pageSize?: number;
}): HrEmployeeAssignmentsPageModel {
  const asOf = input.asOf ?? new Date();
  const currentAssignment = resolveCurrentHrEmployeeAssignment(
    input.assignments,
    asOf
  );
  const currentAssignmentId = currentAssignment?.id ?? null;
  let orderedAssignments: readonly HrEmployeeAssignmentRecord[];
  if (input.current) {
    orderedAssignments = currentAssignment ? [currentAssignment] : [];
  } else {
    orderedAssignments = sortHrEmployeeAssignments(input.assignments);
  }
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pagedAssignments = paginate(orderedAssignments, page, pageSize);
  let projectedCurrentAssignment:
    | HrEmployeeAssignmentsPageModel["currentAssignment"]
    | undefined;
  if (input.employeeId) {
    projectedCurrentAssignment = currentAssignment
      ? projectHrEmployeeAssignment(currentAssignment, {
          isCurrent: true,
        })
      : null;
  }

  return hrEmployeeAssignmentsPageModelSchema.parse({
    organizationId: input.organizationId ?? null,
    employeeId: input.employeeId,
    currentAssignment: projectedCurrentAssignment,
    assignments: projectHrEmployeeAssignmentViews(
      pagedAssignments,
      currentAssignmentId
    ),
    page,
    pageSize,
    totalCount: orderedAssignments.length,
    hasNextPage: page * pageSize < orderedAssignments.length,
  });
}

export function buildHrEmployeeStatusHistoryPageModel(input: {
  employeeId?: string;
  organizationId?: string | null;
  statusHistory: readonly HrEmployeeStatusHistoryRecord[];
  asOf?: Date;
  current?: boolean;
  page?: number;
  pageSize?: number;
}): HrEmployeeStatusHistoryPageModel {
  const asOf = input.asOf ?? new Date();
  const currentHistory = resolveCurrentHrEmployeeStatusHistory(
    input.statusHistory,
    asOf
  );
  const currentHistoryId = currentHistory?.id ?? null;
  let orderedHistory: readonly HrEmployeeStatusHistoryRecord[];
  if (input.current) {
    orderedHistory = currentHistory ? [currentHistory] : [];
  } else {
    orderedHistory = sortHrEmployeeStatusHistory(input.statusHistory);
  }
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pagedHistory = paginate(orderedHistory, page, pageSize);
  let projectedCurrentHistory:
    | HrEmployeeStatusHistoryPageModel["currentStatusHistory"]
    | undefined;
  if (input.employeeId) {
    projectedCurrentHistory = currentHistory
      ? projectHrEmployeeStatusHistory(currentHistory, { isCurrent: true })
      : null;
  }

  return hrEmployeeStatusHistoryPageModelSchema.parse({
    organizationId: input.organizationId ?? null,
    employeeId: input.employeeId,
    currentStatusHistory: projectedCurrentHistory,
    statusHistory: projectHrEmployeeStatusHistoryViews(
      pagedHistory,
      currentHistoryId
    ),
    page,
    pageSize,
    totalCount: orderedHistory.length,
    hasNextPage: page * pageSize < orderedHistory.length,
  });
}
