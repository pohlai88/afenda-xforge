import { z } from "zod";
import { optionalTrimmedStringSchema, trimmedStringSchema } from "../schema.ts";

export const lamNotificationKindValues = [
  "submitted",
  "approved",
  "rejected",
  "cancelled",
  "returned",
  "overdue",
] as const;

export const lamNotificationSubjectTypeValues = [
  "leave_application",
  "attendance_correction",
] as const;

export const lamNotificationPriorityValues = [
  "action",
  "info",
  "success",
  "warning",
] as const;

export const lamNotificationRecipientRoleValues = [
  "employee",
  "approver",
] as const;

export const lamNotificationEventNames = {
  leaveApplication: {
    submitted: "lam.leave-application.submitted",
    approved: "lam.leave-application.approved",
    rejected: "lam.leave-application.rejected",
    cancelled: "lam.leave-application.cancelled",
    returned: "lam.leave-application.returned",
    overdue: "lam.leave-application.overdue",
  },
  attendanceCorrection: {
    submitted: "lam.attendance-correction.submitted",
    approved: "lam.attendance-correction.approved",
    rejected: "lam.attendance-correction.rejected",
    overdue: "lam.attendance-correction.overdue",
  },
} as const;

export type LamNotificationKind = (typeof lamNotificationKindValues)[number];
export type LamNotificationSubjectType =
  (typeof lamNotificationSubjectTypeValues)[number];
export type LamNotificationPriority =
  (typeof lamNotificationPriorityValues)[number];
export type LamNotificationRecipientRole =
  (typeof lamNotificationRecipientRoleValues)[number];

export type LamNotificationIntent = {
  readonly event: string;
  readonly kind: LamNotificationKind;
  readonly subjectType: LamNotificationSubjectType;
  readonly subjectId: string;
  readonly employeeId: string;
  readonly companyId: string;
  readonly title: string;
  readonly body: string;
  readonly priority: LamNotificationPriority;
  readonly actionUrl?: string;
  readonly recipientRoles: readonly LamNotificationRecipientRole[];
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type LamNotificationRecipients = {
  readonly employeeUserId?: string;
  readonly approverUserIds?: readonly string[];
  readonly companyId?: string;
};

export const lamNotificationRecipientsSchema = z.object({
  employeeUserId: optionalTrimmedStringSchema,
  approverUserIds: z.array(trimmedStringSchema).optional(),
});

export const recordLamNotificationEnqueuedInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  intent: z.custom<LamNotificationIntent>(),
  recipientUserIds: z.array(trimmedStringSchema).min(1),
  notificationId: optionalTrimmedStringSchema,
});

export type RecordLamNotificationEnqueuedInput = z.infer<
  typeof recordLamNotificationEnqueuedInputSchema
>;

export const listLamOverdueApprovalsQuerySchema = z.object({
  companyId: optionalTrimmedStringSchema,
  overdueAfterHours: z.coerce.number().int().positive().max(8760).optional(),
  includeAttendanceCorrections: z.coerce.boolean().optional(),
});

export type ListLamOverdueApprovalsQuery = z.infer<
  typeof listLamOverdueApprovalsQuerySchema
>;

export const processLamOverdueNotificationsInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  overdueAfterHours: z.coerce.number().int().positive().max(8760).optional(),
  includeAttendanceCorrections: z.coerce.boolean().optional(),
});

export type ProcessLamOverdueNotificationsInput = z.infer<
  typeof processLamOverdueNotificationsInputSchema
>;

export const DEFAULT_LAM_APPROVAL_OVERDUE_HOURS = 48;
