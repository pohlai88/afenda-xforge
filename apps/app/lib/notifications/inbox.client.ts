"use client";

import type { NotificationInboxListResult } from "@repo/notifications";
import { z } from "zod";

type InboxMutationAction =
  | { action: "archive-all" }
  | { action: "mark-all-read" }
  | { action: "mark-read"; id: string }
  | { action: "mark-seen"; ids: readonly string[] };

const notificationInboxEntrySchema = z
  .object({
    archivedAt: z.string().nullable(),
    companyId: z.string().nullable(),
    createdAt: z.string(),
    dispatchedAt: z.string(),
    event: z.string(),
    id: z.string().uuid(),
    notificationId: z.string(),
    payload: z.record(z.string(), z.unknown()),
    readAt: z.string().nullable(),
    seenAt: z.string().nullable(),
    tenantId: z.string(),
    topic: z.string(),
    updatedAt: z.string(),
    userId: z.string(),
  })
  .passthrough();

const notificationInboxListResultSchema = z.object({
  items: z.array(notificationInboxEntrySchema),
  unreadCount: z.number().int().nonnegative(),
});

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

  const payload: unknown = await response.json();
  const parsed = notificationInboxListResultSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("Notification inbox response was invalid");
  }

  return parsed.data;
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

export type {
  NotificationInboxEntry,
  NotificationInboxListResult,
} from "@repo/notifications";
