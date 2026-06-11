"use client";

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@repo/ui";
import type { ReactElement } from "react";
import { AuthenticatedCompanySwitcher } from "./authenticated-company-switcher.tsx";
import { AuthenticatedNavUser } from "./authenticated-nav-user.tsx";
import {
  AUTHENTICATED_NAV_GROUPS,
} from "./authenticated-workspace-nav.ts";
import { WorkspaceNavMenu } from "./workspace/workspace-nav-menu.tsx";

export function AuthenticatedSidebar(): ReactElement {
  return (
    <>
      <SidebarHeader className="border-sidebar-border border-b p-2">
        <AuthenticatedCompanySwitcher />
      </SidebarHeader>

      <SidebarContent>
        <WorkspaceNavMenu groups={AUTHENTICATED_NAV_GROUPS} />
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <AuthenticatedNavUser />
      </SidebarFooter>
    </>
  );
}
