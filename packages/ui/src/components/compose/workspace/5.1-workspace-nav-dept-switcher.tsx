"use client";

import type { ReactElement } from "react";

import {
  WorkspaceNavContextSwitcher,
  type WorkspaceNavContextSwitcherProps,
} from "./5.7-workspace-nav-context-switcher.tsx";

export type WorkspaceNavDeptSwitcherProps = Omit<
  WorkspaceNavContextSwitcherProps,
  "scope"
>;

export function WorkspaceNavDeptSwitcher(
  props: WorkspaceNavDeptSwitcherProps
): ReactElement | null {
  return <WorkspaceNavContextSwitcher scope="department" {...props} />;
}
