export const hrRecordsRoutePaths = {
  hub: "/hr",
  employees: "/hr/employees",
  records: "/hr/records",
} as const;

export type HrRecordsRoutePath =
  (typeof hrRecordsRoutePaths)[keyof typeof hrRecordsRoutePaths];

export function hrEmployeeDetailRoutePath(
  employeeId: string
): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}
