import { Popover, PopoverTrigger, TooltipProvider } from "@repo/ui";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import {
  AppNavTopbarNotificationsTrigger,
  formatUnreadCountLabel,
} from "../app/_components/workspace/app-nav-topbar-notifications-trigger.tsx";
import {
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SHELL_OPEN_CLASS,
} from "../app/_components/workspace/workspace-shell.classes.ts";

function expectClassTokens(element: HTMLElement, className: string): void {
  for (const token of className.split(" ")) {
    expect(element).toHaveClass(token);
  }
}

describe("formatUnreadCountLabel", () => {
  it("caps unread counts at 99+", () => {
    expect(formatUnreadCountLabel(1)).toBe("1");
    expect(formatUnreadCountLabel(99)).toBe("99");
    expect(formatUnreadCountLabel(100)).toBe("99+");
    expect(formatUnreadCountLabel(250)).toBe("99+");
  });
});

describe("AppNavTopbarNotificationsTrigger", () => {
  it("forwards ref to the native button for Radix popover triggers", () => {
    const triggerRef = createRef<HTMLButtonElement>();

    render(
      <TooltipProvider>
        <Popover>
          <PopoverTrigger asChild>
            <AppNavTopbarNotificationsTrigger
              ref={triggerRef}
              unreadCount={2}
            />
          </PopoverTrigger>
        </Popover>
      </TooltipProvider>
    );

    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current?.getAttribute("aria-haspopup")).toBe("dialog");
    expectClassTokens(
      triggerRef.current as HTMLButtonElement,
      WORKSPACE_SHELL_INTERACTIVE_CLASS
    );
    expectClassTokens(
      triggerRef.current as HTMLButtonElement,
      WORKSPACE_SHELL_OPEN_CLASS
    );
  });

  it("renders unread badge labels up to 99+", () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotificationsTrigger unreadCount={12} />
      </TooltipProvider>
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications, 12 unread" })
    ).toBeInTheDocument();
  });

  it("shows 99+ for large unread counts", () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotificationsTrigger unreadCount={143} />
      </TooltipProvider>
    );

    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications, 99+ unread" })
    ).toBeInTheDocument();
  });

  it("omits the badge when there are no unread notifications", () => {
    render(
      <TooltipProvider>
        <AppNavTopbarNotificationsTrigger unreadCount={0} />
      </TooltipProvider>
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
  });
});
