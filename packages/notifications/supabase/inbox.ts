import "server-only";

import type { NotificationInboxEntry as NotificationInboxRow } from "@repo/database";
import { database, notificationInbox, timeDatabaseQuery } from "@repo/database";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type {
  NotificationDispatchRequest,
  NotificationInboxEntry,
  NotificationInboxListResult,
  PersistAndDispatchNotificationsResult,
} from "../shared/types.ts";
import { invokeSupabaseNotificationsDispatch } from "./server.ts";
import { createRecipientNotificationsTopic } from "./topics.ts";

const toNotificationInboxEntry = (
  row: NotificationInboxRow
): NotificationInboxEntry => ({
  archivedAt: row.archivedAt?.toISOString() ?? null,
  companyId: row.companyId ?? null,
  createdAt: row.createdAt.toISOString(),
  dispatchedAt: row.dispatchedAt.toISOString(),
  event: row.event,
  id: row.id,
  notificationId: row.notificationId,
  payload: row.payload,
  readAt: row.readAt?.toISOString() ?? null,
  seenAt: row.seenAt?.toISOString() ?? null,
  tenantId: row.tenantId,
  topic: row.topic,
  updatedAt: row.updatedAt.toISOString(),
  userId: row.userId,
});

const buildCompanyScope = ({
  companyId,
  includeCrossCompany,
}: {
  readonly companyId?: string | null;
  readonly includeCrossCompany?: boolean;
}): SQL | undefined => {
  if (includeCrossCompany) {
    return;
  }

  if (companyId) {
    return eq(notificationInbox.companyId, companyId);
  }

  return isNull(notificationInbox.companyId);
};

export const persistNotificationInboxEntries = async <
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  request: NotificationDispatchRequest<TPayload>
): Promise<readonly NotificationInboxEntry[]> => {
  const notificationId = request.notificationId ?? crypto.randomUUID();
  const dispatchedAt = new Date();
  const rows = request.recipients.map((recipient) => ({
    notificationId,
    tenantId: recipient.tenantId,
    companyId: recipient.companyId ?? null,
    userId: recipient.userId,
    event: request.event,
    topic: createRecipientNotificationsTopic(recipient),
    payload: request.payload,
    dispatchedAt,
    createdAt: dispatchedAt,
    updatedAt: dispatchedAt,
  }));

  const inserted = await timeDatabaseQuery(
    () => database.insert(notificationInbox).values(rows).returning(),
    {
      operation: "insert",
      resource: "notification_inbox",
    }
  );

  return inserted.map(toNotificationInboxEntry);
};

export const persistAndDispatchNotifications = async <
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  request: NotificationDispatchRequest<TPayload>
): Promise<PersistAndDispatchNotificationsResult> => {
  const items = await persistNotificationInboxEntries(request);
  const notificationId =
    items[0]?.notificationId ?? request.notificationId ?? crypto.randomUUID();
  const dispatch = await invokeSupabaseNotificationsDispatch({
    ...request,
    notificationId,
  });

  return {
    dispatch,
    items,
    notificationId,
  };
};

export const listNotificationInbox = async ({
  companyId,
  includeArchived = false,
  includeCrossCompany = true,
  limit = 20,
  tenantId,
  userId,
}: {
  readonly companyId?: string | null;
  readonly includeArchived?: boolean;
  readonly includeCrossCompany?: boolean;
  readonly limit?: number;
  readonly tenantId: string;
  readonly userId: string;
}): Promise<NotificationInboxListResult> => {
  const filters = [
    eq(notificationInbox.tenantId, tenantId),
    eq(notificationInbox.userId, userId),
  ];
  const companyScope = buildCompanyScope({ companyId, includeCrossCompany });

  if (companyScope) {
    filters.push(companyScope);
  }

  if (!includeArchived) {
    filters.push(isNull(notificationInbox.archivedAt));
  }

  const where = and(...filters);

  const [items, unreadCountRow] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select()
          .from(notificationInbox)
          .where(where)
          .orderBy(
            desc(notificationInbox.dispatchedAt),
            desc(notificationInbox.id)
          )
          .limit(limit),
      {
        operation: "select",
        resource: "notification_inbox",
      }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select({
            count: sql<number>`count(*)`,
          })
          .from(notificationInbox)
          .where(and(where, isNull(notificationInbox.readAt))),
      {
        operation: "count",
        resource: "notification_inbox",
      }
    ),
  ]);

  return {
    items: items.map(toNotificationInboxEntry),
    unreadCount: Number(unreadCountRow[0]?.count ?? 0),
  };
};

export const markNotificationsSeen = async ({
  ids,
  tenantId,
  userId,
}: {
  readonly ids: readonly string[];
  readonly tenantId: string;
  readonly userId: string;
}): Promise<readonly NotificationInboxEntry[]> => {
  if (ids.length === 0) {
    return [];
  }

  const now = new Date();
  const updated = await timeDatabaseQuery(
    () =>
      database
        .update(notificationInbox)
        .set({
          seenAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(notificationInbox.tenantId, tenantId),
            eq(notificationInbox.userId, userId),
            inArray(notificationInbox.id, [...ids])
          )
        )
        .returning(),
    {
      operation: "update",
      resource: "notification_inbox",
    }
  );

  return updated.map(toNotificationInboxEntry);
};

export const markNotificationRead = async ({
  id,
  tenantId,
  userId,
}: {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
}): Promise<NotificationInboxEntry | null> => {
  const now = new Date();
  const updated = await timeDatabaseQuery(
    () =>
      database
        .update(notificationInbox)
        .set({
          readAt: now,
          seenAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(notificationInbox.id, id),
            eq(notificationInbox.tenantId, tenantId),
            eq(notificationInbox.userId, userId)
          )
        )
        .returning(),
    {
      operation: "update",
      resource: "notification_inbox",
    }
  );

  return updated[0] ? toNotificationInboxEntry(updated[0]) : null;
};

export const markAllNotificationsRead = async ({
  companyId,
  includeCrossCompany = true,
  tenantId,
  userId,
}: {
  readonly companyId?: string | null;
  readonly includeCrossCompany?: boolean;
  readonly tenantId: string;
  readonly userId: string;
}): Promise<number> => {
  const companyScope = buildCompanyScope({ companyId, includeCrossCompany });
  const where = and(
    eq(notificationInbox.tenantId, tenantId),
    eq(notificationInbox.userId, userId),
    isNull(notificationInbox.readAt),
    companyScope
  );
  const now = new Date();
  const updated = await timeDatabaseQuery(
    () =>
      database
        .update(notificationInbox)
        .set({
          readAt: now,
          seenAt: now,
          updatedAt: now,
        })
        .where(where)
        .returning({
          id: notificationInbox.id,
        }),
    {
      operation: "update",
      resource: "notification_inbox",
    }
  );

  return updated.length;
};
