import {
  Activity,
  Bell,
  Calendar,
  CircleQuestionMark,
  ClipboardList,
  DatabaseBackup,
  Keyboard,
  Lightbulb,
  LineChart,
  MessageSquareWarning,
  MessagesSquare,
  Search,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";
import { createElement } from "react";
import { appNavTopbarIconClassName } from "./app-nav-topbar-chrome.ts";

export const APP_NAV_TOPBAR_UTILITY_MAX_PINNED = 6;

export type AppNavTopbarUtilityId =
  | "advisor-center"
  | "calendar"
  | "clipboard-list"
  | "feedback"
  | "help"
  | "keyboard-shortcuts"
  | "line-chart"
  | "messenger"
  | "network-diagnosis"
  | "notifications"
  | "search"
  | "settings"
  | "storage-backup";

export type AppNavTopbarUtilityActionKind =
  | "command-palette"
  | "feedback-menu"
  | "help"
  | "keyboard-shortcuts"
  | "notifications-menu"
  | "settings-appearance"
  | "stub";

export type AppNavTopbarUtilityDefinition = {
  action: AppNavTopbarUtilityActionKind;
  id: AppNavTopbarUtilityId;
  label: string;
  icon: LucideIcon;
};

export const APP_NAV_TOPBAR_UTILITY_CATALOG: readonly AppNavTopbarUtilityDefinition[] =
  [
    {
      action: "help",
      id: "help",
      label: "Help",
      icon: CircleQuestionMark,
    },
    {
      action: "stub",
      id: "advisor-center",
      label: "Advisor center",
      icon: Lightbulb,
    },
    {
      action: "keyboard-shortcuts",
      id: "keyboard-shortcuts",
      label: "Keyboard shortcuts",
      icon: Keyboard,
    },
    {
      action: "stub",
      id: "network-diagnosis",
      label: "Network diagnosis",
      icon: Activity,
    },
    {
      action: "stub",
      id: "messenger",
      label: "Messenger",
      icon: MessagesSquare,
    },
    {
      action: "command-palette",
      id: "search",
      label: "Quick search",
      icon: Search,
    },
    {
      action: "stub",
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      action: "stub",
      id: "clipboard-list",
      label: "Tasks",
      icon: ClipboardList,
    },
    {
      action: "stub",
      id: "line-chart",
      label: "Analytics",
      icon: LineChart,
    },
    {
      action: "settings-appearance",
      id: "settings",
      label: "Workspace settings",
      icon: Settings2,
    },
    {
      action: "feedback-menu",
      id: "feedback",
      label: "Feedback",
      icon: MessageSquareWarning,
    },
    {
      action: "stub",
      id: "storage-backup",
      label: "Storage and backup",
      icon: DatabaseBackup,
    },
    {
      action: "notifications-menu",
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
  ];

export const APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED: readonly AppNavTopbarUtilityId[] =
  [
    "keyboard-shortcuts",
    "network-diagnosis",
    "messenger",
    "notifications",
  ];

const utilityCatalogById = new Map(
  APP_NAV_TOPBAR_UTILITY_CATALOG.map((entry) => [entry.id, entry])
);

export function isAppNavTopbarUtilityId(
  value: string
): value is AppNavTopbarUtilityId {
  return utilityCatalogById.has(value as AppNavTopbarUtilityId);
}

export function getAppNavTopbarUtilityDefinition(
  id: AppNavTopbarUtilityId
): AppNavTopbarUtilityDefinition {
  const definition = utilityCatalogById.get(id);

  if (!definition) {
    throw new Error(`Unknown topbar utility: ${id}`);
  }

  return definition;
}

export function renderAppNavTopbarUtilityIcon(
  id: AppNavTopbarUtilityId
): ReactElement {
  const definition = getAppNavTopbarUtilityDefinition(id);

  return createElement(definition.icon, {
    className: appNavTopbarIconClassName,
  });
}
