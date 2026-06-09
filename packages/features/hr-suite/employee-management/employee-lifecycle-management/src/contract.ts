export type EmployeeLifecycleManagementStatus = "draft" | "active" | "archived";

export type EmployeeLifecycleManagementRecord = {
  id: string;
  name: string;
  status: EmployeeLifecycleManagementStatus;
};

export type ListEmployeeLifecycleManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateEmployeeLifecycleManagementInput = {
  name: string;
};

export type UpdateEmployeeLifecycleManagementInput = {
  id: string;
  name?: string;
  status?: EmployeeLifecycleManagementStatus;
};

export const hrWorkforceLifecycleReadPermission = {
  module: "hr",
  object: "lifecycle",
  function: "read",
} as const;

export const hrWorkforceLifecycleWritePermission = {
  module: "hr",
  object: "lifecycle",
  function: "write",
} as const;

export const hrLifecycleRoutePaths = {
  hub: "/hr",
  lifecycle: "/hr/lifecycle",
} as const;

export type HrLifecycleRoutePath =
  (typeof hrLifecycleRoutePaths)[keyof typeof hrLifecycleRoutePaths];

export const hrWorkforceLifecycleAuditActions = {
  employmentStatus: {
    changed: "hr.lifecycle.employment_status.change",
    scheduled: "hr.lifecycle.employment_status.schedule",
  },
  probation: {
    outcomeRecorded: "hr.lifecycle.probation.outcome",
    extended: "hr.lifecycle.probation.extend",
  },
  confirmation: {
    applied: "hr.lifecycle.confirmation.apply",
  },
  movement: {
    recorded: "hr.lifecycle.movement.record",
  },
  contract: {
    renewed: "hr.lifecycle.contract.renew",
  },
  transition: {
    cancelled: "hr.lifecycle.transition.cancel",
    applied: "hr.lifecycle.transition.apply",
  },
  onboarding: {
    caseStarted: "hr.lifecycle.onboarding.case_start",
  },
  offboarding: {
    caseStarted: "hr.lifecycle.offboarding.case_start",
  },
  exit: {
    noticePeriodStarted: "hr.lifecycle.exit.notice_period",
  },
} as const;

export type HrWorkforceLifecycleAuditAction =
  | (typeof hrWorkforceLifecycleAuditActions)["employmentStatus"][keyof (typeof hrWorkforceLifecycleAuditActions)["employmentStatus"]]
  | (typeof hrWorkforceLifecycleAuditActions)["probation"][keyof (typeof hrWorkforceLifecycleAuditActions)["probation"]]
  | (typeof hrWorkforceLifecycleAuditActions)["confirmation"][keyof (typeof hrWorkforceLifecycleAuditActions)["confirmation"]]
  | (typeof hrWorkforceLifecycleAuditActions)["movement"][keyof (typeof hrWorkforceLifecycleAuditActions)["movement"]]
  | (typeof hrWorkforceLifecycleAuditActions)["contract"][keyof (typeof hrWorkforceLifecycleAuditActions)["contract"]]
  | (typeof hrWorkforceLifecycleAuditActions)["transition"][keyof (typeof hrWorkforceLifecycleAuditActions)["transition"]]
  | (typeof hrWorkforceLifecycleAuditActions)["onboarding"][keyof (typeof hrWorkforceLifecycleAuditActions)["onboarding"]]
  | (typeof hrWorkforceLifecycleAuditActions)["offboarding"][keyof (typeof hrWorkforceLifecycleAuditActions)["offboarding"]]
  | (typeof hrWorkforceLifecycleAuditActions)["exit"][keyof (typeof hrWorkforceLifecycleAuditActions)["exit"]];

export const employeeLifecycleManagementRouteContracts = [] as const;

export const employeeLifecycleManagementFeatureId =
  "hr-suite.employee-management.employee-lifecycle-management" as const;
