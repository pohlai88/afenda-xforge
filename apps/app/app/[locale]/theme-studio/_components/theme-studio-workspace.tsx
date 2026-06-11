"use client";

import { WorkspaceNavSiteTopbar } from "@repo/ui/components/compose/workspace";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { AppNavTopbarActions } from "../../../_components/workspace/app-nav-topbar-actions.tsx";
import { AppNavTopbarThemeToggle } from "../../../_components/workspace/app-nav-topbar-theme-toggle.tsx";
import { WorkspaceFrame } from "../../../_components/workspace/workspace-frame.tsx";
import {
  THEME_STUDIO_DEPARTMENTS,
  THEME_STUDIO_ORGANIZATIONS,
  THEME_STUDIO_PROJECTS,
  THEME_STUDIO_TEAMS,
} from "./theme-studio-rail.constants.ts";
import { ThemeStudioRailSidebar } from "./theme-studio-rail-sidebar.tsx";
import {
  isThemeStudioPathActive,
  THEME_STUDIO_PAGES,
} from "./theme-studio-routes.ts";

type ThemeStudioWorkspaceProps = {
  children: ReactNode;
};

export function ThemeStudioWorkspace({
  children,
}: ThemeStudioWorkspaceProps): ReactElement {
  const pathname = usePathname();
  const activePage = THEME_STUDIO_PAGES.find((page) =>
    isThemeStudioPathActive(pathname, page.href)
  );

  return (
    <WorkspaceFrame
      appNavTopbar={{
        actions: (
          <AppNavTopbarActions
            themeMenu={<AppNavTopbarThemeToggle />}
            userName="Preview User"
          />
        ),
        switchers: [
          {
            defaultOptionId: THEME_STUDIO_ORGANIZATIONS[0]?.id,
            options: THEME_STUDIO_ORGANIZATIONS,
            scope: "organization",
          },
          {
            defaultOptionId: THEME_STUDIO_DEPARTMENTS[0]?.id,
            options: THEME_STUDIO_DEPARTMENTS,
            scope: "department",
          },
          {
            defaultOptionId: THEME_STUDIO_TEAMS[0]?.id,
            options: THEME_STUDIO_TEAMS,
            scope: "team",
          },
          {
            defaultOptionId: THEME_STUDIO_PROJECTS[0]?.id,
            options: THEME_STUDIO_PROJECTS,
            scope: "project",
          },
        ],
      }}
      sidebar={<ThemeStudioRailSidebar />}
      topBar={
        <WorkspaceNavSiteTopbar
          scopeLabel="WORKSPACE RAIL"
          title={activePage?.label ?? "Preview pages"}
        />
      }
    >
      {children}
    </WorkspaceFrame>
  );
}
