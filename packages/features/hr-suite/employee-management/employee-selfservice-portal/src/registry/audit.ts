export const employeeSelfservicePortalAuditActions = {
  documentAcknowledged:
    "hr.employee-selfservice-portal.documents.acknowledgments.acknowledge",
  documentAcknowledgmentsViewed:
    "hr.employee-selfservice-portal.documents.acknowledgments.view",
  documentCatalogViewed: "hr.employee-selfservice-portal.documents.view",
  leaveApplicationsViewed:
    "hr.employee-selfservice-portal.leave.applications.view",
  leaveBalancesViewed: "hr.employee-selfservice-portal.leave.balances.view",
  managerApprovalInboxViewed:
    "hr.employee-selfservice-portal.approval-inbox.view",
  notificationsViewed: "hr.employee-selfservice-portal.notifications.view",
  profileUpdateRequestApproved:
    "hr.employee-selfservice-portal.profile-update-request.approve",
  profileUpdateRequestRejected:
    "hr.employee-selfservice-portal.profile-update-request.reject",
  profileUpdateRequestSubmitted:
    "hr.employee-selfservice-portal.profile-update-request.submit",
  requestStatusesViewed: "hr.employee-selfservice-portal.request-status.view",
  resourceCenterViewed: "hr.employee-selfservice-portal.resources.view",
  tasksViewed: "hr.employee-selfservice-portal.tasks.view",
} as const;

export const employeeSelfservicePortalAuditEventCatalog = [
  {
    action: employeeSelfservicePortalAuditActions.leaveBalancesViewed,
    summary: "Employee accessed self-service leave balances.",
  },
  {
    action: employeeSelfservicePortalAuditActions.leaveApplicationsViewed,
    summary:
      "Employee accessed self-service leave application history and approval status.",
  },
  {
    action: employeeSelfservicePortalAuditActions.profileUpdateRequestSubmitted,
    summary: "Employee submitted a self-service profile update request.",
  },
  {
    action: employeeSelfservicePortalAuditActions.profileUpdateRequestApproved,
    summary:
      "Authorized reviewer approved a self-service profile update request.",
  },
  {
    action: employeeSelfservicePortalAuditActions.profileUpdateRequestRejected,
    summary:
      "Authorized reviewer rejected a self-service profile update request.",
  },
  {
    action: employeeSelfservicePortalAuditActions.documentCatalogViewed,
    summary: "Employee accessed self-service document summaries.",
  },
  {
    action: employeeSelfservicePortalAuditActions.resourceCenterViewed,
    summary:
      "Employee accessed self-service HR resource-center items and FAQs.",
  },
  {
    action: employeeSelfservicePortalAuditActions.tasksViewed,
    summary:
      "Employee accessed self-service onboarding, offboarding, compliance, and HR tasks.",
  },
  {
    action: employeeSelfservicePortalAuditActions.requestStatusesViewed,
    summary: "Employee accessed self-service submitted request statuses.",
  },
  {
    action: employeeSelfservicePortalAuditActions.managerApprovalInboxViewed,
    summary:
      "Authorized manager accessed self-service approval inbox items for direct reports.",
  },
  {
    action: employeeSelfservicePortalAuditActions.notificationsViewed,
    summary:
      "Employee accessed self-service notifications for approvals, rejections, and pending actions.",
  },
  {
    action: employeeSelfservicePortalAuditActions.documentAcknowledgmentsViewed,
    summary: "Employee accessed self-service policy acknowledgment items.",
  },
  {
    action: employeeSelfservicePortalAuditActions.documentAcknowledged,
    summary:
      "Employee acknowledged a self-service policy or required HR notice.",
  },
] as const;
