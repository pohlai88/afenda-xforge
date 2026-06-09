export type OffboardingExitManagementStatus = "draft" | "active" | "archived";

export type OffboardingExitManagementRecord = {
  id: string;
  name: string;
  status: OffboardingExitManagementStatus;
};

export type ListOffboardingExitManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateOffboardingExitManagementInput = {
  name: string;
};

export type UpdateOffboardingExitManagementInput = {
  id: string;
  name?: string;
  status?: OffboardingExitManagementStatus;
};

export const hrWorkforceOffboardingReadPermission = {
  module: "hr",
  object: "offboarding",
  function: "read",
} as const;

export const hrWorkforceOffboardingWritePermission = {
  module: "hr",
  object: "offboarding",
  function: "update",
} as const;

export const hrOffboardingRoutePaths = {
  offboarding: "/hr/offboarding",
} as const;

export type HrOffboardingRoutePath =
  (typeof hrOffboardingRoutePaths)[keyof typeof hrOffboardingRoutePaths];

export const hrWorkforceOffboardingAuditActions = {
  case: {
    started: "hr.offboarding.case.start",
    completed: "hr.offboarding.case.complete",
    cancelled: "hr.offboarding.case.cancel",
  },
  clearance: {
    completed: "hr.offboarding.clearance.complete",
    waived: "hr.offboarding.clearance.waive",
  },
  approval: {
    approved: "hr.offboarding.approval.approve",
    rejected: "hr.offboarding.approval.reject",
  },
  asset: {
    updated: "hr.offboarding.asset.update",
  },
  exitInterview: {
    scheduled: "hr.offboarding.exit_interview.schedule",
    feedbackRecorded: "hr.offboarding.exit_interview.feedback",
  },
  rehire: {
    recorded: "hr.offboarding.rehire.record",
  },
  vacancy: {
    triggered: "hr.offboarding.vacancy.trigger",
  },
  document: {
    linked: "hr.offboarding.document.link",
  },
  settlement: {
    blockerAdded: "hr.offboarding.settlement.blocker_add",
    blockerResolved: "hr.offboarding.settlement.blocker_resolve",
    ready: "hr.offboarding.settlement.ready",
  },
} as const;

export type HrWorkforceOffboardingAuditAction =
  | (typeof hrWorkforceOffboardingAuditActions)["case"][keyof (typeof hrWorkforceOffboardingAuditActions)["case"]]
  | (typeof hrWorkforceOffboardingAuditActions)["clearance"][keyof (typeof hrWorkforceOffboardingAuditActions)["clearance"]]
  | (typeof hrWorkforceOffboardingAuditActions)["approval"][keyof (typeof hrWorkforceOffboardingAuditActions)["approval"]]
  | (typeof hrWorkforceOffboardingAuditActions)["asset"][keyof (typeof hrWorkforceOffboardingAuditActions)["asset"]]
  | (typeof hrWorkforceOffboardingAuditActions)["exitInterview"][keyof (typeof hrWorkforceOffboardingAuditActions)["exitInterview"]]
  | (typeof hrWorkforceOffboardingAuditActions)["rehire"][keyof (typeof hrWorkforceOffboardingAuditActions)["rehire"]]
  | (typeof hrWorkforceOffboardingAuditActions)["vacancy"][keyof (typeof hrWorkforceOffboardingAuditActions)["vacancy"]]
  | (typeof hrWorkforceOffboardingAuditActions)["document"][keyof (typeof hrWorkforceOffboardingAuditActions)["document"]]
  | (typeof hrWorkforceOffboardingAuditActions)["settlement"][keyof (typeof hrWorkforceOffboardingAuditActions)["settlement"]];

export const offboardingExitManagementRouteContracts = [] as const;

export const offboardingExitManagementFeatureId =
  "hr-suite.employee-management.offboarding-exit-management" as const;
