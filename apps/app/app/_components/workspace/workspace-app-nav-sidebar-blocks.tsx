"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@repo/ui";
import type { ReactElement } from "react";
import { AUTHENTICATED_APPS_NAV } from "../authenticated-workspace-nav.ts";
import { AuthenticatedSidebarNavLinks } from "./authenticated-sidebar-nav-links.tsx";
import { AuthenticatedSidebarOrbitTrailBlock } from "./authenticated-sidebar-orbit-trail-block.tsx";
import { AuthenticatedSidebarUtilityActions } from "./authenticated-sidebar-utility-actions.tsx";

const sectionLabelClass =
  "h-4 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50";

export function WorkspaceAppNavSidebarBlocks(): ReactElement {
  return (
    <div className="flex min-w-0 flex-col gap-2 py-1">
      <SidebarGroup className="min-w-0 p-0">
        <SidebarGroupLabel className={sectionLabelClass}>
          The workspace
        </SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0">
          <AuthenticatedSidebarUtilityActions />
        </SidebarGroupContent>
      </SidebarGroup>

      <AuthenticatedSidebarOrbitTrailBlock />

      <SidebarGroup className="min-w-0 p-0">
        <SidebarGroupLabel className={sectionLabelClass}>Apps</SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0">
          <AuthenticatedSidebarNavLinks items={AUTHENTICATED_APPS_NAV.items} />
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
