export const hrRecordsAssignmentsSurfaceKey = "hr.records.assignments" as const;
export const hrRecordsAssignmentsSearchParam = "assignmentsSearch" as const;

export function buildHrRecordsAssignmentsListSurface(): {
  readonly key: typeof hrRecordsAssignmentsSurfaceKey;
  readonly searchParam: typeof hrRecordsAssignmentsSearchParam;
} {
  return {
    key: hrRecordsAssignmentsSurfaceKey,
    searchParam: hrRecordsAssignmentsSearchParam,
  } as const;
}
