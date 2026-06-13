import { cn } from "@repo/ui/lib/utils";
import {
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SHELL_OPEN_CLASS,
} from "./workspace-shell.classes.ts";

/** Popover / sheet shell — semantic tokens only (Tailwind v4 / @theme). */
export const notificationsPanelShellClassName =
  "flex h-full min-h-0 min-w-0 flex-col";

export const notificationsPanelHeaderClassName =
  "flex-row items-start justify-between gap-2 border-b border-border px-4 py-3";

export const notificationsPanelTitleClassName =
  "font-medium text-foreground text-sm";

export const notificationsPanelDescriptionClassName =
  "text-muted-foreground text-xs";

export const notificationsPopoverContentClassName = cn(
  "z-layer-popover w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border-border p-0"
);

export const notificationsSheetContentClassName =
  "flex w-full flex-col gap-0 rounded-none p-0 sm:max-w-md";

export const notificationsTabsListClassName =
  "h-9 w-full justify-start bg-transparent";

export const notificationsTabTriggerClassName = "relative text-xs";

export const notificationsTabUnreadDotClassName =
  "absolute -top-0.5 end-0 size-1.5 rounded-full bg-primary p-0 shadow-none";

export const notificationsListScrollClassName =
  "h-[min(24rem,calc(100dvh-12rem))]";

export const notificationsListRegionClassName = "min-w-0 px-3 py-1";

export const notificationsAlertClassName = "my-3 w-full min-w-0";

export const notificationsListItemClassName = cn(
  "h-auto w-full justify-start gap-3 rounded-md px-3 py-2.5 font-normal",
  "text-left transition-colors",
  WORKSPACE_SHELL_INTERACTIVE_CLASS
);

export const notificationsListItemUnreadClassName = "bg-accent/35";

export const notificationsListItemTitleClassName =
  "truncate text-foreground text-sm";

export const notificationsListItemTitleUnreadClassName = "font-medium";

export const notificationsListItemBodyClassName =
  "line-clamp-2 text-muted-foreground text-xs leading-relaxed";

export const notificationsListItemTimeClassName =
  "shrink-0 tabular-nums text-muted-foreground text-xs";

export const notificationsUnreadDotClassName =
  "mt-1.5 size-2 shrink-0 rounded-full bg-primary p-0 shadow-none";

export const notificationsFooterClassName =
  "flex items-center justify-between gap-2 border-t border-border px-3 py-2";

export const notificationsFooterActionClassName = cn(
  "h-8 px-2 text-muted-foreground text-xs",
  WORKSPACE_SHELL_INTERACTIVE_CLASS
);

export const notificationsFooterPrimaryActionClassName =
  "h-8 px-2 text-foreground text-xs";

/** Compacts metadata-ui empty StatePanel for popover density. */
export const notificationsEmptyStateShellClassName = cn(
  "px-3 py-6",
  "[&_[data-state=empty]>div]:rounded-lg",
  "[&_[data-state=empty]>div]:border-border/60",
  "[&_[data-state=empty]>div]:bg-muted/25",
  "[&_[data-state=empty]>div]:shadow-none",
  "[&_[data-state=empty]_div.rounded-full]:size-9",
  "[&_[data-state=empty]_div.rounded-full_svg]:size-4",
  "[&_[data-slot=card-title]]:font-medium",
  "[&_[data-slot=card-title]]:text-foreground",
  "[&_[data-slot=card-title]]:text-sm",
  "[&_[data-state=empty]_p]:text-muted-foreground",
  "[&_[data-state=empty]_p]:text-xs"
);

export const notificationsListEnterClassName =
  "motion-safe:animate-notification-enter";

export const notificationsTriggerOpenClassName = WORKSPACE_SHELL_OPEN_CLASS;
