import type { NotificationInboxEntry } from "@repo/notifications";

export type NotificationInboxTab = "all" | "following" | "inbox" | "team";

export type NotificationListItemView = {
  actorInitials: string;
  actorName?: string;
  body?: string;
  id: string;
  isUnread: boolean;
  occurredAt: string;
  tab: Exclude<NotificationInboxTab, "all">;
  title: string;
};

const formatEventTitle = (event: string): string =>
  event
    .split(/[.:]/)
    .filter(Boolean)
    .slice(-2)
    .map((segment) => segment.replace(/[-_]/g, " "))
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const readPayloadString = (
  payload: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const resolveNotificationTab = (
  entry: NotificationInboxEntry
): Exclude<NotificationInboxTab, "all"> => {
  const payloadTab =
    readPayloadString(entry.payload, "tab") ??
    readPayloadString(entry.payload, "inboxTab");

  if (payloadTab === "team" || payloadTab === "following") {
    return payloadTab;
  }

  if (payloadTab === "inbox") {
    return "inbox";
  }

  if (entry.event.includes("team")) {
    return "team";
  }

  if (entry.event.includes("follow")) {
    return "following";
  }

  return "inbox";
};

const resolveActorInitials = (actorName?: string): string => {
  if (!actorName) {
    return "N";
  }

  const parts = actorName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "N";
};

export const toNotificationListItemView = (
  entry: NotificationInboxEntry
): NotificationListItemView => {
  const payload = entry.payload;
  const title =
    readPayloadString(payload, "title") ?? formatEventTitle(entry.event);
  const body =
    readPayloadString(payload, "body") ??
    readPayloadString(payload, "reason") ??
    readPayloadString(payload, "customerName");
  const actorName =
    readPayloadString(payload, "actorName") ??
    readPayloadString(payload, "customerName");

  return {
    actorInitials: resolveActorInitials(actorName),
    actorName,
    body,
    id: entry.id,
    isUnread: entry.readAt === null,
    occurredAt: entry.dispatchedAt,
    tab: resolveNotificationTab(entry),
    title,
  };
};

export const filterNotificationsByTab = (
  items: readonly NotificationListItemView[],
  tab: NotificationInboxTab
): readonly NotificationListItemView[] => {
  if (tab === "all") {
    return items;
  }

  return items.filter((item) => item.tab === tab);
};

export const countUnreadForTab = (
  items: readonly NotificationListItemView[],
  tab: NotificationInboxTab
): number =>
  filterNotificationsByTab(items, tab).filter((item) => item.isUnread).length;

export type NotificationEmptyStateCopy = {
  description: string;
  title: string;
};

export const resolveNotificationEmptyStateCopy = (
  tab: NotificationInboxTab
): NotificationEmptyStateCopy => {
  switch (tab) {
    case "inbox":
      return {
        description: "New activity assigned to you will appear here.",
        title: "Inbox is clear",
      };
    case "team":
      return {
        description: "Updates for your team will show up here.",
        title: "No team updates",
      };
    case "following":
      return {
        description:
          "Updates from people and records you follow will appear here.",
        title: "Nothing followed yet",
      };
    default:
      return {
        description: "You're all caught up. New updates will appear here.",
        title: "No notifications yet",
      };
  }
};

export const formatNotificationRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const diffMs = date.getTime() - Date.now();
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];

  for (const [unit, unitMs] of units) {
    if (Math.abs(diffMs) >= unitMs || unit === "minute") {
      const value = Math.round(diffMs / unitMs);
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        value,
        unit
      );
    }
  }

  return "just now";
};
