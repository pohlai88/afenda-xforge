"use client";

import type { WorkspaceAppNavTopbarProps } from "@repo/ui/components/compose/workspace";
import {
  WORKSPACE_APP_NAV_TOPBAR_HEIGHT,
  WORKSPACE_SHELL_SIDEBAR_WIDTH,
  WorkspaceAppNavTopbar,
  WorkspaceAppSidebar,
  WorkspaceNavSiteContent,
  WorkspaceShellProvider,
  WorkspaceSiteContent,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type {
  ComponentProps,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";

type WorkspaceFrameProps = {
  appNavTopbar?: WorkspaceAppNavTopbarProps;
  children: ReactNode;
  className?: string;
  collapsible?: ComponentProps<typeof WorkspaceAppSidebar>["collapsible"];
  contentClassName?: string;
  contentPadded?: boolean;
  defaultOpen?: boolean;
  enableSidebarKeyboardShortcut?: boolean;
  sidebar: ReactNode;
  sidebarClassName?: string;
  sidebarVariant?: ComponentProps<typeof WorkspaceAppSidebar>["variant"];
  sidebarWidth?: string;
  sidebarWrapper?: (sidebar: ReactNode) => ReactNode;
  topBar: ReactNode;
};

const workspaceBodyBelowAppTopbarClass =
  "[--workspace-app-topbar-height:var(--workspace-app-nav-topbar-height,2.75rem)] [&_[data-slot=sidebar-container]]:top-[var(--workspace-app-topbar-height)] [&_[data-slot=sidebar-container]]:h-[calc(100svh-var(--workspace-app-topbar-height))]";

export function WorkspaceFrame({
  appNavTopbar,
  children,
  className,
  collapsible = "offcanvas",
  contentClassName,
  contentPadded = false,
  defaultOpen = true,
  enableSidebarKeyboardShortcut = true,
  sidebar,
  sidebarClassName,
  sidebarVariant = "inset",
  sidebarWidth = WORKSPACE_SHELL_SIDEBAR_WIDTH,
  sidebarWrapper,
  topBar,
}: WorkspaceFrameProps): ReactElement {
  const sidebarNode = (
    <WorkspaceAppSidebar
      className={sidebarClassName}
      collapsible={collapsible}
      variant={sidebarVariant}
    >
      {sidebar}
    </WorkspaceAppSidebar>
  );

  const resolvedSidebar = sidebarWrapper
    ? sidebarWrapper(sidebarNode)
    : sidebarNode;

  const siteColumn = (
    <WorkspaceNavSiteContent>
      {topBar}
      <WorkspaceSiteContent className={contentClassName} padded={contentPadded}>
        {children}
      </WorkspaceSiteContent>
    </WorkspaceNavSiteContent>
  );

  if (!appNavTopbar) {
    return (
      <WorkspaceShellProvider
        className={cn("h-svh overflow-hidden", className)}
        defaultOpen={defaultOpen}
        enableSidebarKeyboardShortcut={enableSidebarKeyboardShortcut}
        sidebarWidth={sidebarWidth}
      >
        {resolvedSidebar}
        {siteColumn}
      </WorkspaceShellProvider>
    );
  }

  return (
    <WorkspaceShellProvider
      className={cn("flex h-svh flex-col overflow-hidden", className)}
      defaultOpen={defaultOpen}
      enableSidebarKeyboardShortcut={enableSidebarKeyboardShortcut}
      sidebarWidth={sidebarWidth}
      style={
        {
          "--workspace-app-nav-topbar-height": WORKSPACE_APP_NAV_TOPBAR_HEIGHT,
        } as CSSProperties
      }
    >
      <WorkspaceAppNavTopbar {...appNavTopbar} />
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 overflow-hidden",
          workspaceBodyBelowAppTopbarClass
        )}
        data-slot="workspace-body"
      >
        {resolvedSidebar}
        {siteColumn}
      </div>
    </WorkspaceShellProvider>
  );
}
