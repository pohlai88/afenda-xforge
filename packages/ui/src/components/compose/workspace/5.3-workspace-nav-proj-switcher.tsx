"use client";

import type { ReactElement } from "react";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import { WorkspaceNavContextSwitcher } from "./5.7-workspace-nav-context-switcher.tsx";

export type WorkspaceNavProjSwitcherProps = Omit<
  WorkspaceNavContextSwitcherProps,
  "scope"
>;

export function WorkspaceNavProjSwitcher(
  props: WorkspaceNavProjSwitcherProps,
): ReactElement | null {
  return <WorkspaceNavContextSwitcher scope="project" {...props} />;
}
