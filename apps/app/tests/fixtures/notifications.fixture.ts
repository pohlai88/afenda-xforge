import type { NotificationInboxEntry } from "@repo/notifications";

export const createNotificationInboxEntry = (
  overrides: Partial<NotificationInboxEntry> = {}
): NotificationInboxEntry => ({
  archivedAt: null,
  companyId: null,
  createdAt: "2026-06-01T12:00:00.000Z",
  dispatchedAt: "2026-06-01T12:00:00.000Z",
  event: "customer.created",
  id: "11111111-1111-4111-8111-111111111111",
  notificationId: "22222222-2222-4222-8222-222222222222",
  payload: {
    body: "Acme Ops was created",
    tab: "inbox",
    title: "New customer",
  },
  readAt: null,
  seenAt: null,
  tenantId: "tenant-001",
  topic: "xforge:notifications:tenant:tenant-001:user:user-001",
  updatedAt: "2026-06-01T12:00:00.000Z",
  userId: "user-001",
  ...overrides,
});
