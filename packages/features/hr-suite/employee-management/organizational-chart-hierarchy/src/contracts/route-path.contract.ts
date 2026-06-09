export const hrOrgRoutePaths = {
  hub: "/hr",
  org: "/hr/org",
} as const;

export type HrOrgRoutePath =
  (typeof hrOrgRoutePaths)[keyof typeof hrOrgRoutePaths];

export function hrEmployeeDetailRoutePath(
  employeeId: string
): `/hr/org/${string}` {
  return `/hr/org/${employeeId}`;
}
