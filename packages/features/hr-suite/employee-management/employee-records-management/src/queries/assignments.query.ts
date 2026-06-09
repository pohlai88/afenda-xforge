import "server-only";

import { hrRecordsStore } from "../hr.workforce.records.store.ts";
import { canReadHrEmployeeRecord } from "../policy.ts";
import {
  projectHrEmployeeAssignment,
  projectHrEmployeeAssignmentViews,
  resolveCurrentHrEmployeeAssignment,
  sortHrEmployeeAssignments,
} from "../projector/assignment.ts";
import type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentsPageModel,
} from "../schema.ts";
import {
  hrEmployeeAssignmentsPageModelSchema,
  hrEmployeeAssignmentsQuerySchema,
} from "../schema.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

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

const groupAssignmentsByEmployee = (
  assignments: readonly HrEmployeeAssignmentRecord[]
): Map<string, HrEmployeeAssignmentRecord[]> => {
  const grouped = new Map<string, HrEmployeeAssignmentRecord[]>();
  for (const assignment of assignments) {
    const bucket = grouped.get(assignment.employeeId) ?? [];
    bucket.push(assignment);
    grouped.set(assignment.employeeId, bucket);
  }

  return grouped;
};

const matchesAssignmentFilters = (
  assignment: HrEmployeeAssignmentRecord,
  query: {
    employeeId?: string;
    managerEmployeeId?: string;
    departmentId?: string;
    workLocationCode?: string;
    asOf?: Date;
  }
): boolean => {
  if (query.employeeId && assignment.employeeId !== query.employeeId) {
    return false;
  }

  if (
    query.managerEmployeeId &&
    assignment.managerEmployeeId !== query.managerEmployeeId
  ) {
    return false;
  }

  if (query.departmentId && assignment.departmentId !== query.departmentId) {
    return false;
  }

  if (
    query.workLocationCode &&
    assignment.workLocationCode !== query.workLocationCode
  ) {
    return false;
  }

  if (query.asOf && assignment.effectiveFrom.getTime() > query.asOf.getTime()) {
    return false;
  }

  return true;
};

const buildCurrentAssignmentRecords = (
  assignments: readonly HrEmployeeAssignmentRecord[],
  asOf: Date
): readonly HrEmployeeAssignmentRecord[] =>
  Array.from(groupAssignmentsByEmployee(assignments).values())
    .map((employeeAssignments) =>
      resolveCurrentHrEmployeeAssignment(employeeAssignments, asOf)
    )
    .filter(
      (assignment): assignment is HrEmployeeAssignmentRecord =>
        assignment !== null
    );

const buildCurrentAssignmentsPageModel = (
  assignments: readonly HrEmployeeAssignmentRecord[],
  parsed: ReturnType<typeof hrEmployeeAssignmentsQuerySchema.parse>,
  context: QueryContext | undefined,
  page: number,
  pageSize: number,
  asOf: Date
): HrEmployeeAssignmentsPageModel => {
  const currentAssignments = sortHrEmployeeAssignments(
    buildCurrentAssignmentRecords(assignments, asOf).filter((assignment) =>
      matchesAssignmentFilters(assignment, {
        employeeId: parsed.employeeId,
        managerEmployeeId: parsed.managerEmployeeId,
        departmentId: parsed.departmentId,
        workLocationCode: parsed.workLocationCode,
      })
    )
  );
  const pagedAssignments = paginate(currentAssignments, page, pageSize);
  let currentAssignment:
    | HrEmployeeAssignmentsPageModel["currentAssignment"]
    | undefined;
  if (parsed.employeeId) {
    currentAssignment =
      currentAssignments.length > 0
        ? projectHrEmployeeAssignment(
            currentAssignments[0] as HrEmployeeAssignmentRecord,
            {
              isCurrent: true,
            }
          )
        : null;
  }

  return hrEmployeeAssignmentsPageModelSchema.parse({
    organizationId: context?.organizationId ?? null,
    employeeId: parsed.employeeId,
    currentAssignment,
    assignments: pagedAssignments.map((assignment) =>
      projectHrEmployeeAssignment(assignment, { isCurrent: true })
    ),
    page,
    pageSize,
    totalCount: currentAssignments.length,
    hasNextPage: page * pageSize < currentAssignments.length,
  });
};

const buildHistoricalAssignmentsPageModel = (
  assignments: readonly HrEmployeeAssignmentRecord[],
  parsed: ReturnType<typeof hrEmployeeAssignmentsQuerySchema.parse>,
  context: QueryContext | undefined,
  page: number,
  pageSize: number,
  asOf: Date
): HrEmployeeAssignmentsPageModel => {
  const scopedAssignments = assignments.filter((assignment) =>
    matchesAssignmentFilters(assignment, {
      employeeId: parsed.employeeId,
      managerEmployeeId: parsed.managerEmployeeId,
      departmentId: parsed.departmentId,
      workLocationCode: parsed.workLocationCode,
      asOf: parsed.asOf,
    })
  );
  const historicalAssignments = sortHrEmployeeAssignments(scopedAssignments);
  const pagedAssignments = paginate(historicalAssignments, page, pageSize);
  const currentAssignment = parsed.employeeId
    ? resolveCurrentHrEmployeeAssignment(
        assignments.filter(
          (assignment) => assignment.employeeId === parsed.employeeId
        ),
        asOf
      )
    : null;
  let projectedCurrentAssignment:
    | HrEmployeeAssignmentsPageModel["currentAssignment"]
    | undefined;
  if (parsed.employeeId) {
    projectedCurrentAssignment = currentAssignment
      ? projectHrEmployeeAssignment(currentAssignment, {
          isCurrent: true,
        })
      : null;
  }

  return hrEmployeeAssignmentsPageModelSchema.parse({
    organizationId: context?.organizationId ?? null,
    employeeId: parsed.employeeId,
    currentAssignment: projectedCurrentAssignment,
    assignments: projectHrEmployeeAssignmentViews(
      pagedAssignments,
      currentAssignment?.id ?? null
    ),
    page,
    pageSize,
    totalCount: historicalAssignments.length,
    hasNextPage: page * pageSize < historicalAssignments.length,
  });
};

export function listHrEmployeeAssignments(
  query: unknown = {},
  context?: QueryContext
): HrEmployeeAssignmentsPageModel {
  const parsed = hrEmployeeAssignmentsQuerySchema.parse(query);

  if (!canReadHrEmployeeRecord(context ?? {})) {
    return hrEmployeeAssignmentsPageModelSchema.parse({
      organizationId: context?.organizationId ?? null,
      employeeId: parsed.employeeId,
      currentAssignment: null,
      assignments: [],
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 25,
      totalCount: 0,
      hasNextPage: false,
    });
  }

  const assignments = hrRecordsStore.listAssignments({
    canRead: true,
    organizationId: context?.organizationId,
  });
  const page = parsed.page ?? 1;
  const pageSize = parsed.pageSize ?? 25;
  const asOf = parsed.asOf ?? new Date();

  return parsed.current
    ? buildCurrentAssignmentsPageModel(
        assignments,
        parsed,
        context,
        page,
        pageSize,
        asOf
      )
    : buildHistoricalAssignmentsPageModel(
        assignments,
        parsed,
        context,
        page,
        pageSize,
        asOf
      );
}
