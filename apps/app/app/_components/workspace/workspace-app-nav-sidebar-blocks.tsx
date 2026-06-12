"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@repo/ui";
import type { ReactElement } from "react";
import {
  AUTHENTICATED_INFRASTRUCTURE_LINKS,
  AUTHENTICATED_RESOURCES_NAV,
} from "../authenticated-workspace-nav.ts";
import { AuthenticatedSidebarMatrixBlock } from "./authenticated-sidebar-matrix-block.tsx";
import { AuthenticatedSidebarNavLinks } from "./authenticated-sidebar-nav-links.tsx";
import { AuthenticatedSidebarOrbitBlock } from "./authenticated-sidebar-orbit-block.tsx";

export function WorkspaceAppNavSidebarBlocks(): ReactElement {
  return (
    <>
      <SidebarGroup className="min-w-0 p-2">
        <SidebarGroupLabel>The Orbit</SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0">
          <AuthenticatedSidebarOrbitBlock />
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="min-w-0 p-2">
        <SidebarGroupLabel>Infrastructure</SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0 space-y-2">
          <AuthenticatedSidebarMatrixBlock />
          <AuthenticatedSidebarNavLinks
            items={AUTHENTICATED_INFRASTRUCTURE_LINKS.items}
          />
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="min-w-0 p-2">
        <SidebarGroupLabel>Resources</SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0">
          <AuthenticatedSidebarNavLinks
            items={AUTHENTICATED_RESOURCES_NAV.items}
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
