"use client";

import type { ReactElement, ReactNode } from "react";
import { resolveProductDefaults } from "../../../../lib/workspace-shortcuts/resolve-shortcuts.ts";
import { AppNavTopbarActions } from "../../../_components/workspace/app-nav-topbar-actions.tsx";
import { THEME_STUDIO_NAV_ACTION_GROUPS } from "../../../_components/workspace/app-nav-topbar-nav-actions.demo.ts";
import { WorkspaceShortcutsDispatcher } from "../../../_components/workspace/keyboard-shortcuts/keyboard-shortcuts-provider.tsx";
import { useWorkspaceShortcuts } from "../../../_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { WorkspaceFrame } from "../../../_components/workspace/workspace-frame.tsx";
import {
  AppNavTopbarSidebarTrigger,
  AppNavTopbarThemeToggle,
} from "../../../_components/workspace/workspace-topbar-controls.tsx";
import { WorkspaceShortcutsRoot } from "../../../_components/workspace-shortcuts-root.tsx";
import { ThemeStudioAuditScopeSync } from "./theme-studio-audit-scope-sync.tsx";
import { ThemeStudioHrSuiteProvider } from "./theme-studio-hr-suite-context.tsx";
import {
  THEME_STUDIO_DEMO_USER,
  THEME_STUDIO_DEPARTMENTS,
  THEME_STUDIO_ORGANIZATIONS,
  THEME_STUDIO_PROJECTS,
  THEME_STUDIO_TEAMS,
} from "./theme-studio-rail.constants.ts";
import { ThemeStudioRailSidebar } from "./theme-studio-rail-sidebar.tsx";
import { ThemeStudioSiteContentTopbar } from "./theme-studio-site-content-topbar.tsx";
import { ThemeStudioSiteSidebar } from "./theme-studio-site-sidebar.tsx";

type ThemeStudioWorkspaceProps = {
  children: ReactNode;
};

function ThemeStudioTopbarActions(): ReactElement {
  const { openHelp } = useWorkspaceShortcuts();

  return (
    <AppNavTopbarActions
      navActionGroups={THEME_STUDIO_NAV_ACTION_GROUPS}
      onHelpClick={openHelp}
      previewUtilities
      themeMenu={<AppNavTopbarThemeToggle />}
      userEmail={THEME_STUDIO_DEMO_USER.email}
      userName={THEME_STUDIO_DEMO_USER.name}
    />
  );
}

export function ThemeStudioWorkspace({
  children,
}: ThemeStudioWorkspaceProps): ReactElement {
  return (
    <WorkspaceShortcutsRoot payload={resolveProductDefaults()}>
      <ThemeStudioHrSuiteProvider>
        <WorkspaceFrame
          appNavTopbar={{
            actions: <ThemeStudioTopbarActions />,
            sidebarTrigger: <AppNavTopbarSidebarTrigger />,
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
          appSidebar={<ThemeStudioRailSidebar />}
          appSidebarCollapsible="icon"
          auditEvidenceScopeSync={<ThemeStudioAuditScopeSync />}
          contentPadded
          enableSidebarKeyboardShortcut={false}
          siteSidebarLeft={<ThemeStudioSiteSidebar />}
          siteTopbar={<ThemeStudioSiteContentTopbar />}
        >
          <WorkspaceShortcutsDispatcher />
          {children}
        </WorkspaceFrame>
      </ThemeStudioHrSuiteProvider>
    </WorkspaceShortcutsRoot>
  );
}
