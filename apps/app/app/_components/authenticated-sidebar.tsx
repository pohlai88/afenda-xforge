"use client";

import { SidebarFooter, SidebarHeader } from "@repo/ui";
import type { ReactElement } from "react";
import { AuthenticatedCompanySwitcher } from "./authenticated-company-switcher.tsx";
import { AuthenticatedNavUser } from "./authenticated-nav-user.tsx";
import { AppNavSidebarContent } from "./workspace/app-nav-sidebar-content.tsx";
import { WorkspaceAppNavSidebarBlocks } from "./workspace/workspace-app-nav-sidebar-blocks.tsx";

export function AuthenticatedSidebar(): ReactElement {
  return (
    <>
      <SidebarHeader className="border-sidebar-border border-b p-2">
        <AuthenticatedCompanySwitcher />
      </SidebarHeader>

      <AppNavSidebarContent className="gap-0">
        <WorkspaceAppNavSidebarBlocks />
      </AppNavSidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <AuthenticatedNavUser />
      </SidebarFooter>
    </>
  );
}
