"use client";

import { SidebarFooter, SidebarHeader } from "@repo/ui";
import type { ReactElement } from "react";
import { AuthenticatedCompanySwitcher } from "./authenticated-company-switcher.tsx";
import { AuthenticatedNavUser } from "./authenticated-nav-user.tsx";
import { AppNavSidebarContent } from "./workspace/app-nav-sidebar-content.tsx";
import { AuthenticatedSidebarSettingsLink } from "./workspace/authenticated-sidebar-settings-link.tsx";
import {
  WorkspaceSidebarPinnedBlock,
  WorkspaceSidebarScrollBlocks,
} from "./workspace/workspace-app-nav-sidebar-blocks.tsx";

export function AuthenticatedSidebar(): ReactElement {
  return (
    <>
      <SidebarHeader className="p-2">
        <AuthenticatedCompanySwitcher />
      </SidebarHeader>

      <AppNavSidebarContent
        className="gap-0"
        pinned={<WorkspaceSidebarPinnedBlock />}
      >
        <WorkspaceSidebarScrollBlocks />
      </AppNavSidebarContent>

      <SidebarFooter className="gap-2 p-2">
        <AuthenticatedSidebarSettingsLink />
        <AuthenticatedNavUser />
      </SidebarFooter>
    </>
  );
}
