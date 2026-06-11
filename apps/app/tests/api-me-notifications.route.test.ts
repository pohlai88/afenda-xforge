import { UnauthorizedError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireActiveTenantMembership: vi.fn(),
}));

const notificationMocks = vi.hoisted(() => ({
  archiveAllNotifications: vi.fn(),
  listNotificationInbox: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
  markNotificationsSeen: vi.fn(),
}));

vi.mock("@repo/auth/server", () => authMocks);
vi.mock("@repo/notifications", () => notificationMocks);

import { GET, PATCH } from "../app/api/me/notifications/route.ts";
import { createNotificationInboxEntry } from "./fixtures/notifications.fixture.ts";

describe("/api/me/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireActiveTenantMembership.mockResolvedValue({
      id: "membership-1",
      role: "admin",
      tenantId: "tenant-001",
      userId: "user-001",
    });
  });

  it("returns the scoped inbox for the active tenant membership", async () => {
    const inbox = {
      items: [createNotificationInboxEntry()],
      unreadCount: 1,
    };
    notificationMocks.listNotificationInbox.mockResolvedValue(inbox);

    const response = await GET(
      new Request("http://localhost/api/me/notifications?limit=15")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(inbox);
    expect(notificationMocks.listNotificationInbox).toHaveBeenCalledWith({
      limit: 15,
      tenantId: "tenant-001",
      userId: "user-001",
    });
  });

  it("marks all notifications as read", async () => {
    notificationMocks.markAllNotificationsRead.mockResolvedValue(4);

    const response = await PATCH(
      new Request("http://localhost/api/me/notifications", {
        body: JSON.stringify({ action: "mark-all-read" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ updatedCount: 4 });
  });

  it("archives all notifications", async () => {
    notificationMocks.archiveAllNotifications.mockResolvedValue(2);

    const response = await PATCH(
      new Request("http://localhost/api/me/notifications", {
        body: JSON.stringify({ action: "archive-all" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ archivedCount: 2 });
  });

  it("returns 401 when tenant membership is required", async () => {
    authMocks.requireActiveTenantMembership.mockRejectedValue(
      new UnauthorizedError()
    );

    const response = await GET(
      new Request("http://localhost/api/me/notifications?limit=15")
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBeTruthy();
    expect(notificationMocks.listNotificationInbox).not.toHaveBeenCalled();
  });

  it("rejects invalid patch payloads", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/me/notifications", {
        body: JSON.stringify({ action: "mark-read" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeTruthy();
  });
});
