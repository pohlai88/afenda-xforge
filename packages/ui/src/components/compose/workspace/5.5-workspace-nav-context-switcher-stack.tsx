"use client";

import type { ReactElement } from "react";

import { WorkspaceNavContextSwitcher } from "./5.7-workspace-nav-context-switcher.tsx";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";

export type WorkspaceNavContextSwitcherConfig = WorkspaceNavContextSwitcherProps;

type WorkspaceNavContextSwitcherStackProps = {
  switchers: readonly WorkspaceNavContextSwitcherConfig[];
};

export function WorkspaceNavContextSwitcherStack({
  switchers,
}: WorkspaceNavContextSwitcherStackProps): ReactElement {
  return (
    <div className="flex flex-col gap-1" data-slot="workspace-nav-context-stack">
      {switchers.map((switcher, index) => (
        <WorkspaceNavContextSwitcher
          key={`${switcher.scope ?? switcher.menuLabel ?? "switcher"}-${switcher.options[0]?.id ?? index}`}
          {...switcher}
        />
      ))}
    </div>
  );
}
