import { TooltipProvider } from "@repo/ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppNavTopbarNotifications } from "../app/_components/workspace/app-nav-topbar-notifications.tsx";
import { createNotificationInboxEntry } from "./fixtures/notifications.fixture.ts";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

const supabaseMocks = vi.hoisted(() => ({
  subscribeToRecipientNotifications: vi.fn(() => ({ id: "channel-1" })),
  unsubscribeFromRecipientNotifications: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@repo/notifications/supabase/client", () => supabaseMocks);

const inboxFixture = {
  items: [
    createNotificationInboxEntry({
      payload: {
        body: "Acme Ops was created",
        tab: "inbox",
        title: "New customer",
      },
    }),
    createNotificationInboxEntry({
      id: "44444444-4444-4444-8444-444444444444",
      payload: {
        body: "Design requested access",
        tab: "team",
        title: "Access request",
      },
    }),
  ],
  unreadCount: 2,
};

function mockInboxFetch(
  handler: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Response | Promise<Response>
): void {
  vi.stubGlobal("fetch", vi.fn(handler));
}

async function waitForUnreadBell(count = 2): Promise<void> {
  await waitFor(() => {
    expect(
      screen.getByRole("button", {
        name: `Notifications, ${count} unread`,
      })
    ).toBeInTheDocument();
  });
}

async function openNotificationsPanel(count = 2): Promise<void> {
  await waitForUnreadBell(count);
  fireEvent.click(
    screen.getByRole("button", { name: `Notifications, ${count} unread` })
  );

  await waitFor(() => {
    expect(screen.getByText("Archive all")).toBeInTheDocument();
  });
}

describe("AppNavTopbarNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    mockInboxFetch((input, init) => {
      const url = String(input);

      if (url.includes("/api/me/notifications") && init?.method === "PATCH") {
        return {
          ok: true,
          json: async () => ({ updatedCount: 2 }),
        } as Response;
      }

      if (url.includes("/api/me/notifications")) {
        return {
          ok: true,
          json: async () => inboxFixture,
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
  });

  it("opens the notifications popover when the bell trigger is clicked", async () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    expect(screen.queryByText("Archive all")).not.toBeInTheDocument();

    await openNotificationsPanel();

    expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    expect(screen.getByText("New customer")).toBeInTheDocument();
    expect(screen.getByText("Access request")).toBeInTheDocument();
  });

  it("loads inbox data after opening the panel", async () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    await openNotificationsPanel();

    expect(fetch).toHaveBeenCalledWith("/api/me/notifications?limit=30", {
      method: "GET",
    });
  });

  it("marks all notifications as read from the panel footer", async () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    await openNotificationsPanel();

    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/me/notifications", {
        body: JSON.stringify({ action: "mark-all-read" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
    });
  });

  it("subscribes to recipient notifications for the signed-in user", () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    expect(
      supabaseMocks.subscribeToRecipientNotifications
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: {
          tenantId: "tenant-001",
          userId: "user-001",
        },
      })
    );
  });

  it("does not call the inbox API before the panel opens", async () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    await waitForUnreadBell();

    const inboxGets = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) =>
        String(url).includes("/api/me/notifications?limit=30")
      );

    expect(inboxGets.length).toBe(1);
  });

  it("shows metadata-ui empty state when the inbox has no items", async () => {
    mockInboxFetch((input) => {
      const url = String(input);

      if (url.includes("/api/me/notifications")) {
        return {
          ok: true,
          json: async () => ({ items: [], unreadCount: 0 }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(
      <TooltipProvider>
        <AppNavTopbarNotifications tenantId="tenant-001" userId="user-001" />
      </TooltipProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Notifications" })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
      expect(
        screen.getByText("You're all caught up. New updates will appear here.")
      ).toBeInTheDocument();
    });
  });

  it("preview mode shows empty state without calling the inbox API", async () => {
    mockInboxFetch(() => {
      throw new Error("Preview mode should not fetch notifications");
    });

    render(
      <TooltipProvider>
        <AppNavTopbarNotifications
          preview
          tenantId="00000000-0000-4000-8000-000000000001"
          userId="theme-studio-demo-user"
        />
      </TooltipProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
