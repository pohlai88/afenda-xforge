export type EmployeeSelfservicePortalStatus = "draft" | "active" | "archived";

export type EmployeeSelfservicePortalRecord = {
  id: string;
  name: string;
  status: EmployeeSelfservicePortalStatus;
};

export type ListEmployeeSelfservicePortalQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateEmployeeSelfservicePortalInput = {
  name: string;
};

export type UpdateEmployeeSelfservicePortalInput = {
  id: string;
  name?: string;
  status?: EmployeeSelfservicePortalStatus;
};

export const hrWorkforceEssReadPermission = {
  module: "hr",
  object: "workforce.ess",
  function: "read",
} as const;

export const hrWorkforceEssRoutePaths = {
  hub: "/hr/employee-selfservice-portal",
} as const;

export type HrWorkforceEssRoutePath =
  (typeof hrWorkforceEssRoutePaths)[keyof typeof hrWorkforceEssRoutePaths];

export const employeeSelfservicePortalRouteContracts = [] as const;

export const employeeSelfservicePortalFeatureId =
  "hr-suite.employee-management.employee-selfservice-portal" as const;
