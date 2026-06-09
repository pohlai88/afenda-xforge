import type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentView,
} from "../schema.ts";
import { hrEmployeeAssignmentViewSchema } from "../schema.ts";

const toIsoString = (value: Date): string => value.toISOString();

const compareAssignmentRecords = (
  left: HrEmployeeAssignmentRecord,
  right: HrEmployeeAssignmentRecord
): number =>
  right.effectiveFrom.getTime() - left.effectiveFrom.getTime() ||
  right.createdAt.getTime() - left.createdAt.getTime() ||
  right.updatedAt.getTime() - left.updatedAt.getTime() ||
  right.id.localeCompare(left.id);

export function projectHrEmployeeAssignment(
  record: HrEmployeeAssignmentRecord,
  input?: {
    isCurrent?: boolean;
  }
): HrEmployeeAssignmentView {
  return hrEmployeeAssignmentViewSchema.parse({
    id: record.id,
    organizationId: record.organizationId,
    employeeId: record.employeeId,
    departmentId: record.departmentId,
    positionId: record.positionId,
    workLocationCode: record.workLocationCode,
    managerEmployeeId: record.managerEmployeeId,
    effectiveFrom: toIsoString(record.effectiveFrom),
    effectiveTo: record.effectiveTo ? toIsoString(record.effectiveTo) : null,
    source: record.source,
    reason: record.reason,
    actorId: record.actorId,
    isCurrent: input?.isCurrent ?? false,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  });
}

export function sortHrEmployeeAssignments(
  assignments: readonly HrEmployeeAssignmentRecord[]
): readonly HrEmployeeAssignmentRecord[] {
  return [...assignments].sort(compareAssignmentRecords);
}

export function resolveCurrentHrEmployeeAssignment(
  assignments: readonly HrEmployeeAssignmentRecord[],
  asOf = new Date()
): HrEmployeeAssignmentRecord | null {
  const eligible = assignments.filter(
    (assignment) =>
      assignment.effectiveFrom.getTime() <= asOf.getTime() &&
      (assignment.effectiveTo === null ||
        assignment.effectiveTo.getTime() > asOf.getTime())
  );

  return eligible.sort(compareAssignmentRecords)[0] ?? null;
}

export function projectHrEmployeeAssignmentViews(
  assignments: readonly HrEmployeeAssignmentRecord[],
  currentAssignmentId?: string | null
): readonly HrEmployeeAssignmentView[] {
  return sortHrEmployeeAssignments(assignments).map((assignment) =>
    projectHrEmployeeAssignment(assignment, {
      isCurrent: currentAssignmentId
        ? assignment.id === currentAssignmentId
        : false,
    })
  );
}
