"use client";

import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import type { NotificationInboxEntry } from "@repo/notifications";
import {
  subscribeToRecipientNotifications,
  unsubscribeFromRecipientNotifications,
} from "@repo/notifications/supabase/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotificationInbox,
  mutateNotificationInbox,
} from "../../../lib/notifications/inbox.client.ts";
import { appNavTopbarGhostIconButtonClassName } from "./app-nav-topbar-chrome.ts";
import type {
  NotificationInboxTab,
  NotificationListItemView,
} from "./app-nav-topbar-notifications.utils.ts";
import {
  countUnreadForTab,
  filterNotificationsByTab,
  formatNotificationRelativeTime,
  resolveNotificationEmptyStateCopy,
  toNotificationListItemView,
} from "./app-nav-topbar-notifications.utils.ts";
import {
  notificationsAlertClassName,
  notificationsEmptyStateShellClassName,
  notificationsFooterActionClassName,
  notificationsFooterClassName,
  notificationsFooterPrimaryActionClassName,
  notificationsListEnterClassName,
  notificationsListItemBodyClassName,
  notificationsListItemClassName,
  notificationsListItemTimeClassName,
  notificationsListItemTitleClassName,
  notificationsListItemTitleUnreadClassName,
  notificationsListItemUnreadClassName,
  notificationsListRegionClassName,
  notificationsListScrollClassName,
  notificationsPanelDescriptionClassName,
  notificationsPanelHeaderClassName,
  notificationsPanelShellClassName,
  notificationsPanelTitleClassName,
  notificationsPopoverContentClassName,
  notificationsSheetContentClassName,
  notificationsTabsListClassName,
  notificationsTabTriggerClassName,
  notificationsTabUnreadDotClassName,
  notificationsUnreadDotClassName,
} from "./app-nav-topbar-notifications-chrome.ts";
import { AppNavTopbarNotificationsTrigger } from "./app-nav-topbar-notifications-trigger.tsx";

const NOTIFICATION_TABS: readonly {
  label: string;
  value: NotificationInboxTab;
}[] = [
  { label: "All", value: "all" },
  { label: "Inbox", value: "inbox" },
  { label: "Team", value: "team" },
  { label: "Following", value: "following" },
];

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export type AppNavTopbarNotificationsProps = {
  /** Theme Studio / Storybook — skip live inbox API and show preview shell only. */
  preview?: boolean;
  tenantId: string;
  userId: string;
};

function NotificationListItem({
  index,
  item,
  onSelect,
}: {
  index: number;
  item: NotificationListItemView;
  onSelect: (id: string) => void;
}): ReactElement {
  return (
    <Button
      className={cn(
        notificationsListItemClassName,
        notificationsListEnterClassName,
        item.isUnread && notificationsListItemUnreadClassName
      )}
      onClick={() => onSelect(item.id)}
      style={{ animationDelay: `${index * 40}ms` }}
      type="button"
      variant="ghost"
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-muted font-medium text-muted-foreground text-xs">
          {item.actorInitials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5 text-left">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              notificationsListItemTitleClassName,
              item.isUnread && notificationsListItemTitleUnreadClassName
            )}
          >
            {item.title}
          </p>
          <span className={notificationsListItemTimeClassName}>
            {formatNotificationRelativeTime(item.occurredAt)}
          </span>
        </div>
        {item.body ? (
          <p className={notificationsListItemBodyClassName}>{item.body}</p>
        ) : null}
      </div>
      {item.isUnread ? (
        <Badge
          aria-hidden
          className={notificationsUnreadDotClassName}
          variant="default"
        />
      ) : null}
    </Button>
  );
}

function NotificationListSkeleton(): ReactElement {
  return (
    <div className="space-y-2 px-3 py-2">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="flex gap-3" key={index}>
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 py-0.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsEmptyState({
  tab,
}: {
  tab: NotificationInboxTab;
}): ReactElement {
  const copy = resolveNotificationEmptyStateCopy(tab);

  return (
    <div className={notificationsEmptyStateShellClassName}>
      <MetadataStateBoundary
        emptyDescription={copy.description}
        emptyTitle={copy.title}
        state="empty"
      />
    </div>
  );
}

function NotificationsPanel({
  activeTab,
  error,
  isLoading,
  items,
  onArchiveAll,
  onMarkAllRead,
  onOpenSettings,
  onSelectItem,
  onTabChange,
  unreadByTab,
  unreadCount,
}: {
  activeTab: NotificationInboxTab;
  error: string | null;
  isLoading: boolean;
  items: readonly NotificationListItemView[];
  onArchiveAll: () => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
  onSelectItem: (id: string) => void;
  onTabChange: (tab: NotificationInboxTab) => void;
  unreadByTab: Record<NotificationInboxTab, number>;
  unreadCount: number;
}): ReactElement {
  const hasItems = items.length > 0;
  const footerDisabled = isLoading || !hasItems;

  return (
    <div className={notificationsPanelShellClassName}>
      <PopoverHeader className={notificationsPanelHeaderClassName}>
        <div className="min-w-0 space-y-0.5">
          <PopoverTitle className={notificationsPanelTitleClassName}>
            Notifications
          </PopoverTitle>
          {unreadCount > 0 ? (
            <PopoverDescription
              className={notificationsPanelDescriptionClassName}
            >
              {unreadCount} unread
            </PopoverDescription>
          ) : null}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={appNavTopbarGhostIconButtonClassName}
              onClick={onOpenSettings}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Settings2 className="size-4" />
              <span className="sr-only">Notification settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>
      </PopoverHeader>

      <Tabs
        className="flex min-h-0 flex-1 flex-col gap-0"
        onValueChange={(value) => onTabChange(value as NotificationInboxTab)}
        value={activeTab}
      >
        <div className="border-border border-b px-4">
          <TabsList className={notificationsTabsListClassName} variant="line">
            {NOTIFICATION_TABS.map((tab) => (
              <TabsTrigger
                className={notificationsTabTriggerClassName}
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
                {unreadByTab[tab.value] > 0 ? (
                  <Badge
                    aria-hidden
                    className={notificationsTabUnreadDotClassName}
                    variant="default"
                  />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {NOTIFICATION_TABS.map((tab) => {
          const tabItems = filterNotificationsByTab(items, tab.value);

          return (
            <TabsContent
              className="mt-0 min-h-0 min-w-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
              key={tab.value}
              value={tab.value}
            >
              <ScrollArea className={notificationsListScrollClassName}>
                <div className={notificationsListRegionClassName}>
                  {isLoading ? <NotificationListSkeleton /> : null}
                  {!isLoading && error ? (
                    <Alert
                      className={notificationsAlertClassName}
                      variant="destructive"
                    >
                      <AlertTitle>Unable to load notifications</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  {!(isLoading || error) && tabItems.length === 0 ? (
                    <NotificationsEmptyState tab={tab.value} />
                  ) : null}
                  {isLoading || error
                    ? null
                    : tabItems.map((item, index) => (
                        <NotificationListItem
                          index={index}
                          item={item}
                          key={item.id}
                          onSelect={onSelectItem}
                        />
                      ))}
                </div>
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className={notificationsFooterClassName}>
        <Button
          className={notificationsFooterActionClassName}
          disabled={footerDisabled}
          onClick={onArchiveAll}
          type="button"
          variant="ghost"
        >
          Archive all
        </Button>
        <Button
          className={notificationsFooterPrimaryActionClassName}
          disabled={footerDisabled}
          onClick={onMarkAllRead}
          type="button"
          variant="ghost"
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
}

function useNotificationInbox({
  isOpen,
  preview = false,
  tenantId,
  userId,
}: {
  isOpen: boolean;
  preview?: boolean;
  tenantId: string;
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<NotificationInboxTab>("all");
  const [entries, setEntries] = useState<readonly NotificationInboxEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInbox = useCallback(async (): Promise<void> => {
    if (preview) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inbox = await fetchNotificationInbox();
      setEntries(inbox.items);
      setUnreadCount(inbox.unreadCount);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to load notifications"
      );
    } finally {
      setIsLoading(false);
    }
  }, [preview]);

  useEffect(() => {
    if (preview || tenantId === "anonymous" || userId === "anonymous") {
      return;
    }

    void fetchNotificationInbox()
      .then((inbox) => {
        setUnreadCount(inbox.unreadCount);
        if (isOpen) {
          setEntries(inbox.items);
        }
      })
      .catch(() => undefined);
  }, [isOpen, preview, tenantId, userId]);

  useEffect(() => {
    if (preview || !isOpen) {
      return;
    }

    void refreshInbox();
  }, [isOpen, preview, refreshInbox]);

  useEffect(() => {
    if (
      preview ||
      !isOpen ||
      tenantId === "anonymous" ||
      userId === "anonymous"
    ) {
      return;
    }

    const unseenIds = entries
      .filter((entry) => entry.seenAt === null)
      .map((entry) => entry.id);

    if (unseenIds.length === 0) {
      return;
    }

    void mutateNotificationInbox({
      action: "mark-seen",
      ids: unseenIds,
    }).catch(() => undefined);
  }, [entries, isOpen, preview, tenantId, userId]);

  useEffect(() => {
    if (preview || tenantId === "anonymous" || userId === "anonymous") {
      return;
    }

    const channel = subscribeToRecipientNotifications({
      onMessage: () => {
        if (isOpen) {
          void refreshInbox();
          return;
        }

        setUnreadCount((current) => current + 1);
      },
      recipient: { tenantId, userId },
    });

    return () => {
      void unsubscribeFromRecipientNotifications(channel);
    };
  }, [isOpen, preview, refreshInbox, tenantId, userId]);

  const items = useMemo(
    () => entries.map((entry) => toNotificationListItemView(entry)),
    [entries]
  );

  const unreadByTab = useMemo(
    () => ({
      all: unreadCount,
      following: countUnreadForTab(items, "following"),
      inbox: countUnreadForTab(items, "inbox"),
      team: countUnreadForTab(items, "team"),
    }),
    [items, unreadCount]
  );

  const handleSelectItem = useCallback(
    async (id: string): Promise<void> => {
      let wasUnread = false;

      setEntries((current) =>
        current.map((entry) => {
          if (entry.id !== id) {
            return entry;
          }

          if (entry.readAt) {
            return entry;
          }

          wasUnread = true;
          return {
            ...entry,
            readAt: new Date().toISOString(),
            seenAt: entry.seenAt ?? new Date().toISOString(),
          };
        })
      );

      if (wasUnread) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      try {
        await mutateNotificationInbox({ action: "mark-read", id });
      } catch {
        void refreshInbox();
      }
    },
    [refreshInbox]
  );

  const handleMarkAllRead = useCallback(async (): Promise<void> => {
    try {
      await mutateNotificationInbox({ action: "mark-all-read" });
      setEntries((current) =>
        current.map((entry) => ({
          ...entry,
          readAt: entry.readAt ?? new Date().toISOString(),
          seenAt: entry.seenAt ?? new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (markAllError) {
      setError(
        markAllError instanceof Error
          ? markAllError.message
          : "Failed to mark notifications as read"
      );
    }
  }, []);

  const handleArchiveAll = useCallback(async (): Promise<void> => {
    try {
      await mutateNotificationInbox({ action: "archive-all" });
      setEntries([]);
      setUnreadCount(0);
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Failed to archive notifications"
      );
    }
  }, []);

  return {
    activeTab,
    error,
    handleArchiveAll,
    handleMarkAllRead,
    handleSelectItem,
    isLoading,
    items,
    setActiveTab,
    unreadByTab,
    unreadCount,
  };
}

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = (): void => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function AppNavTopbarNotifications({
  preview = false,
  tenantId,
  userId,
}: AppNavTopbarNotificationsProps): ReactElement {
  const router = useRouter();
  const isMobile = useIsMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const inbox = useNotificationInbox({ isOpen, preview, tenantId, userId });

  const panel = (
    <NotificationsPanel
      activeTab={inbox.activeTab}
      error={inbox.error}
      isLoading={inbox.isLoading}
      items={inbox.items}
      onArchiveAll={() => void inbox.handleArchiveAll()}
      onMarkAllRead={() => void inbox.handleMarkAllRead()}
      onOpenSettings={() => router.push("/settings/appearance")}
      onSelectItem={(id) => void inbox.handleSelectItem(id)}
      onTabChange={inbox.setActiveTab}
      unreadByTab={inbox.unreadByTab}
      unreadCount={inbox.unreadCount}
    />
  );

  if (isMobile) {
    return (
      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <AppNavTopbarNotificationsTrigger
                isOpen={isOpen}
                unreadCount={inbox.unreadCount}
              />
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>
        <SheetContent
          className={notificationsSheetContentClassName}
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {panel}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover modal onOpenChange={setIsOpen} open={isOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <AppNavTopbarNotificationsTrigger
              isOpen={isOpen}
              unreadCount={inbox.unreadCount}
            />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className={notificationsPopoverContentClassName}
        side="bottom"
        sideOffset={4}
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}
