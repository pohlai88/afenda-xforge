"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@repo/ui";
import type { ReactElement } from "react";
import { APP_SIDEBAR_WORKSPACE_SUITE_LABEL } from "./app-sidebar-metadata.labels.ts";
import { AuthenticatedSidebarNavLinks } from "./authenticated-sidebar-nav-links.tsx";
import { AuthenticatedSidebarOrbitTrailBlock } from "./authenticated-sidebar-orbit-trail-block.tsx";
import { AuthenticatedSidebarUtilityActions } from "./authenticated-sidebar-utility-actions.tsx";
import { WORKSPACE_APP_SIDEBAR_NAV_GROUPS } from "./workspace-app-surfaces.ts";
import {
  WORKSPACE_METADATA_GROUP_LABEL_CLASS,
  WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
} from "./workspace-shell.classes.ts";

export function WorkspaceSidebarPinnedBlock(): ReactElement {
  return (
    <SidebarGroup className="min-w-0 p-0">
      <SidebarGroupLabel className={WORKSPACE_METADATA_GROUP_LABEL_CLASS}>
        {APP_SIDEBAR_WORKSPACE_SUITE_LABEL}
      </SidebarGroupLabel>
      <SidebarGroupContent
        className={`min-w-0 ${WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS}`}
      >
        <AuthenticatedSidebarUtilityActions />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function WorkspaceSidebarScrollBlocks(): ReactElement {
  return (
    <div
      className={`flex min-w-0 flex-col py-1 ${WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS}`}
      data-slot="workspace-sidebar-scroll-blocks"
    >
      <AuthenticatedSidebarOrbitTrailBlock />

      {WORKSPACE_APP_SIDEBAR_NAV_GROUPS.map((group) => (
        <SidebarGroup className="min-w-0 p-0" key={group.label}>
          <SidebarGroupLabel className={WORKSPACE_METADATA_GROUP_LABEL_CLASS}>
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent
            className={`min-w-0 ${WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS}`}
          >
            <AuthenticatedSidebarNavLinks items={group.items} />
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}

export function WorkspaceAppNavSidebarBlocks(): ReactElement {
  return (
    <>
      <WorkspaceSidebarPinnedBlock />
      <WorkspaceSidebarScrollBlocks />
    </>
  );
}
