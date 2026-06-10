import { z } from "zod";

export const leaveAttendanceManagementAuditEvents = {
  attendanceRecordUpserted: "lam.attendance-record.upserted",
  attendanceExceptionDetected: "lam.attendance-exception.detected",
  leaveTypeUpserted: "lam.leave-type.upserted",
  leaveTypeUpdated: "lam.leave-type.updated",
  leaveEntitlementRuleCreated: "lam.leave-entitlement-rule.created",
  leaveEntitlementRuleUpdated: "lam.leave-entitlement-rule.updated",
  leaveEntitlementCalculated: "lam.leave-entitlement.calculated",
  leaveCarryForwardRuleCreated: "lam.leave-carry-forward-rule.created",
  leaveCarryForwardRuleUpdated: "lam.leave-carry-forward-rule.updated",
  leaveBalanceUpdated: "lam.leave-balance.updated",
  leaveBlackoutPeriodUpserted: "lam.leave-blackout-period.upserted",
  leaveBlackoutPeriodUpdated: "lam.leave-blackout-period.updated",
  leaveApprovalRouteCreated: "lam.leave-approval-route.created",
  leaveApprovalRouteUpdated: "lam.leave-approval-route.updated",
  leaveApplicationRouted: "lam.leave-application.routed",
  leaveDocumentReferenceCreated: "lam.leave-document.reference-created",
  leaveDocumentUploadConfirmed: "lam.leave-document.upload-confirmed",
  leaveApplicationSubmitted: "lam.leave-application.submitted",
  leaveApplicationApproved: "lam.leave-application.approved",
  leaveApplicationRejected: "lam.leave-application.rejected",
  leaveApplicationCancelled: "lam.leave-application.cancelled",
  leaveApplicationAmended: "lam.leave-application.amended",
  leaveApplicationReturned: "lam.leave-application.returned",
  attendanceCorrectionSubmitted: "lam.attendance-correction.submitted",
  attendanceCorrectionApproved: "lam.attendance-correction.approved",
  attendanceCorrectionRejected: "lam.attendance-correction.rejected",
  companyAttendanceSettingsUpdated: "lam.company-attendance-settings.updated",
  leaveMedicalCertificateLinked: "hr.lam.leave.medical_certificate.link",
  payrollReferenceExported: "lam.payroll-reference.exported",
  reportExported: "lam.report.exported",
  notificationEnqueued: "lam.notification.enqueued",
} as const;

const leaveAttendanceManagementAuditEventValues = Object.values(
  leaveAttendanceManagementAuditEvents
) as [
  LeaveAttendanceManagementAuditEvent,
  ...LeaveAttendanceManagementAuditEvent[],
];

export const leaveAttendanceManagementAuditEventSchema = z.enum(
  leaveAttendanceManagementAuditEventValues
);

export type LeaveAttendanceManagementAuditEvent =
  (typeof leaveAttendanceManagementAuditEvents)[keyof typeof leaveAttendanceManagementAuditEvents];

export const leaveAttendanceManagementAuditEventCatalog = Object.values(
  leaveAttendanceManagementAuditEvents
) as readonly LeaveAttendanceManagementAuditEvent[];

export const leaveAttendanceManagementAuditEventGroups = [
  {
    id: "attendance",
    label: "Attendance",
    events: [
      leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
      leaveAttendanceManagementAuditEvents.attendanceExceptionDetected,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionSubmitted,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionRejected,
    ],
  },
  {
    id: "leave-config",
    label: "Leave Configuration",
    events: [
      leaveAttendanceManagementAuditEvents.leaveTypeUpserted,
      leaveAttendanceManagementAuditEvents.leaveTypeUpdated,
      leaveAttendanceManagementAuditEvents.leaveEntitlementRuleCreated,
      leaveAttendanceManagementAuditEvents.leaveEntitlementRuleUpdated,
      leaveAttendanceManagementAuditEvents.leaveEntitlementCalculated,
      leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleCreated,
      leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleUpdated,
      leaveAttendanceManagementAuditEvents.leaveBlackoutPeriodUpserted,
      leaveAttendanceManagementAuditEvents.leaveBlackoutPeriodUpdated,
      leaveAttendanceManagementAuditEvents.leaveApprovalRouteCreated,
      leaveAttendanceManagementAuditEvents.leaveApprovalRouteUpdated,
    ],
  },
  {
    id: "leave-balance",
    label: "Leave Balance",
    events: [
      leaveAttendanceManagementAuditEvents.leaveEntitlementCalculated,
      leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
    ],
  },
  {
    id: "leave-applications",
    label: "Leave Applications",
    events: [
      leaveAttendanceManagementAuditEvents.leaveDocumentReferenceCreated,
      leaveAttendanceManagementAuditEvents.leaveDocumentUploadConfirmed,
      leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted,
      leaveAttendanceManagementAuditEvents.leaveApplicationRouted,
      leaveAttendanceManagementAuditEvents.leaveApplicationApproved,
      leaveAttendanceManagementAuditEvents.leaveApplicationRejected,
      leaveAttendanceManagementAuditEvents.leaveApplicationCancelled,
      leaveAttendanceManagementAuditEvents.leaveApplicationAmended,
      leaveAttendanceManagementAuditEvents.leaveApplicationReturned,
      leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked,
    ],
  },
  {
    id: "integrations",
    label: "Integrations & Reports",
    events: [
      leaveAttendanceManagementAuditEvents.payrollReferenceExported,
      leaveAttendanceManagementAuditEvents.reportExported,
      leaveAttendanceManagementAuditEvents.notificationEnqueued,
    ],
  },
] as const;

export const leaveAttendanceManagementHighRiskAuditEvents = [
  leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
  leaveAttendanceManagementAuditEvents.leaveEntitlementCalculated,
  leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
  leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted,
  leaveAttendanceManagementAuditEvents.leaveApplicationRouted,
  leaveAttendanceManagementAuditEvents.leaveApplicationApproved,
  leaveAttendanceManagementAuditEvents.leaveApplicationRejected,
  leaveAttendanceManagementAuditEvents.leaveApplicationCancelled,
  leaveAttendanceManagementAuditEvents.leaveApplicationAmended,
  leaveAttendanceManagementAuditEvents.leaveApplicationReturned,
  leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved,
  leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked,
  leaveAttendanceManagementAuditEvents.payrollReferenceExported,
  leaveAttendanceManagementAuditEvents.reportExported,
] as const;

export const leaveAttendanceManagementAudit = {
  events: leaveAttendanceManagementAuditEventCatalog,
  eventGroups: leaveAttendanceManagementAuditEventGroups,
  highRiskEvents: leaveAttendanceManagementHighRiskAuditEvents,
} as const;

export type LeaveAttendanceManagementAudit =
  typeof leaveAttendanceManagementAudit;

export const hrTimeLamAuditActions = {
  attendanceDay: {
    upserted: leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
  },
  leaveApplication: {
    submitted: leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted,
  },
  leaveTypeConfig: {
    upserted: leaveAttendanceManagementAuditEvents.leaveTypeUpserted,
  },
  entitlementRule: {
    created: leaveAttendanceManagementAuditEvents.leaveEntitlementRuleCreated,
  },
} as const;

export const hrTimeAttendanceLamAuditActions = {
  leave: {
    medicalCertificateLinked:
      leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked,
    submitted: leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted,
    approved: leaveAttendanceManagementAuditEvents.leaveApplicationApproved,
    rejected: leaveAttendanceManagementAuditEvents.leaveApplicationRejected,
    cancelled: leaveAttendanceManagementAuditEvents.leaveApplicationCancelled,
    amended: leaveAttendanceManagementAuditEvents.leaveApplicationAmended,
    returned: leaveAttendanceManagementAuditEvents.leaveApplicationReturned,
  },
  attendance: {
    dayUpserted: leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
    exceptionDetected:
      leaveAttendanceManagementAuditEvents.attendanceExceptionDetected,
    correctionSubmitted:
      leaveAttendanceManagementAuditEvents.attendanceCorrectionSubmitted,
    correctionApproved:
      leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved,
    correctionRejected:
      leaveAttendanceManagementAuditEvents.attendanceCorrectionRejected,
  },
  payroll: {
    referenceExported:
      leaveAttendanceManagementAuditEvents.payrollReferenceExported,
  },
  notification: {
    enqueued: leaveAttendanceManagementAuditEvents.notificationEnqueued,
  },
  reports: {
    exported: leaveAttendanceManagementAuditEvents.reportExported,
  },
} as const;

export type HrTimeLamAuditAction =
  | (typeof hrTimeLamAuditActions)["attendanceDay"][keyof (typeof hrTimeLamAuditActions)["attendanceDay"]]
  | (typeof hrTimeLamAuditActions)["leaveApplication"][keyof (typeof hrTimeLamAuditActions)["leaveApplication"]]
  | (typeof hrTimeLamAuditActions)["leaveTypeConfig"][keyof (typeof hrTimeLamAuditActions)["leaveTypeConfig"]]
  | (typeof hrTimeLamAuditActions)["entitlementRule"][keyof (typeof hrTimeLamAuditActions)["entitlementRule"]];

export type HrTimeAttendanceLamAuditAction =
  (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions][keyof (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions]];
