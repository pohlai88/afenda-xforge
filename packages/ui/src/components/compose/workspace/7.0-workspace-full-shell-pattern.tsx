"use client";

import { cn } from "../../../lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui-shadcn/sidebar";
import type { CSSProperties, ReactElement } from "react";

import {
  WorkspaceAppNavTopbar,
  WORKSPACE_APP_NAV_TOPBAR_HEIGHT,
} from "./1.0-workspace-app-nav-topbar.tsx";
import {
  WorkspaceAppSidebar,
  WorkspaceAppSidebarContent,
  WorkspaceAppSidebarFooter,
  WorkspaceAppSidebarHeader,
  WorkspaceSidebarNavMain,
  WorkspaceSidebarNavSecondary,
  WorkspaceSidebarSectionLabel,
} from "./2.0-workspace-app-sidebar.tsx";
import { WorkspaceNavSiteContent } from "./3.0-workspace-site-nav-content.tsx";
import { WorkspaceNavSiteTopbar } from "./3.1-workspace-site-nav-topbar.tsx";
import { WorkspaceSiteContent } from "./3.1-workspace-site-content.tsx";
import { WorkspaceNavUser } from "./4.0-workspace-nav-user.tsx";
import { WorkspaceShellProvider } from "./6.0-workspace-shell-provider.tsx";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "./6.1-workspace-shell.typography.ts";
import { useWorkspaceDemoLinkedNav } from "./7.6-workspace.demo-linked-nav.ts";
import { getWorkspaceDemoUser } from "./7.5-workspace.demo-seed.adapter.ts";
import {
  WORKSPACE_DEMO_FEATURE_ITEMS,
  WORKSPACE_DEMO_NAV_ITEMS,
  WorkspacePatternCard,
} from "./7.3-workspace-pattern.shared.tsx";

const workspaceBodyBelowAppTopbarClass =
  "[--workspace-app-topbar-height:var(--workspace-app-nav-topbar-height,2.75rem)] [&_[data-slot=sidebar-container]]:top-[var(--workspace-app-topbar-height)] [&_[data-slot=sidebar-container]]:h-[calc(100%-var(--workspace-app-topbar-height))]";

export function WorkspaceFullShellFrame({
  className,
}: {
  className?: string;
}): ReactElement {
  const { switchers } = useWorkspaceDemoLinkedNav();

  return (
    <WorkspaceShellProvider
      className={cn(
        "flex min-h-0 flex-col overflow-hidden",
        className ?? "h-svh"
      )}
      style={
        {
          "--workspace-app-nav-topbar-height": WORKSPACE_APP_NAV_TOPBAR_HEIGHT,
        } as CSSProperties
      }
    >
      <WorkspaceAppNavTopbar switchers={switchers} />
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 overflow-hidden",
          workspaceBodyBelowAppTopbarClass
        )}
        data-slot="workspace-body"
      >
        <WorkspaceAppSidebar collapsible="offcanvas" variant="inset">
          <WorkspaceAppSidebarHeader className="pb-2 pt-2">
            <WorkspaceSidebarSectionLabel>Modules</WorkspaceSidebarSectionLabel>
          </WorkspaceAppSidebarHeader>
          <WorkspaceAppSidebarContent className="gap-0 pt-0">
            <WorkspaceSidebarNavMain>
              <div
                className={cn(
                  WORKSPACE_SHELL_SPACE.sidebarLabelGap,
                  WORKSPACE_SHELL_SPACE.navListGap
                )}
              >
                <SidebarMenu>
                  {WORKSPACE_DEMO_NAV_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        className={cn(
                          WORKSPACE_SHELL_SPACE.navRow,
                          item.active
                            ? WORKSPACE_SHELL_TYPE.navItemActive
                            : WORKSPACE_SHELL_TYPE.navItem
                        )}
                        isActive={item.active}
                        type="button"
                      >
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </WorkspaceSidebarNavMain>
            <WorkspaceSidebarNavSecondary label="Features">
              <SidebarMenu>
                {WORKSPACE_DEMO_FEATURE_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      className={cn(
                        WORKSPACE_SHELL_SPACE.navRow,
                        WORKSPACE_SHELL_TYPE.navItem
                      )}
                      type="button"
                    >
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </WorkspaceSidebarNavSecondary>
          </WorkspaceAppSidebarContent>
          <WorkspaceAppSidebarFooter>
            <WorkspaceNavUser user={getWorkspaceDemoUser()} />
          </WorkspaceAppSidebarFooter>
        </WorkspaceAppSidebar>
        <WorkspaceNavSiteContent>
          <WorkspaceNavSiteTopbar
            scopeLabel="SITE"
            title="Dashboard"
          />
          <WorkspaceSiteContent padded>
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
              Linked demo seed — switch org, department, team, or project in the
              app topbar to see child options update from 7.4-workspace.demo-seed.json.
            </div>
          </WorkspaceSiteContent>
        </WorkspaceNavSiteContent>
      </div>
    </WorkspaceShellProvider>
  );
}

export function WorkspaceFullShell(): ReactElement {
  return (
    <WorkspacePatternCard
      description="6.0 provider + linked JSON demo seed (org → department → team → project). Mirrors WorkspaceFrame assembly."
      title="Full workspace shell"
    >
      <div className="overflow-hidden rounded-lg border">
        <WorkspaceFullShellFrame className="h-[720px]" />
      </div>
    </WorkspacePatternCard>
  );
}
