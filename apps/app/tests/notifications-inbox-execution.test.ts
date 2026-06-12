import { beforeEach, describe, expect, it, vi } from "vitest";

const auditMocks = vi.hoisted(() => ({
  writeAuditEvent: vi.fn().mockResolvedValue({ id: "audit-1" }),
  writeAuditEventInTransaction: vi.fn().mockResolvedValue({ id: "audit-1" }),
}));

const notificationMocks = vi.hoisted(() => ({
  archiveAllNotifications: vi.fn(),
  listNotificationInbox: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
  markNotificationsSeen: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireActiveTenantMembership: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));

const transactionMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@repo/audit", () => auditMocks);
vi.mock("@repo/permissions", () => ({
  requirePermission: permissionMocks.requirePermission,
}));
vi.mock("@repo/auth/server", () => authMocks);
vi.mock("@repo/database", () => ({
  database: {
    transaction: transactionMocks.transaction,
  },
}));
vi.mock("@repo/notifications", () => notificationMocks);

import { executeNotificationInboxMutation } from "../lib/notifications-inbox/execution.server.ts";
import { queryNotificationInbox } from "../lib/notifications-inbox/queries.server.ts";

describe("notification inbox execution pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireActiveTenantMembership.mockResolvedValue({
      id: "membership-1",
      role: "admin",
      tenantId: "tenant-001",
      userId: "user-001",
    });
    transactionMocks.transaction.mockImplementation(
      async (run: (tx: unknown) => Promise<unknown>) => run({})
    );
  });

  it("audits inbox reads", async () => {
    notificationMocks.listNotificationInbox.mockResolvedValue({
      items: [],
      unreadCount: 0,
    });

    await queryNotificationInbox({ requestId: "req-read-1" });

    expect(auditMocks.writeAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "workspace.notifications.read",
        actorId: "user-001",
        requestId: "req-read-1",
        route: "/api/me/notifications",
        targetType: "user-notification-inbox",
        tenantId: "tenant-001",
      })
    );
  });

  it("audits mark-all-read mutations inside the execution transaction", async () => {
    notificationMocks.markAllNotificationsRead.mockResolvedValue(3);

    const result = await executeNotificationInboxMutation(
      { action: "mark-all-read" },
      { requestId: "req-mut-1" }
    );

    expect(result).toEqual({ updatedCount: 3 });
    expect(notificationMocks.markAllNotificationsRead).toHaveBeenCalledWith(
      expect.objectContaining({
        db: expect.anything(),
        tenantId: "tenant-001",
        userId: "user-001",
      })
    );
    expect(auditMocks.writeAuditEventInTransaction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "workspace.notifications.mark-all-read",
        actorId: "user-001",
        requestId: "req-mut-1",
        route: "/api/me/notifications",
        targetType: "user-notification-inbox",
        tenantId: "tenant-001",
      })
    );
  });
});
