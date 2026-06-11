import { describe, expect, it, vi } from "vitest";

import {
  fetchNotificationInbox,
  mutateNotificationInbox,
} from "../lib/notifications/inbox.client.ts";
import { createNotificationInboxEntry } from "./fixtures/notifications.fixture.ts";

describe("notifications inbox client", () => {
  it("loads the inbox from the me notifications API", async () => {
    const inbox = {
      items: [createNotificationInboxEntry()],
      unreadCount: 1,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => inbox,
      })
    );

    await expect(fetchNotificationInbox(20)).resolves.toEqual(inbox);
    expect(fetch).toHaveBeenCalledWith("/api/me/notifications?limit=20", {
      method: "GET",
    });

    vi.unstubAllGlobals();
  });

  it("throws API errors from inbox fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Forbidden" }),
      })
    );

    await expect(fetchNotificationInbox()).rejects.toThrow("Forbidden");

    vi.unstubAllGlobals();
  });

  it("patches inbox mutations to the me notifications API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ updatedCount: 3 }),
      })
    );

    await mutateNotificationInbox({ action: "mark-all-read" });

    expect(fetch).toHaveBeenCalledWith("/api/me/notifications", {
      body: JSON.stringify({ action: "mark-all-read" }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });

    vi.unstubAllGlobals();
  });
});
