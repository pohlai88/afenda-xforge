import type {
  NotificationAudience,
  NotificationDispatchRequest,
} from "../shared/types.ts";

const assertNonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Notification dispatch ${label} is required.`);
  }

  return value;
};

const createRecipientKey = ({
  companyId,
  tenantId,
  userId,
}: NotificationAudience): string =>
  JSON.stringify([tenantId, companyId ?? null, userId]);

const normalizeRecipient = (
  recipient: NotificationAudience
): NotificationAudience => {
  let companyId: string | null | undefined = recipient.companyId;

  if (companyId !== undefined && companyId !== null) {
    companyId = assertNonEmptyString(companyId, "recipient companyId");
  }

  return {
    companyId,
    tenantId: assertNonEmptyString(recipient.tenantId, "recipient tenantId"),
    userId: assertNonEmptyString(recipient.userId, "recipient userId"),
  };
};

export const normalizeNotificationDispatchRequest = <
  TPayload extends Record<string, unknown>,
>(
  request: NotificationDispatchRequest<TPayload>
): NotificationDispatchRequest<TPayload> => {
  const event = assertNonEmptyString(request.event, "event");
  const notificationId =
    request.notificationId === undefined
      ? undefined
      : assertNonEmptyString(request.notificationId, "notificationId");

  if (request.recipients.length === 0) {
    throw new Error("Notification dispatch recipients cannot be empty.");
  }

  const recipients: NotificationAudience[] = [];
  const seenRecipients = new Set<string>();

  for (const recipient of request.recipients) {
    const normalizedRecipient = normalizeRecipient(recipient);
    const recipientKey = createRecipientKey(normalizedRecipient);

    if (seenRecipients.has(recipientKey)) {
      continue;
    }

    seenRecipients.add(recipientKey);
    recipients.push(normalizedRecipient);
  }

  return {
    ...request,
    event,
    notificationId,
    recipients,
  };
};
