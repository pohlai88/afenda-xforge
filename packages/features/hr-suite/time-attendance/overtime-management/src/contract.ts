export type OvertimeManagementStatus = "draft" | "active" | "archived";

export type OvertimeManagementRecord = {
  id: string;
  name: string;
  status: OvertimeManagementStatus;
};

export type ListOvertimeManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateOvertimeManagementInput = {
  name: string;
};

export type UpdateOvertimeManagementInput = {
  id: string;
  name?: string;
  status?: OvertimeManagementStatus;
};

export const hrTimeOtmReadPermission = {
  module: "hr",
  object: "overtime",
  function: "read",
} as const;

export const hrTimeOtmWritePermission = {
  module: "hr",
  object: "overtime",
  function: "update",
} as const;

export const hrTimeOtmRoutePaths = {
  hub: "/apps/hrm/overtime",
} as const;

export type HrTimeOtmRoutePath =
  (typeof hrTimeOtmRoutePaths)[keyof typeof hrTimeOtmRoutePaths];

export const hrTimeOtmAuditActions = {
  request: {
    create: "erp.hrm.overtime.request.create",
    draftSave: "erp.hrm.overtime.request.draft_save",
    submit: "erp.hrm.overtime.request.submit",
    cancel: "erp.hrm.overtime.request.cancel",
    approve: "erp.hrm.overtime.request.approve",
    reject: "erp.hrm.overtime.request.reject",
    return: "erp.hrm.overtime.request.return",
    adjust: "erp.hrm.overtime.request.adjust",
  },
  eligibility: {
    validate: "erp.hrm.overtime.eligibility.validate",
  },
  exception: {
    approve: "erp.hrm.overtime.exception.approve",
    reject: "erp.hrm.overtime.exception.reject",
  },
  calculation: {
    apply: "erp.hrm.overtime.calculation.apply",
  },
  compensatory: {
    create: "erp.hrm.overtime.compensatory_leave.create",
  },
  payroll: {
    export: "erp.hrm.overtime.payroll.export",
    ready: "erp.hrm.overtime.payroll.ready",
    paid: "erp.hrm.overtime.payroll.paid",
  },
} as const;

export const HRM_OTM_AUDIT: typeof hrTimeOtmAuditActions =
  hrTimeOtmAuditActions;

export const overtimeManagementRouteContracts = [] as const;

export const overtimeManagementFeatureId =
  "hr-suite.time-attendance.overtime-management" as const;
