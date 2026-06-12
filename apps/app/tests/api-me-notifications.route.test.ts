import { UnauthorizedError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const executionMocks = vi.hoisted(() => ({
  executeNotificationInboxMutation: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  queryNotificationInbox: vi.fn(),
}));

vi.mock("../lib/notifications-inbox/execution.server.ts", () => executionMocks);
vi.mock("../lib/notifications-inbox/queries.server.ts", () => queryMocks);

import { GET, PATCH } from "../app/api/me/notifications/route.ts";
import { createNotificationInboxEntry } from "./fixtures/notifications.fixture.ts";

describe("/api/me/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the scoped inbox for the active tenant membership", async () => {
    const inbox = {
      items: [createNotificationInboxEntry()],
      unreadCount: 1,
    };
    queryMocks.queryNotificationInbox.mockResolvedValue(inbox);

    const response = await GET(
      new Request("http://localhost/api/me/notifications?limit=15")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(inbox);
    expect(queryMocks.queryNotificationInbox).toHaveBeenCalledWith({
      limit: 15,
      requestId: undefined,
    });
  });

  it("marks all notifications as read", async () => {
    executionMocks.executeNotificationInboxMutation.mockResolvedValue({
      updatedCount: 4,
    });

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
    expect(executionMocks.executeNotificationInboxMutation).toHaveBeenCalledWith(
      { action: "mark-all-read" },
      { requestId: undefined }
    );
  });

  it("marks a single notification as read", async () => {
    const item = createNotificationInboxEntry({ readAt: "2026-06-12T00:00:00.000Z" });
    executionMocks.executeNotificationInboxMutation.mockResolvedValue({ item });

    const response = await PATCH(
      new Request("http://localhost/api/me/notifications", {
        body: JSON.stringify({
          action: "mark-read",
          id: item.id,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ item });
  });

  it("marks notifications as seen", async () => {
    const items = [createNotificationInboxEntry()];
    executionMocks.executeNotificationInboxMutation.mockResolvedValue({ items });

    const response = await PATCH(
      new Request("http://localhost/api/me/notifications", {
        body: JSON.stringify({
          action: "mark-seen",
          ids: [items[0].id],
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ items });
  });

  it("returns 401 when inbox query auth fails", async () => {
    queryMocks.queryNotificationInbox.mockRejectedValue(
      new UnauthorizedError("Authentication is required")
    );

    const response = await GET(
      new Request("http://localhost/api/me/notifications")
    );

    expect(response.status).toBe(401);
  });
});
