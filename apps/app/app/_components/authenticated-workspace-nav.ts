import type { WorkspaceNavGroup, WorkspaceNavItem } from "./workspace/types.ts";
import {
  WORKSPACE_APP_NAVIGATION_SURFACES,
  WORKSPACE_APP_SIDEBAR_NAV_GROUP,
  WORKSPACE_APP_SIDEBAR_NAV_GROUPS,
  WORKSPACE_APP_SURFACES,
} from "./workspace/workspace-app-surfaces.ts";

function findSurface(href: string): WorkspaceNavItem {
  const surface = WORKSPACE_APP_NAVIGATION_SURFACES.find(
    (item) => item.href === href
  );

  if (!surface) {
    throw new Error(`Missing declared app surface: ${href}`);
  }

  return surface;
}

function childrenFor(href: string): readonly WorkspaceNavItem[] {
  const surface = WORKSPACE_APP_SURFACES.find((item) => item.href === href);

  return surface && "children" in surface ? surface.children : [];
}

export const AUTHENTICATED_INFRASTRUCTURE_LINKS: WorkspaceNavGroup = {
  label: "Infrastructure",
  items: childrenFor("/infrastructure/lynx"),
};

export const AUTHENTICATED_RESOURCES_NAV: WorkspaceNavGroup = {
  label: "Resources",
  items: childrenFor("/resources/organization"),
};

export const AUTHENTICATED_APPS_NAV: WorkspaceNavGroup =
  WORKSPACE_APP_SIDEBAR_NAV_GROUP;

/** App nav sidebar — declared visible product surfaces, grouped for scan. */
export const AUTHENTICATED_SIDEBAR_NAV_GROUPS =
  WORKSPACE_APP_SIDEBAR_NAV_GROUPS;

export const AUTHENTICATED_WORKSPACE_NAV: WorkspaceNavGroup = {
  label: "Workspace",
  items: [
    findSurface("/dashboard"),
    findSurface("/hr"),
    findSurface("/hr/documents"),
  ],
};

export const AUTHENTICATED_SETTINGS_NAV: WorkspaceNavGroup = {
  label: "Settings",
  items: childrenFor("/settings/appearance"),
};

export const AUTHENTICATED_ORBIT_ROUTE = findSurface("/orbit");

export const AUTHENTICATED_MATRIX_ROUTE = findSurface("/infrastructure/matrix");

/** All routable authenticated surfaces declared by the app-owned catalog. */
export const AUTHENTICATED_NAV_GROUPS = [
  ...AUTHENTICATED_SIDEBAR_NAV_GROUPS,
  {
    label: "Declared surfaces",
    items: WORKSPACE_APP_NAVIGATION_SURFACES,
  },
] as const;

export const AUTHENTICATED_NAV_ITEMS = WORKSPACE_APP_NAVIGATION_SURFACES;

export const AUTHENTICATED_DEFAULT_FEATURE_ID = "workspace.orbit";
