import type {
  LamNotificationIntent,
  LamNotificationRecipients,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  createNotificationDispatchRequest,
  defineNotificationTemplate,
  persistAndDispatchNotifications,
} from "@repo/notifications";

const lamNotificationTemplate =
  defineNotificationTemplate<LamNotificationIntent>({
    event: "lam.notification",
    build: (input) => ({
      priority: input.priority,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    }),
  });

const parseCommaSeparatedIds = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

export const parseLamNotificationRecipients = (
  request: Request,
  body?: Record<string, unknown>
): LamNotificationRecipients & { tenantId?: string; companyId?: string } => {
  const notification = body?.notification as
    | {
        employeeUserId?: string;
        approverUserIds?: string[];
      }
    | undefined;

  return {
    tenantId: request.headers.get("x-tenant-id")?.trim() || undefined,
    companyId: request.headers.get("x-company-id")?.trim() || undefined,
    employeeUserId:
      request.headers.get("x-lam-employee-user-id")?.trim() ||
      notification?.employeeUserId,
    approverUserIds:
      parseCommaSeparatedIds(
        request.headers.get("x-lam-approver-user-ids") ?? undefined
      ).length > 0
        ? parseCommaSeparatedIds(
            request.headers.get("x-lam-approver-user-ids") ?? undefined
          )
        : notification?.approverUserIds,
  };
};

export const dispatchLamNotificationIntent = async (args: {
  intent: LamNotificationIntent;
  recipients: LamNotificationRecipients & {
    tenantId?: string;
    companyId?: string;
  };
  resolveRecipientUserIds: (
    intent: LamNotificationIntent,
    recipients: LamNotificationRecipients
  ) => string[];
  recordAudit?: (args: {
    notificationId: string;
    recipientUserIds: string[];
  }) => Promise<{ ok: boolean }>;
}): Promise<{ dispatched: boolean; notificationId?: string }> => {
  const recipientUserIds = args.resolveRecipientUserIds(
    args.intent,
    args.recipients
  );

  if (!args.recipients.tenantId || recipientUserIds.length === 0) {
    return { dispatched: false };
  }

  const tenantId = args.recipients.tenantId;
  const notificationId = crypto.randomUUID();
  const dispatchRequest = createNotificationDispatchRequest({
    notificationId,
    template: {
      ...lamNotificationTemplate,
      event: args.intent.event,
    },
    input: args.intent,
    recipients: recipientUserIds.map((userId) => ({
      tenantId,
      companyId: args.recipients.companyId ?? args.intent.companyId,
      userId,
    })),
  });

  await persistAndDispatchNotifications(dispatchRequest);

  if (args.recordAudit) {
    await args.recordAudit({ notificationId, recipientUserIds });
  }

  return { dispatched: true, notificationId };
};
