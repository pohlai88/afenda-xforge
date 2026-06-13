"use client";

import { Sidebar, SidebarProvider } from "@repo/ui";
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
import { WorkspaceAuditEvidenceDockedLayout } from "./audit-evidence/workspace-audit-evidence-docked-layout.tsx";
import { WorkspaceAuditEvidenceShell } from "./audit-evidence/workspace-audit-evidence-shell.tsx";
import {
  APP_SIDEBAR_BEHAVIOR_STORAGE_KEY,
  SITE_SIDEBAR_BEHAVIOR_STORAGE_KEY,
} from "./sidebar-behavior.constants.ts";
import {
  SidebarControlProvider,
  SidebarHoverController,
} from "./sidebar-control-provider.tsx";
import {
  APP_NAV_SIDEBAR_SHELL_CLASS,
  SITE_CONTENT_SHELL_CLASS,
  SITE_LEFT_SIDEBAR_PROVIDER_CLASS,
  SITE_LEFT_SIDEBAR_SHELL_CLASS,
} from "./workspace-shell.classes.ts";

type WorkspaceFrameProps = {
  appNavTopbar?: WorkspaceAppNavTopbarProps;
  appSidebar: ReactNode;
  appSidebarClassName?: string;
  appSidebarCollapsible?: ComponentProps<
    typeof WorkspaceAppSidebar
  >["collapsible"];
  appSidebarVariant?: ComponentProps<typeof WorkspaceAppSidebar>["variant"];
  appSidebarWidth?: string;
  appSidebarWrapper?: (appSidebar: ReactNode) => ReactNode;
  auditEvidenceScopeSync?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  contentPadded?: boolean;
  defaultOpen?: boolean;
  enableSidebarKeyboardShortcut?: boolean;
  siteSidebarLeft?: ReactNode;
  siteTopbar: ReactNode;
};

const workspaceBodyBelowAppTopbarClass =
  "[--workspace-app-topbar-height:var(--workspace-app-nav-topbar-height,2.75rem)] [&>[data-slot=sidebar]_[data-slot=sidebar-container]]:top-[var(--workspace-app-topbar-height)] [&>[data-slot=sidebar]_[data-slot=sidebar-container]]:h-[calc(100svh-var(--workspace-app-topbar-height))]";

/** Site column — unified bg-background, no trailing hairline. */
const workspaceSiteContentShellClass = cn(
  "border-e-0",
  SITE_CONTENT_SHELL_CLASS
);

const SITE_LEFT_SIDEBAR_COOKIE = "site_staging_sidebar_state";

function WorkspaceSiteLeftSidebarLayout({
  children,
  siteSidebarLeft,
  siteTopbar,
}: {
  children: ReactNode;
  siteSidebarLeft: ReactNode;
  siteTopbar: ReactNode;
}): ReactElement {
  return (
    <SidebarProvider
      className={cn(SITE_LEFT_SIDEBAR_PROVIDER_CLASS)}
      cookieName={SITE_LEFT_SIDEBAR_COOKIE}
      enableKeyboardShortcut={false}
      style={{ "--sidebar-width": "17rem" } as CSSProperties}
    >
      <SidebarControlProvider storageKey={SITE_SIDEBAR_BEHAVIOR_STORAGE_KEY}>
        <SidebarHoverController containerSelector="[data-slot=workspace-site-content-body] > [data-slot=sidebar]" />
        {siteTopbar}
        <div
          className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          data-slot="workspace-site-content-body"
        >
          <Sidebar
            className={SITE_LEFT_SIDEBAR_SHELL_CLASS}
            collapsible="icon"
            variant="inset"
          >
            {siteSidebarLeft}
          </Sidebar>
          {children}
        </div>
      </SidebarControlProvider>
    </SidebarProvider>
  );
}

export function WorkspaceFrame({
  appNavTopbar,
  appSidebar,
  appSidebarClassName,
  appSidebarCollapsible = "offcanvas",
  appSidebarVariant = "inset",
  appSidebarWidth = WORKSPACE_SHELL_SIDEBAR_WIDTH,
  appSidebarWrapper,
  auditEvidenceScopeSync,
  children,
  className,
  contentClassName,
  contentPadded = false,
  defaultOpen = true,
  enableSidebarKeyboardShortcut = true,
  siteSidebarLeft,
  siteTopbar,
}: WorkspaceFrameProps): ReactElement {
  const appSidebarNode = (
    <WorkspaceAppSidebar
      className={cn(APP_NAV_SIDEBAR_SHELL_CLASS, appSidebarClassName)}
      collapsible={appSidebarCollapsible}
      variant={appSidebarVariant}
    >
      {appSidebar}
    </WorkspaceAppSidebar>
  );

  const resolvedAppSidebar = appSidebarWrapper
    ? appSidebarWrapper(appSidebarNode)
    : appSidebarNode;

  const siteMain = (
    <WorkspaceSiteContent className={contentClassName} padded={contentPadded}>
      {children}
    </WorkspaceSiteContent>
  );

  const siteBody = auditEvidenceScopeSync ? (
    <WorkspaceAuditEvidenceDockedLayout>
      {siteMain}
    </WorkspaceAuditEvidenceDockedLayout>
  ) : (
    siteMain
  );

  const siteColumnBody = siteSidebarLeft ? (
    <WorkspaceNavSiteContent className={workspaceSiteContentShellClass}>
      <WorkspaceSiteLeftSidebarLayout
        siteSidebarLeft={siteSidebarLeft}
        siteTopbar={siteTopbar}
      >
        {siteBody}
      </WorkspaceSiteLeftSidebarLayout>
    </WorkspaceNavSiteContent>
  ) : (
    <WorkspaceNavSiteContent className={workspaceSiteContentShellClass}>
      {siteTopbar}
      <div
        className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
        data-slot="workspace-site-content-body"
      >
        {siteBody}
      </div>
    </WorkspaceNavSiteContent>
  );

  const siteColumn = auditEvidenceScopeSync ? (
    <WorkspaceAuditEvidenceShell scopeSync={auditEvidenceScopeSync}>
      {siteColumnBody}
    </WorkspaceAuditEvidenceShell>
  ) : (
    siteColumnBody
  );

  if (!appNavTopbar) {
    return (
      <WorkspaceShellProvider
        className={cn("h-svh overflow-hidden", className)}
        defaultOpen={defaultOpen}
        enableSidebarKeyboardShortcut={enableSidebarKeyboardShortcut}
        sidebarWidth={appSidebarWidth}
      >
        <SidebarControlProvider storageKey={APP_SIDEBAR_BEHAVIOR_STORAGE_KEY}>
          <SidebarHoverController containerSelector='[data-slot="sidebar-container"]' />
          {resolvedAppSidebar}
          {siteColumn}
        </SidebarControlProvider>
      </WorkspaceShellProvider>
    );
  }

  return (
    <WorkspaceShellProvider
      className={cn("flex h-svh flex-col overflow-hidden", className)}
      defaultOpen={defaultOpen}
      enableSidebarKeyboardShortcut={enableSidebarKeyboardShortcut}
      sidebarWidth={appSidebarWidth}
      style={
        {
          "--workspace-app-nav-topbar-height": WORKSPACE_APP_NAV_TOPBAR_HEIGHT,
        } as CSSProperties
      }
    >
      <SidebarControlProvider storageKey={APP_SIDEBAR_BEHAVIOR_STORAGE_KEY}>
        <SidebarHoverController containerSelector="[data-slot=workspace-body] > [data-slot=sidebar]" />
        <WorkspaceAppNavTopbar {...appNavTopbar} />
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 overflow-hidden",
            workspaceBodyBelowAppTopbarClass
          )}
          data-slot="workspace-body"
        >
          {resolvedAppSidebar}
          {siteColumn}
        </div>
      </SidebarControlProvider>
    </WorkspaceShellProvider>
  );
}
