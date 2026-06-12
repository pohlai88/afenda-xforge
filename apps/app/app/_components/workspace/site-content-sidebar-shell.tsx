"use client";

import { Sidebar, SidebarProvider, SidebarRail } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { SITE_SIDEBAR_BEHAVIOR_STORAGE_KEY } from "./sidebar-behavior.constants.ts";
import {
  SidebarControlProvider,
  SidebarHoverController,
} from "./sidebar-control-provider.tsx";

const SITE_SIDEBAR_COOKIE_NAME = "site_sidebar_state";

/** Keeps nested shadcn Sidebar in document flow inside the site content column. */
const siteSidebarProviderClass =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [&_[data-slot=sidebar-wrapper]]:min-h-0 [&_[data-slot=sidebar-wrapper]]:flex-1 [&_[data-slot=sidebar-container]]:relative [&_[data-slot=sidebar-container]]:top-0 [&_[data-slot=sidebar-container]]:z-0 [&_[data-slot=sidebar-container]]:h-full";

type SiteContentSidebarShellProps = {
  children: ReactNode;
  siteContentSidebar: ReactNode;
  topBar: ReactNode;
};

export function SiteContentSidebarShell({
  children,
  siteContentSidebar,
  topBar,
}: SiteContentSidebarShellProps): ReactElement {
  return (
    <SidebarProvider
      className={cn(siteSidebarProviderClass)}
      cookieName={SITE_SIDEBAR_COOKIE_NAME}
      enableKeyboardShortcut={false}
      style={{ "--sidebar-width": "14rem" } as CSSProperties}
    >
      <SidebarControlProvider storageKey={SITE_SIDEBAR_BEHAVIOR_STORAGE_KEY}>
        <SidebarHoverController containerSelector='[data-slot=workspace-site-content-body] > [data-slot=sidebar]' />
        {topBar}
        <div
          className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          data-slot="workspace-site-content-body"
        >
          <Sidebar collapsible="icon" variant="sidebar">
            {siteContentSidebar}
            <SidebarRail />
          </Sidebar>
          {children}
        </div>
      </SidebarControlProvider>
    </SidebarProvider>
  );
}
