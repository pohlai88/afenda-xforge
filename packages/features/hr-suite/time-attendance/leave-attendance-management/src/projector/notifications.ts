import type {
  LamNotificationIntent,
  LamNotificationKind,
  LamNotificationRecipientRole,
} from "../contracts/notification.contract.ts";
import { lamNotificationEventNames } from "../contracts/notification.contract.ts";
import type {
  LamAttendanceCorrection,
  LamLeaveApplication,
} from "../schema.ts";

const formatDate = (value: Date | null | undefined): string =>
  value ? value.toISOString().slice(0, 10) : "unknown date";

const leaveApplicationActionUrl = (applicationId: string): string =>
  `/hr/leave/leave-applications/${applicationId}`;

const attendanceCorrectionActionUrl = (correctionId: string): string =>
  `/hr/attendance/attendance-corrections/${correctionId}`;

const leaveRecipientRoles = (
  kind: LamNotificationKind
): readonly LamNotificationRecipientRole[] => {
  if (kind === "submitted" || kind === "overdue") {
    return ["approver"];
  }

  return ["employee"];
};

const attendanceRecipientRoles = (
  kind: LamNotificationKind
): readonly LamNotificationRecipientRole[] => {
  if (kind === "submitted" || kind === "overdue") {
    return ["approver"];
  }

  return ["employee"];
};

export const buildLamLeaveApplicationNotificationIntent = (args: {
  application: LamLeaveApplication;
  kind: LamNotificationKind;
  leaveTypeName?: string | null;
  rejectionReason?: string | null;
  returnedReason?: string | null;
  requestType?: "return" | "clarification";
}): LamNotificationIntent => {
  const { application, kind } = args;
  const companyId = application.companyId ?? "";
  const periodLabel = `${formatDate(application.startDate)} – ${formatDate(application.endDate)}`;
  const leaveTypeLabel = args.leaveTypeName?.trim() || "leave";
  const event = lamNotificationEventNames.leaveApplication[kind];
  const isClarification =
    kind === "returned" && args.requestType === "clarification";

  const titles: Record<LamNotificationKind, string> = {
    submitted: "Leave Application Submitted",
    approved: "Leave Application Approved",
    rejected: "Leave Application Rejected",
    cancelled: "Leave Application Cancelled",
    returned: isClarification
      ? "Leave Application Clarification Requested"
      : "Leave Application Returned",
    overdue: "Leave Application Approval Overdue",
  };

  const rejectionReason =
    args.rejectionReason ?? application.rejectionReason ?? null;

  const bodies: Record<LamNotificationKind, string> = {
    submitted: `A ${leaveTypeLabel} request for ${application.totalDays} day(s) (${periodLabel}) requires approval.`,
    approved: `Your ${leaveTypeLabel} request for ${application.totalDays} day(s) (${periodLabel}) has been approved.`,
    rejected: `Your ${leaveTypeLabel} request for ${application.totalDays} day(s) was rejected${rejectionReason ? `: ${rejectionReason}` : "."}`,
    cancelled: `The ${leaveTypeLabel} request for ${application.totalDays} day(s) (${periodLabel}) was cancelled.`,
    returned: isClarification
      ? `Your ${leaveTypeLabel} request needs clarification${args.returnedReason ? `: ${args.returnedReason}` : "."}`
      : `Your ${leaveTypeLabel} request was returned for correction${args.returnedReason ? `: ${args.returnedReason}` : "."}`,
    overdue: `The ${leaveTypeLabel} request for ${application.totalDays} day(s) (${periodLabel}) is overdue for approval.`,
  };

  const priorities: Record<
    LamNotificationKind,
    LamNotificationIntent["priority"]
  > = {
    submitted: "action",
    approved: "success",
    rejected: "warning",
    cancelled: "info",
    returned: "warning",
    overdue: "warning",
  };

  return {
    event,
    kind,
    subjectType: "leave_application",
    subjectId: application.id,
    employeeId: application.employeeId,
    companyId,
    title: titles[kind],
    body: bodies[kind],
    priority: priorities[kind],
    actionUrl: leaveApplicationActionUrl(application.id),
    recipientRoles: leaveRecipientRoles(kind),
    metadata: {
      leaveTypeId: application.leaveTypeId,
      leaveTypeName: args.leaveTypeName ?? undefined,
      startDate: application.startDate.toISOString(),
      endDate: application.endDate.toISOString(),
      totalDays: application.totalDays,
      status: application.status,
      requestType: args.requestType,
    },
  };
};

export const buildLamAttendanceCorrectionNotificationIntent = (args: {
  correction: LamAttendanceCorrection;
  kind: Exclude<LamNotificationKind, "cancelled" | "returned">;
  rejectionReason?: string | null;
}): LamNotificationIntent => {
  const { correction, kind } = args;
  const companyId = correction.companyId ?? "";
  const event =
    kind === "overdue"
      ? lamNotificationEventNames.attendanceCorrection.overdue
      : lamNotificationEventNames.attendanceCorrection[kind];

  const titles: Record<
    Exclude<LamNotificationKind, "cancelled" | "returned">,
    string
  > = {
    submitted: "Attendance Correction Submitted",
    approved: "Attendance Correction Approved",
    rejected: "Attendance Correction Rejected",
    overdue: "Attendance Correction Approval Overdue",
  };

  const bodies: Record<
    Exclude<LamNotificationKind, "cancelled" | "returned">,
    string
  > = {
    submitted: `An attendance correction for ${correction.exceptionType} requires approval.`,
    approved: `Your attendance correction for ${correction.exceptionType} was approved.`,
    rejected: `Your attendance correction for ${correction.exceptionType} was rejected${args.rejectionReason ? `: ${args.rejectionReason}` : "."}`,
    overdue: `The attendance correction for ${correction.exceptionType} is overdue for approval.`,
  };

  const priorities: Record<
    Exclude<LamNotificationKind, "cancelled" | "returned">,
    LamNotificationIntent["priority"]
  > = {
    submitted: "action",
    approved: "success",
    rejected: "warning",
    overdue: "warning",
  };

  return {
    event,
    kind,
    subjectType: "attendance_correction",
    subjectId: correction.id,
    employeeId: correction.employeeId,
    companyId,
    title: titles[kind],
    body: bodies[kind],
    priority: priorities[kind],
    actionUrl: attendanceCorrectionActionUrl(correction.id),
    recipientRoles: attendanceRecipientRoles(kind),
    metadata: {
      attendanceRecordId: correction.attendanceRecordId,
      exceptionType: correction.exceptionType,
      status: correction.status,
    },
  };
};

export const resolveLamNotificationRecipientUserIds = (
  intent: LamNotificationIntent,
  recipients: {
    employeeUserId?: string;
    approverUserIds?: readonly string[];
  }
): string[] => {
  const userIds = new Set<string>();

  for (const role of intent.recipientRoles) {
    if (role === "employee" && recipients.employeeUserId) {
      userIds.add(recipients.employeeUserId);
    }

    if (role === "approver") {
      for (const approverUserId of recipients.approverUserIds ?? []) {
        if (approverUserId.trim()) {
          userIds.add(approverUserId.trim());
        }
      }
    }
  }

  return [...userIds];
};
