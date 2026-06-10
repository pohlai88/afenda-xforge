export {
  type CreateEmployeeSelfservicePortalInput,
  type CreateEmployeeSelfservicePortalProfileUpdateRequestInput,
  createEmployeeSelfservicePortalInputSchema,
  createEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  type EmployeeSelfservicePortalProfileQuery,
  type EmployeeSelfservicePortalProfileUpdateRequest,
  type EmployeeSelfservicePortalProfileUpdateRequestView,
  type EmployeeSelfservicePortalProfileUpdateStatus,
  type EmployeeSelfservicePortalProfileView,
  type EmployeeSelfservicePortalRecord,
  type EmployeeSelfservicePortalStatus,
  type EmployeeSelfservicePortalSummary,
  employeeSelfservicePortalProfileQuerySchema,
  employeeSelfservicePortalProfileUpdateRequestViewSchema,
  employeeSelfservicePortalProfileUpdateStatusSchema,
  employeeSelfservicePortalProfileViewSchema,
  employeeSelfservicePortalRecordSchema,
  employeeSelfservicePortalStatusSchema,
  employeeSelfservicePortalSummarySchema,
  type ListEmployeeSelfservicePortalProfileUpdateRequestsQuery,
  type ListEmployeeSelfservicePortalQuery,
  listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema,
  listEmployeeSelfservicePortalQuerySchema,
  type RejectEmployeeSelfservicePortalProfileUpdateRequestInput,
  type ReviewEmployeeSelfservicePortalProfileUpdateRequestInput,
  rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  reviewEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  type UpdateEmployeeSelfservicePortalInput,
  updateEmployeeSelfservicePortalInputSchema,
} from "./schema.ts";

export const hrWorkforceEssReadPermission = {
  module: "hr",
  object: "employee-selfservice-portal",
  function: "read",
} as const;

export const hrWorkforceEssWritePermission = {
  module: "hr",
  object: "employee-selfservice-portal",
  function: "write",
} as const;

export const hrWorkforceEssRoutePaths = {
  hub: "/hr/employee-selfservice-portal",
  api: "/api/hr/employee-selfservice-portal",
} as const;

export function hrWorkforceEssDetailRoutePath(portalRecordId: string): string {
  return `${hrWorkforceEssRoutePaths.hub}/${portalRecordId}`;
}

export type HrWorkforceEssRoutePath =
  | (typeof hrWorkforceEssRoutePaths)[keyof typeof hrWorkforceEssRoutePaths]
  | string;

export const employeeSelfservicePortalRouteContracts = [
  {
    method: "GET",
    path: hrWorkforceEssRoutePaths.api,
    purpose: "List self-service portal records within the authorized scope.",
  },
  {
    method: "POST",
    path: hrWorkforceEssRoutePaths.api,
    purpose: "Create a scoped employee self-service portal record.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/profile`,
    purpose: "Read the actor-scoped employee self-service profile view.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/profile-update-requests`,
    purpose: "List actor-scoped employee self-service profile update requests.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/profile-update-requests/[requestId]`,
    purpose:
      "Read an actor-scoped employee self-service profile update request.",
  },
  {
    method: "POST",
    path: `${hrWorkforceEssRoutePaths.api}/profile-update-requests`,
    purpose: "Submit an employee self-service profile update request.",
  },
  {
    method: "POST",
    path: `${hrWorkforceEssRoutePaths.api}/profile-update-requests/[requestId]/approve`,
    purpose: "Approve a pending employee self-service profile update request.",
  },
  {
    method: "POST",
    path: `${hrWorkforceEssRoutePaths.api}/profile-update-requests/[requestId]/reject`,
    purpose: "Reject a pending employee self-service profile update request.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/[portalRecordId]`,
    purpose: "Read a self-service portal record by id within scope.",
  },
  {
    method: "PATCH",
    path: `${hrWorkforceEssRoutePaths.api}/[portalRecordId]`,
    purpose: "Update a self-service portal record by id within scope.",
  },
] as const;

export type EmployeeSelfservicePortalRouteContract =
  (typeof employeeSelfservicePortalRouteContracts)[number];

export const employeeSelfservicePortalFeatureId =
  "hr-suite.employee-management.employee-selfservice-portal" as const;
