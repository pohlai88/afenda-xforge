"use client";

import {
  WorkspaceAppSidebarFooter,
  WorkspaceNavUser,
} from "@repo/ui/components/compose/workspace";
import type { ReactElement } from "react";

import { AppNavSidebarContent } from "../../../_components/workspace/app-nav-sidebar-content.tsx";
import {
  WorkspaceSidebarPinnedBlock,
  WorkspaceSidebarScrollBlocks,
} from "../../../_components/workspace/workspace-app-nav-sidebar-blocks.tsx";
import { THEME_STUDIO_DEMO_USER } from "./theme-studio-rail.constants.ts";

export function ThemeStudioRailSidebar(): ReactElement {
  return (
    <>
      <AppNavSidebarContent
        className="gap-0"
        pinned={<WorkspaceSidebarPinnedBlock />}
      >
        <WorkspaceSidebarScrollBlocks />
      </AppNavSidebarContent>

      <WorkspaceAppSidebarFooter>
        <WorkspaceNavUser
          user={{
            avatar: null,
            email: THEME_STUDIO_DEMO_USER.email,
            name: THEME_STUDIO_DEMO_USER.name,
          }}
        />
      </WorkspaceAppSidebarFooter>
    </>
  );
}
