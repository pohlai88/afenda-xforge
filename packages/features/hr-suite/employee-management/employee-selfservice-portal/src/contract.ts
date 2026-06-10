export {
  type CreateEmployeeSelfservicePortalInput,
  type CreateEmployeeSelfservicePortalProfileUpdateRequestInput,
  createEmployeeSelfservicePortalInputSchema,
  createEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  type EmployeeSelfservicePortalLeaveApplicationItem,
  type EmployeeSelfservicePortalLeaveApplicationStatus,
  type EmployeeSelfservicePortalLeaveBalanceItem,
  type EmployeeSelfservicePortalLeaveUnit,
  type EmployeeSelfservicePortalManagerApprovalInboxItem,
  type EmployeeSelfservicePortalNotificationItem,
  type EmployeeSelfservicePortalNotificationSeverity,
  type EmployeeSelfservicePortalNotificationStatus,
  type EmployeeSelfservicePortalProfileQuery,
  type EmployeeSelfservicePortalProfileUpdateRequest,
  type EmployeeSelfservicePortalProfileUpdateRequestView,
  type EmployeeSelfservicePortalProfileUpdateStatus,
  type EmployeeSelfservicePortalProfileView,
  type EmployeeSelfservicePortalRecord,
  type EmployeeSelfservicePortalRequestStatusItem,
  type EmployeeSelfservicePortalResourceCategory,
  type EmployeeSelfservicePortalResourceItem,
  type EmployeeSelfservicePortalStatus,
  type EmployeeSelfservicePortalSummary,
  type EmployeeSelfservicePortalTaskCategory,
  type EmployeeSelfservicePortalTaskItem,
  type EmployeeSelfservicePortalTaskStatus,
  employeeSelfservicePortalLeaveApplicationItemSchema,
  employeeSelfservicePortalLeaveApplicationStatusSchema,
  employeeSelfservicePortalLeaveBalanceItemSchema,
  employeeSelfservicePortalLeaveUnitSchema,
  employeeSelfservicePortalManagerApprovalInboxItemSchema,
  employeeSelfservicePortalNotificationItemSchema,
  employeeSelfservicePortalNotificationSeveritySchema,
  employeeSelfservicePortalNotificationStatusSchema,
  employeeSelfservicePortalProfileQuerySchema,
  employeeSelfservicePortalProfileUpdateRequestViewSchema,
  employeeSelfservicePortalProfileUpdateStatusSchema,
  employeeSelfservicePortalProfileViewSchema,
  employeeSelfservicePortalRecordSchema,
  employeeSelfservicePortalRequestStatusItemSchema,
  employeeSelfservicePortalResourceCategorySchema,
  employeeSelfservicePortalResourceItemSchema,
  employeeSelfservicePortalStatusSchema,
  employeeSelfservicePortalSummarySchema,
  employeeSelfservicePortalTaskCategorySchema,
  employeeSelfservicePortalTaskItemSchema,
  employeeSelfservicePortalTaskStatusSchema,
  type ListEmployeeSelfservicePortalAuditQuery,
  type ListEmployeeSelfservicePortalLeaveApplicationsQuery,
  type ListEmployeeSelfservicePortalLeaveBalancesQuery,
  type ListEmployeeSelfservicePortalManagerApprovalInboxQuery,
  type ListEmployeeSelfservicePortalNotificationsQuery,
  type ListEmployeeSelfservicePortalProfileUpdateRequestsQuery,
  type ListEmployeeSelfservicePortalQuery,
  type ListEmployeeSelfservicePortalRequestStatusesQuery,
  type ListEmployeeSelfservicePortalResourcesQuery,
  type ListEmployeeSelfservicePortalTasksQuery,
  listEmployeeSelfservicePortalAuditQuerySchema,
  listEmployeeSelfservicePortalLeaveApplicationsQuerySchema,
  listEmployeeSelfservicePortalLeaveBalancesQuerySchema,
  listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema,
  listEmployeeSelfservicePortalNotificationsQuerySchema,
  listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema,
  listEmployeeSelfservicePortalQuerySchema,
  listEmployeeSelfservicePortalRequestStatusesQuerySchema,
  listEmployeeSelfservicePortalResourcesQuerySchema,
  listEmployeeSelfservicePortalTasksQuerySchema,
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
    path: `${hrWorkforceEssRoutePaths.api}/leave/balances`,
    purpose:
      "List actor-scoped leave balances from Leave Attendance Management.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/leave/applications`,
    purpose:
      "List actor-scoped leave application history and approval status from Leave Attendance Management.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/profile`,
    purpose: "Read the actor-scoped employee self-service profile view.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/audit-trail`,
    purpose: "Read the scoped employee self-service audit trail.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/documents`,
    purpose: "List actor-scoped employee self-service document summaries.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/documents/acknowledgments`,
    purpose:
      "List actor-scoped policy and notice acknowledgment items for self-service.",
  },
  {
    method: "POST",
    path: `${hrWorkforceEssRoutePaths.api}/documents/acknowledgments`,
    purpose:
      "Acknowledge an actor-scoped policy or required HR notice in self-service.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/resources`,
    purpose:
      "List actor-scoped HR resource-center items including policies, handbooks, forms, and FAQs.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/tasks`,
    purpose:
      "List actor-scoped onboarding, offboarding, compliance, and HR tasks for self-service.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/request-status`,
    purpose: "List actor-scoped statuses for submitted self-service requests.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/approval-inbox`,
    purpose:
      "List manager-scoped self-service requests awaiting approval for direct reports where applicable.",
  },
  {
    method: "GET",
    path: `${hrWorkforceEssRoutePaths.api}/notifications`,
    purpose:
      "List actor-scoped self-service notifications for approvals, rejections, pending actions, and required tasks.",
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
