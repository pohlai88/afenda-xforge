import { describe, expect, it } from "vitest";

import {
  countUnreadForTab,
  filterNotificationsByTab,
  resolveNotificationEmptyStateCopy,
  toNotificationListItemView,
} from "../app/_components/workspace/app-nav-topbar-notifications.utils.ts";
import { createNotificationInboxEntry } from "./fixtures/notifications.fixture.ts";

describe("app-nav-topbar-notifications.utils", () => {
  it("maps inbox entries into list item views", () => {
    const view = toNotificationListItemView(
      createNotificationInboxEntry({
        payload: {
          actorName: "Jane Doe",
          body: "Mentioned you in a thread",
          tab: "team",
          title: "Team update",
        },
      })
    );

    expect(view).toMatchObject({
      actorInitials: "JD",
      body: "Mentioned you in a thread",
      isUnread: true,
      tab: "team",
      title: "Team update",
    });
  });

  it("derives titles from event names when payload title is missing", () => {
    const view = toNotificationListItemView(
      createNotificationInboxEntry({
        event: "customer.created",
        payload: { customerName: "Acme Ops" },
      })
    );

    expect(view.title).toBe("Customer Created");
    expect(view.body).toBe("Acme Ops");
    expect(view.tab).toBe("inbox");
  });

  it("filters notifications by tab and counts unread items", () => {
    const items = [
      toNotificationListItemView(
        createNotificationInboxEntry({
          id: "11111111-1111-4111-8111-111111111111",
          payload: { tab: "inbox", title: "Inbox one" },
        })
      ),
      toNotificationListItemView(
        createNotificationInboxEntry({
          id: "22222222-2222-4222-8222-222222222222",
          payload: { tab: "team", title: "Team one" },
          readAt: "2026-06-01T12:05:00.000Z",
        })
      ),
      toNotificationListItemView(
        createNotificationInboxEntry({
          id: "33333333-3333-4333-8333-333333333333",
          payload: { tab: "team", title: "Team two" },
        })
      ),
    ];

    expect(filterNotificationsByTab(items, "team")).toHaveLength(2);
    expect(countUnreadForTab(items, "inbox")).toBe(1);
    expect(countUnreadForTab(items, "team")).toBe(1);
  });

  it("resolves tab-specific empty state copy", () => {
    expect(resolveNotificationEmptyStateCopy("all")).toMatchObject({
      title: "No notifications yet",
    });
    expect(resolveNotificationEmptyStateCopy("inbox")).toMatchObject({
      title: "Inbox is clear",
    });
    expect(resolveNotificationEmptyStateCopy("team")).toMatchObject({
      title: "No team updates",
    });
    expect(resolveNotificationEmptyStateCopy("following")).toMatchObject({
      title: "Nothing followed yet",
    });
  });
});
