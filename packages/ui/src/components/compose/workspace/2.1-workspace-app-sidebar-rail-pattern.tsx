"use client";

import { cn } from "../../../lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui-shadcn/sidebar";

import {
  WorkspaceAppSidebar,
  WorkspaceAppSidebarContent,
  WorkspaceAppSidebarFooter,
  WorkspaceSidebarNavMain,
  WorkspaceSidebarNavSecondary,
  WorkspaceSidebarSectionLabel,
} from "./2.0-workspace-app-sidebar.tsx";
import { WorkspaceNavUser } from "./4.0-workspace-nav-user.tsx";
import { WorkspaceShellProvider } from "./6.0-workspace-shell-provider.tsx";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "./6.1-workspace-shell.typography.ts";
import {
  WORKSPACE_DEMO_FEATURE_ITEMS,
  WORKSPACE_DEMO_NAV_ITEMS,
  WORKSPACE_DEMO_USER,
  WorkspacePatternCard,
} from "./7.3-workspace-pattern.shared.tsx";

export function WorkspaceAppSidebarRailPattern() {
  return (
    <WorkspacePatternCard
      description="Scrollable sidebar regions with section labels, nav rows, and user footer."
      title="App sidebar rail (2.0 + 4.0)"
    >
      <div className="overflow-hidden rounded-lg border">
        <WorkspaceShellProvider className="h-[520px]">
          <WorkspaceAppSidebar collapsible="none" variant="sidebar">
            <WorkspaceAppSidebarContent className="gap-0 pt-2">
              <WorkspaceSidebarNavMain>
                <WorkspaceSidebarSectionLabel>Modules</WorkspaceSidebarSectionLabel>
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
              <WorkspaceNavUser user={WORKSPACE_DEMO_USER} />
            </WorkspaceAppSidebarFooter>
          </WorkspaceAppSidebar>
        </WorkspaceShellProvider>
      </div>
    </WorkspacePatternCard>
  );
}
