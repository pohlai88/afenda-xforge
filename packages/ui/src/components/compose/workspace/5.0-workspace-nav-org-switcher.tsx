"use client";

import type { ReactElement } from "react";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import { WorkspaceNavContextSwitcher } from "./5.7-workspace-nav-context-switcher.tsx";

export type WorkspaceNavOrgSwitcherProps = Omit<
  WorkspaceNavContextSwitcherProps,
  "scope"
>;

export function WorkspaceNavOrgSwitcher(
  props: WorkspaceNavOrgSwitcherProps,
): ReactElement | null {
  return <WorkspaceNavContextSwitcher scope="organization" {...props} />;
}
