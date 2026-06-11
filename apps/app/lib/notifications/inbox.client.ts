import type {
  NotificationInboxEntry,
  NotificationInboxListResult,
} from "@repo/notifications";

type InboxMutationAction =
  | { action: "archive-all" }
  | { action: "mark-all-read" }
  | { action: "mark-read"; id: string }
  | { action: "mark-seen"; ids: readonly string[] };

const parseError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      error?: string | { message?: string };
    };

    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (
      payload.error &&
      typeof payload.error === "object" &&
      typeof payload.error.message === "string"
    ) {
      return payload.error.message;
    }

    return "Notification request failed";
  } catch {
    return "Notification request failed";
  }
};

export async function fetchNotificationInbox(
  limit = 30
): Promise<NotificationInboxListResult> {
  const response = await fetch(`/api/me/notifications?limit=${limit}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as NotificationInboxListResult;
}

export async function mutateNotificationInbox(
  mutation: InboxMutationAction
): Promise<void> {
  const response = await fetch("/api/me/notifications", {
    body: JSON.stringify(mutation),
    headers: { "content-type": "application/json" },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export type { NotificationInboxEntry, NotificationInboxListResult };
