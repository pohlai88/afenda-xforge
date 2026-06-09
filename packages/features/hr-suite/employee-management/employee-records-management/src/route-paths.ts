export { hrRecordsRouteContract } from "./contracts/route.contract.ts";

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

export function hrEmployeeArchiveRoutePath(
  employeeId: string
): `/hr/records/${string}/archive` {
  return `/hr/records/${employeeId}/archive`;
}

export function hrEmployeeRehireRoutePath(
  employeeId: string
): `/hr/records/${string}/rehire` {
  return `/hr/records/${employeeId}/rehire`;
}

export function hrEmployeeAssignmentsRoutePath(
  employeeId: string
): `/hr/records/${string}/assignments` {
  return `/hr/records/${employeeId}/assignments`;
}

export function hrEmployeeStatusHistoryRoutePath(
  employeeId: string
): `/hr/records/${string}/status-history` {
  return `/hr/records/${employeeId}/status-history`;
}
