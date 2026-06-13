import { WORKSPACE_SHELL_SPACE } from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";

export const WORKSPACE_METADATA_LABEL_CLASS =
  "font-medium text-[12px] leading-none tracking-[0.08em] uppercase text-muted-foreground";

export const WORKSPACE_STANDARD_METADATA_LABEL_CLASS =
  "font-medium text-[12px] leading-none tracking-[0.02em] text-muted-foreground";

export const WORKSPACE_METADATA_GROUP_LABEL_CLASS = cn(
  WORKSPACE_METADATA_LABEL_CLASS,
  "h-5 px-2"
);

// Metadata spacing contract:
// label->first item = 2px; item->item <= 2px; last item->next label = 8px.
export const WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS = "mt-0.5";
export const WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS = "gap-0.5";
export const WORKSPACE_SIDEBAR_ITEM_TO_ITEM_STACK_CLASS = "space-y-0.5";
export const WORKSPACE_SIDEBAR_DENSE_ITEM_TO_ITEM_GAP_CLASS = "gap-0";
export const WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS = "gap-2";

export const WORKSPACE_SHELL_HOVER_CLASS =
  "hover:bg-muted hover:text-foreground";

export const WORKSPACE_SHELL_FOCUS_VISIBLE_CLASS =
  "focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";

export const WORKSPACE_SHELL_INTERACTIVE_CLASS = cn(
  WORKSPACE_SHELL_HOVER_CLASS,
  WORKSPACE_SHELL_FOCUS_VISIBLE_CLASS
);

export const WORKSPACE_SHELL_FOCUS_WITHIN_INTERACTIVE_CLASS = cn(
  WORKSPACE_SHELL_HOVER_CLASS,
  "focus-within:bg-muted focus-within:text-foreground"
);

export const WORKSPACE_SHELL_OPEN_CLASS =
  "data-[state=open]:bg-muted data-[state=open]:text-foreground";

export const WORKSPACE_SHELL_ACTIVE_CLASS =
  "data-[active=true]:bg-lane-active-muted data-[active=true]:text-lane-active-muted-foreground";

export const SIDEBAR_ICON_COLLAPSE_SHELL_CLASS = [
  "group-data-[collapsible=icon]:[&_[data-slot=app-nav-sidebar-content]_[data-slot=scroll-area-viewport]>div]:px-0",
  "group-data-[collapsible=icon]:[&_[data-slot=app-nav-sidebar-content]_[data-slot=scroll-area-viewport]>div]:py-2",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-content]]:px-0",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-footer]]:px-0",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-footer]]:pb-2",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-group]]:p-0",
  "group-data-[collapsible=icon]:[&_[data-slot=scroll-area-viewport]]:py-0",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu]]:items-center",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-item]]:flex",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-item]]:w-full",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-item]]:justify-center",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:mx-auto",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:size-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:h-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:min-h-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:max-h-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:w-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:min-w-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:max-w-8!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:p-0!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:justify-center",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]]:gap-0",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]_svg]:size-4!",
  "group-data-[collapsible=icon]:[&_[data-slot=site-nav-emoji]]:size-4!",
  "group-data-[collapsible=icon]:[&_[data-slot=site-nav-emoji]]:shrink-0",
  "group-data-[collapsible=icon]:[&_[data-slot=site-nav-emoji]]:text-sm!",
  "group-data-[collapsible=icon]:[&_[data-slot=site-staging-sidebar-feature]]:justify-center",
  "group-data-[collapsible=icon]:[&_[data-slot=site-staging-sidebar-feature]]:px-0",
  "group-data-[collapsible=icon]:[&_[data-slot=site-staging-sidebar-feature]_[data-slot=sidebar-menu]]:items-center",
  "group-data-[collapsible=icon]:[&_[data-slot=site-staging-sidebar-feature]_[data-slot=sidebar-menu-button]]:mx-auto",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]>span:not([aria-hidden])]:hidden!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-group-label]]:hidden!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-menu-button]:not(:has(>svg)):not(:has([data-slot=site-nav-emoji]))]:hidden!",
  "group-data-[collapsible=icon]:overflow-x-hidden!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-inner]]:overflow-x-hidden!",
  "group-data-[collapsible=icon]:[&_[data-slot=sidebar-content]]:overflow-x-hidden!",
  "group-data-[collapsible=icon]:[&_[data-slot=scroll-area-viewport]]:overflow-x-hidden!",
  "group-data-[collapsible=icon]:[&_input]:hidden!",
].join(" ");

export const APP_NAV_SIDEBAR_SHELL_CLASS = [
  "[&_[data-slot=sidebar-inner]]:min-h-0 [&_[data-slot=sidebar-inner]]:min-w-0 [&_[data-slot=sidebar-inner]]:overflow-x-hidden [&_[data-slot=sidebar-container]]:border-0 [&_[data-slot=sidebar-header]]:border-0 [&_[data-slot=sidebar-footer]]:border-0 [&_[data-slot=sidebar-separator]]:hidden [&_[data-sidebar=separator]]:hidden",
  SIDEBAR_ICON_COLLAPSE_SHELL_CLASS,
].join(" ");

export const SITE_CONTENT_SHELL_CLASS = [
  "bg-background",
  "[&_[data-slot=workspace-nav-site-topbar]]:bg-background",
  "[&_[data-slot=workspace-site-content-body]]:bg-background",
  "[&_[data-slot=workspace-site-content]]:bg-background",
  "[&_[data-slot=sidebar-wrapper]]:bg-background",
].join(" ");

export const SITE_LEFT_SIDEBAR_PROVIDER_CLASS =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background [&_[data-slot=sidebar-wrapper]]:min-h-0 [&_[data-slot=sidebar-wrapper]]:flex-1 [&_[data-slot=sidebar-wrapper]]:bg-background [&_[data-slot=workspace-site-content-body]]:bg-background [&_[data-slot=workspace-site-content-body]_[data-slot=sidebar-container]]:!relative [&_[data-slot=workspace-site-content-body]_[data-slot=sidebar-container]]:!top-0 [&_[data-slot=workspace-site-content-body]_[data-slot=sidebar-container]]:!z-layer-base [&_[data-slot=workspace-site-content-body]_[data-slot=sidebar-container]]:!h-full";

export const SITE_LEFT_SIDEBAR_SCROLL_AREA_CLASS =
  "h-full min-h-0 flex-1 w-full min-w-0 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-viewport]>div]:py-2 [&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:bottom-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:top-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:h-full";

export const SITE_LEFT_SIDEBAR_SHELL_CLASS = [
  "[&_[data-slot=sidebar-container]]:!relative [&_[data-slot=sidebar-container]]:!top-0 [&_[data-slot=sidebar-container]]:!inset-auto [&_[data-slot=sidebar-container]]:!z-layer-base [&_[data-slot=sidebar-container]]:!h-full [&_[data-slot=sidebar-container]]:border-0 [&_[data-slot=sidebar-inner]]:border-0 [&_[data-slot=sidebar-inner]]:bg-background [&_[data-slot=sidebar-content]]:gap-0 [&_[data-slot=sidebar-content]]:bg-background [&_[data-slot=sidebar-content]]:p-0 [&_[data-menu-sub]]:hidden [&_[data-sidebar=menu-sub]]:hidden [&_[data-slot=sidebar-separator]]:hidden [&_[data-sidebar=separator]]:hidden [&_[data-slot=sidebar-rail]]:hidden [&_[data-sidebar=rail]]:hidden [&_hr]:hidden [&_[data-slot=sidebar-menu-sub]]:hidden",
  SIDEBAR_ICON_COLLAPSE_SHELL_CLASS,
].join(" ");

export const appNavTopbarGhostIconButtonClassName = cn(
  WORKSPACE_SHELL_SPACE.iconButton,
  "shrink-0 text-muted-foreground",
  WORKSPACE_SHELL_INTERACTIVE_CLASS
);

export const appNavTopbarAvatarTriggerClassName = cn(
  WORKSPACE_SHELL_SPACE.iconButton,
  "shrink-0 p-0 text-muted-foreground",
  WORKSPACE_SHELL_INTERACTIVE_CLASS
);

export const appNavTopbarIconClassName = "size-4 shrink-0";

export const siteTopbarIconButtonClassName = cn(
  WORKSPACE_SHELL_SPACE.iconButton,
  "shrink-0 text-muted-foreground",
  WORKSPACE_SHELL_INTERACTIVE_CLASS
);

export const siteTopbarIconClassName = "size-4 shrink-0";
