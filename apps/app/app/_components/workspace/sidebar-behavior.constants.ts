export type SidebarBehaviorMode = "collapsed" | "expanded" | "hover";

export const SIDEBAR_BEHAVIOR_MODES = [
  "expanded",
  "collapsed",
  "hover",
] as const satisfies readonly SidebarBehaviorMode[];

export const SIDEBAR_BEHAVIOR_LABELS: Record<SidebarBehaviorMode, string> = {
  collapsed: "Collapsed",
  expanded: "Expanded",
  hover: "Expand on hover",
};

export const APP_SIDEBAR_BEHAVIOR_STORAGE_KEY = "workspace_app_sidebar_behavior";
export const SITE_SIDEBAR_BEHAVIOR_STORAGE_KEY = "workspace_site_sidebar_behavior";

export const DEFAULT_SIDEBAR_BEHAVIOR_MODE: SidebarBehaviorMode = "expanded";

export function isSidebarBehaviorMode(
  value: string
): value is SidebarBehaviorMode {
  return SIDEBAR_BEHAVIOR_MODES.includes(value as SidebarBehaviorMode);
}

export function readSidebarBehaviorMode(
  storageKey: string
): SidebarBehaviorMode {
  if (typeof window === "undefined") {
    return DEFAULT_SIDEBAR_BEHAVIOR_MODE;
  }

  const stored = window.localStorage.getItem(storageKey);

  if (stored && isSidebarBehaviorMode(stored)) {
    return stored;
  }

  return DEFAULT_SIDEBAR_BEHAVIOR_MODE;
}

export function persistSidebarBehaviorMode(
  storageKey: string,
  mode: SidebarBehaviorMode
): void {
  window.localStorage.setItem(storageKey, mode);
}
