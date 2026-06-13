"use client";

import { Badge, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Bell } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./workspace-shell.classes.ts";
import { notificationsTriggerOpenClassName } from "./app-nav-topbar-notifications-chrome.ts";

const MAX_UNREAD_DISPLAY = 99;

export const formatUnreadCountLabel = (count: number): string =>
  count > MAX_UNREAD_DISPLAY ? `${MAX_UNREAD_DISPLAY}+` : String(count);

export type AppNavTopbarNotificationsTriggerProps = ComponentPropsWithoutRef<
  typeof Button
> & {
  isOpen?: boolean;
  unreadCount: number;
};

export const AppNavTopbarNotificationsTrigger = forwardRef<
  HTMLButtonElement,
  AppNavTopbarNotificationsTriggerProps
>(function AppNavTopbarNotificationsTrigger(
  { className, isOpen = false, unreadCount, ...props },
  ref
): ReactElement {
  const hasUnread = unreadCount > 0;
  const previousUnreadCount = useRef(unreadCount);
  const [shouldRing, setShouldRing] = useState(false);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      setShouldRing(true);
      const timeout = window.setTimeout(() => setShouldRing(false), 650);
      previousUnreadCount.current = unreadCount;
      return () => window.clearTimeout(timeout);
    }

    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <Button
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={
        hasUnread
          ? `Notifications, ${formatUnreadCountLabel(unreadCount)} unread`
          : "Notifications"
      }
      className={cn(
        appNavTopbarGhostIconButtonClassName,
        notificationsTriggerOpenClassName,
        "group relative",
        className
      )}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          shouldRing && "motion-safe:animate-bell-ring"
        )}
      >
        <Bell
          className={cn(
            appNavTopbarIconClassName,
            "transition-transform duration-200",
            "group-data-[state=open]:scale-110",
            hasUnread && !isOpen && "text-foreground"
          )}
        />
        {hasUnread && shouldRing ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping"
          />
        ) : null}
      </span>
      {hasUnread ? (
        <Badge
          className={cn(
            "absolute -top-1 -right-1 border-2 border-background px-1 tabular-nums shadow-sm",
            "motion-safe:fade-in motion-safe:zoom-in-75 motion-safe:animate-in motion-safe:duration-200"
          )}
          key={unreadCount}
          size="sm"
          variant="destructive"
        >
          {formatUnreadCountLabel(unreadCount)}
        </Badge>
      ) : null}
    </Button>
  );
});

AppNavTopbarNotificationsTrigger.displayName =
  "AppNavTopbarNotificationsTrigger";
