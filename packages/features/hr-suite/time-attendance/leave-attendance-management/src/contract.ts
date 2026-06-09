export type LeaveAttendanceManagementStatus = "draft" | "active" | "archived";

export type LeaveAttendanceManagementRecord = {
  id: string;
  name: string;
  status: LeaveAttendanceManagementStatus;
};

export type ListLeaveAttendanceManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateLeaveAttendanceManagementInput = {
  name: string;
};

export type UpdateLeaveAttendanceManagementInput = {
  id: string;
  name?: string;
  status?: LeaveAttendanceManagementStatus;
};

export const hrTimeLamReadPermission = {
  module: "hr",
  object: "leave",
  function: "read",
} as const;

export const hrTimeLamWritePermission = {
  module: "hr",
  object: "leave",
  function: "update",
} as const;

export const hrTimeLamAttendanceReadPermission = {
  module: "hr",
  object: "attendance",
  function: "read",
} as const;

export const hrTimeLamAttendanceWritePermission = {
  module: "hr",
  object: "attendance",
  function: "update",
} as const;

export const hrLamRoutePaths = {
  hub: "/hr/leave-attendance",
  leave: "/hr/leave",
  attendance: "/hr/attendance",
} as const;

export type HrLamRoutePath =
  (typeof hrLamRoutePaths)[keyof typeof hrLamRoutePaths];

export const hrTimeLamAuditActions = {
  attendanceDay: {
    upserted: "hr.lam.attendance_day.upserted",
  },
  leaveApplication: {
    submitted: "hr.lam.leave_application.submitted",
  },
  leaveTypeConfig: {
    upserted: "hr.lam.leave_type_config.upserted",
  },
  entitlementRule: {
    created: "hr.lam.entitlement_rule.created",
  },
} as const;

export type HrTimeLamAuditAction =
  | (typeof hrTimeLamAuditActions)["attendanceDay"][keyof (typeof hrTimeLamAuditActions)["attendanceDay"]]
  | (typeof hrTimeLamAuditActions)["leaveApplication"][keyof (typeof hrTimeLamAuditActions)["leaveApplication"]]
  | (typeof hrTimeLamAuditActions)["leaveTypeConfig"][keyof (typeof hrTimeLamAuditActions)["leaveTypeConfig"]]
  | (typeof hrTimeLamAuditActions)["entitlementRule"][keyof (typeof hrTimeLamAuditActions)["entitlementRule"]];

export const hrTimeAttendanceLamAuditActions = {
  leave: {
    medicalCertificateLinked: "hr.lam.leave.medical_certificate.link",
    submitted: "hr.lam.leave.submit",
    approved: "hr.lam.leave.approve",
    rejected: "hr.lam.leave.reject",
    cancelled: "hr.lam.leave.cancel",
    returned: "hr.lam.leave.return",
  },
  attendance: {
    dayRegenerated: "hr.lam.attendance.day.regenerate",
    exceptionDetected: "hr.lam.attendance.exception.detect",
    correctionSubmitted: "hr.lam.attendance.correction.submit",
    correctionApproved: "hr.lam.attendance.correction.approve",
    correctionRejected: "hr.lam.attendance.correction.reject",
  },
  payroll: {
    referenceExported: "hr.lam.payroll.reference.export",
  },
  notification: {
    enqueued: "hr.lam.notification.enqueue",
  },
  reports: {
    exported: "hr.lam.report.export",
  },
} as const;

export type HrTimeAttendanceLamAuditAction =
  (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions][keyof (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions]];

export const leaveAttendanceManagementRouteContracts = [] as const;

export const leaveAttendanceManagementFeatureId =
  "hr-suite.time-attendance.leave-attendance-management" as const;
