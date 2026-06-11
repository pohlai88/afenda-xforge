import type { ComposeRenderablePatternSpec } from "../compose.contract";

import { WorkspaceAppNavTopbarPattern } from "./1.1-workspace-app-nav-topbar-pattern";
import { WorkspaceAppSidebarRailPattern } from "./2.1-workspace-app-sidebar-rail-pattern";
import { WorkspaceSiteChromePattern } from "./3.2-workspace-site-chrome-pattern";
import { WorkspaceContextSwitchersPattern } from "./5.6-workspace-nav-context-switchers-pattern";
import { WorkspaceFullShell } from "./7.0-workspace-full-shell-pattern";

export const workspacePatternCatalog = [
  {
    name: "full-shell",
    title: "Full Shell",
    description:
      "Complete workspace chrome: app topbar, sidebar rail, site topbar, and content canvas.",
    component: WorkspaceFullShell,
  },
  {
    name: "app-nav-topbar",
    title: "App Nav Topbar",
    description: "Multi-scope breadcrumb switchers for tenant context.",
    component: WorkspaceAppNavTopbarPattern,
  },
  {
    name: "sidebar-rail",
    title: "Sidebar Rail",
    description: "Module navigation, feature shortcuts, and nav user footer.",
    component: WorkspaceAppSidebarRailPattern,
  },
  {
    name: "context-switchers",
    title: "Context Switchers",
    description: "Team switcher and stacked org/dept/team/proj switchers.",
    component: WorkspaceContextSwitchersPattern,
  },
  {
    name: "site-chrome",
    title: "Site Chrome",
    description: "Site topbar and padded content region.",
    component: WorkspaceSiteChromePattern,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type WorkspacePatternName =
  (typeof workspacePatternCatalog)[number]["name"];

export const workspacePatternCount = workspacePatternCatalog.length;

export const workspacePatternNames = workspacePatternCatalog.map(
  (pattern) => pattern.name,
) as WorkspacePatternName[];
