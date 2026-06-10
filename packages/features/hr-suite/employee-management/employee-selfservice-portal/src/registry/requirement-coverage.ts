export const employeeSelfservicePortalRequirementCoverage = {
  "HRM-ESS-001": {
    description:
      "System shall allow employees to securely access their own self-service portal.",
    evidence: [
      "src/policy.ts",
      "src/queries/profile.query.ts",
      "src/queries.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/_lib/context.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts",
      "test/ess-baseline.test.ts",
      "test/profile-read.test.ts",
      "packages/permissions/catalog.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-002": {
    description:
      "System shall display employee profile information from Employee Records Management.",
    evidence: [
      "src/queries/profile.query.ts",
      "src/projector/profile.ts",
      "../employee-records-management/src/detail-page-model.server.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts",
      "test/profile-read.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-003": {
    description:
      "System shall allow employees to request updates to permitted personal information.",
    evidence: [
      "src/schema.ts",
      "src/actions.ts",
      "src/queries/profile-update-requests.query.ts",
      "src/projector/profile-update-request.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/route.ts",
      "test/profile-update-request.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-004": {
    description:
      "System shall route sensitive profile update requests for HR approval before updating the master record.",
    evidence: [
      "src/schema.ts",
      "src/actions.ts",
      "src/policy.ts",
      "src/queries/profile-update-requests.query.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/approve/route.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/reject/route.ts",
      "test/profile-update-request.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-005": {
    description: "System shall allow employees to view leave balances.",
    evidence: [
      "src/schema.ts",
      "src/projector/leave-balance.ts",
      "src/queries/leave-balances.query.ts",
      "../time-attendance/leave-attendance-management/src/queries.ts",
      "../time-attendance/leave-attendance-management/src/repository.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/leave/balances/route.ts",
      "test/leave-selfservice.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-leave-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-008": {
    description:
      "System shall allow employees to view leave application history and approval status.",
    evidence: [
      "src/schema.ts",
      "src/projector/leave-application.ts",
      "src/queries/leave-applications.query.ts",
      "../time-attendance/leave-attendance-management/src/queries.ts",
      "../time-attendance/leave-attendance-management/src/repository.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/leave/applications/route.ts",
      "test/leave-selfservice.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-leave-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-015": {
    description:
      "System shall allow employees to access HR policies, handbooks, forms, and FAQs.",
    evidence: [
      "src/schema.ts",
      "src/contract.ts",
      "src/projector/resource.ts",
      "src/queries/resources.query.ts",
      "src/server.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/resources/route.ts",
      "test/resources-acknowledgments.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-016": {
    description:
      "System shall allow employees to acknowledge policies and required HR notices.",
    evidence: [
      "src/registry/audit.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/documents/acknowledgments/route.ts",
      "../documents-management/src/registration.ts",
      "../documents-management/src/queries.ts",
      "test/resources-acknowledgments.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-017": {
    description:
      "System shall display assigned onboarding, offboarding, compliance, or HR tasks.",
    evidence: [
      "src/schema.ts",
      "src/projector/task.ts",
      "src/queries/tasks.query.ts",
      "src/server.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/tasks/route.ts",
      "test/tasks-notifications.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-workflow-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-018": {
    description:
      "System shall allow employees to track the status of submitted requests.",
    evidence: [
      "src/schema.ts",
      "src/projector/request-status.ts",
      "src/queries/request-status.query.ts",
      "src/queries/profile-update-requests.query.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/request-status/route.ts",
      "test/tasks-notifications.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-workflow-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-019": {
    description:
      "System shall notify employees of approvals, rejections, pending actions, and required tasks.",
    evidence: [
      "src/schema.ts",
      "src/projector/notification.ts",
      "src/queries/notifications.query.ts",
      "src/registry/audit.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/notifications/route.ts",
      "test/tasks-notifications.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-workflow-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-020": {
    description:
      "System shall provide managers with approval inbox access for employee requests where applicable.",
    evidence: [
      "src/schema.ts",
      "src/policy.ts",
      "src/projector/approval-inbox.ts",
      "src/queries/manager-approval-inbox.query.ts",
      "src/actions.ts",
      "src/registry/audit.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/approval-inbox/route.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/approve/route.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/reject/route.ts",
      "test/manager-approval-inbox.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-manager-routes.test.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-021": {
    description:
      "System shall restrict employees to their own HR records unless manager permissions apply.",
    evidence: [
      "src/policy.ts",
      "src/queries.ts",
      "src/queries/profile.query.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/_lib/context.ts",
      "test/ess-baseline.test.ts",
      "test/profile-read.test.ts",
      "packages/permissions/catalog.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-022": {
    description:
      "System shall mask sensitive information based on user role and access rights.",
    evidence: [
      "src/queries/profile.query.ts",
      "src/projector/profile.ts",
      "../employee-records-management/src/projector/record-detail.ts",
      "../employee-records-management/src/sensitive-access.shared.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/_lib/context.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts",
      "test/profile-read.test.ts",
      "packages/permissions/catalog.ts",
    ],
    status: "Implemented",
  },
  "HRM-ESS-023": {
    description:
      "System shall maintain audit trail for all self-service submissions, approvals, rejections, and document access.",
    evidence: [
      "src/audit.ts",
      "src/repository.ts",
      "src/queries/audit.query.ts",
      "src/registry/audit.ts",
      "src/actions.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/audit-trail/route.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/documents/route.ts",
      "apps/api/app/api/hr/employee-selfservice-portal/documents/acknowledgments/route.ts",
      "test/audit-trail.test.ts",
      "../../../../../apps/api/test/hr-employee-selfservice-routes.test.ts",
    ],
    status: "Implemented",
  },
} as const;

export type EmployeeSelfservicePortalRequirementCoverage =
  typeof employeeSelfservicePortalRequirementCoverage;
