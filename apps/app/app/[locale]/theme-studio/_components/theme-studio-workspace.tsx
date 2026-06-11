"use client";

import { WorkspaceNavSiteTopbar } from "@repo/ui/components/compose/workspace";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { resolveProductDefaults } from "../../../../lib/workspace-shortcuts/resolve-shortcuts.ts";
import { AppNavTopbarActions } from "../../../_components/workspace/app-nav-topbar-actions.tsx";
import { THEME_STUDIO_NAV_ACTION_GROUPS } from "../../../_components/workspace/app-nav-topbar-nav-actions.demo.ts";
import { AppNavTopbarNotifications } from "../../../_components/workspace/app-nav-topbar-notifications.tsx";
import { AppNavTopbarThemeToggle } from "../../../_components/workspace/app-nav-topbar-theme-toggle.tsx";
import { WorkspaceShortcutsDispatcher } from "../../../_components/workspace/keyboard-shortcuts/keyboard-shortcuts-provider.tsx";
import { useWorkspaceShortcuts } from "../../../_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { WorkspaceFrame } from "../../../_components/workspace/workspace-frame.tsx";
import { WorkspaceShortcutsRoot } from "../../../_components/workspace-shortcuts-root.tsx";
import {
  THEME_STUDIO_DEMO_CONTEXT,
  THEME_STUDIO_DEMO_USER,
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

function ThemeStudioTopbarActions(): ReactElement {
  const { openHelp } = useWorkspaceShortcuts();

  return (
    <AppNavTopbarActions
      navActionGroups={THEME_STUDIO_NAV_ACTION_GROUPS}
      notificationsMenu={
        <AppNavTopbarNotifications
          preview
          tenantId={THEME_STUDIO_DEMO_CONTEXT.tenantId}
          userId={THEME_STUDIO_DEMO_CONTEXT.userId}
        />
      }
      onKeyboardShortcutsClick={openHelp}
      themeMenu={<AppNavTopbarThemeToggle />}
      userEmail={THEME_STUDIO_DEMO_USER.email}
      userName={THEME_STUDIO_DEMO_USER.name}
    />
  );
}

export function ThemeStudioWorkspace({
  children,
}: ThemeStudioWorkspaceProps): ReactElement {
  const pathname = usePathname();
  const activePage = THEME_STUDIO_PAGES.find((page) =>
    isThemeStudioPathActive(pathname, page.href)
  );

  return (
    <WorkspaceShortcutsRoot payload={resolveProductDefaults()}>
      <WorkspaceFrame
        appNavTopbar={{
          actions: <ThemeStudioTopbarActions />,
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
        enableSidebarKeyboardShortcut={false}
        sidebar={<ThemeStudioRailSidebar />}
        topBar={
          <WorkspaceNavSiteTopbar
            scopeLabel="WORKSPACE RAIL"
            title={activePage?.label ?? "Preview pages"}
          />
        }
      >
        <WorkspaceShortcutsDispatcher />
        {children}
      </WorkspaceFrame>
    </WorkspaceShortcutsRoot>
  );
}
