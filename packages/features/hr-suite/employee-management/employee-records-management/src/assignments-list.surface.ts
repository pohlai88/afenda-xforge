export const hrRecordsAssignmentsSurfaceKey = "hr.records.assignments" as const;
export const hrRecordsAssignmentsSearchParam = "assignmentsSearch" as const;
export const hrRecordsAssignmentsEmployeeParam = "employeeId" as const;
export const hrRecordsAssignmentsManagerParam = "managerEmployeeId" as const;
export const hrRecordsAssignmentsDepartmentParam = "departmentId" as const;
export const hrRecordsAssignmentsLocationParam = "workLocationCode" as const;
export const hrRecordsAssignmentsCurrentParam = "current" as const;
export const hrRecordsAssignmentsAsOfParam = "asOf" as const;
export const hrRecordsAssignmentsPageParam = "page" as const;
export const hrRecordsAssignmentsPageSizeParam = "pageSize" as const;

export function buildHrRecordsAssignmentsListSurface(): {
  readonly key: typeof hrRecordsAssignmentsSurfaceKey;
  readonly searchParam: typeof hrRecordsAssignmentsSearchParam;
  readonly filters: {
    readonly employeeId: typeof hrRecordsAssignmentsEmployeeParam;
    readonly managerEmployeeId: typeof hrRecordsAssignmentsManagerParam;
    readonly departmentId: typeof hrRecordsAssignmentsDepartmentParam;
    readonly workLocationCode: typeof hrRecordsAssignmentsLocationParam;
    readonly current: typeof hrRecordsAssignmentsCurrentParam;
    readonly asOf: typeof hrRecordsAssignmentsAsOfParam;
    readonly page: typeof hrRecordsAssignmentsPageParam;
    readonly pageSize: typeof hrRecordsAssignmentsPageSizeParam;
  };
} {
  return {
    key: hrRecordsAssignmentsSurfaceKey,
    searchParam: hrRecordsAssignmentsSearchParam,
    filters: {
      employeeId: hrRecordsAssignmentsEmployeeParam,
      managerEmployeeId: hrRecordsAssignmentsManagerParam,
      departmentId: hrRecordsAssignmentsDepartmentParam,
      workLocationCode: hrRecordsAssignmentsLocationParam,
      current: hrRecordsAssignmentsCurrentParam,
      asOf: hrRecordsAssignmentsAsOfParam,
      page: hrRecordsAssignmentsPageParam,
      pageSize: hrRecordsAssignmentsPageSizeParam,
    },
  } as const;
}
