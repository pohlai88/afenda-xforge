"use client";

import { WORKSPACE_SHELL_SPACE } from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import { APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP } from "./app-nav-topbar-tooltips.ts";
import { SidebarIconControl } from "./sidebar-icon-control.tsx";

export function AppNavTopbarSidebarTrigger(): ReactElement {
  return (
    <AppNavTopbarIconTooltip
      description={APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP.description}
      title={APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP.title}
    >
      <SidebarIconControl
        className={cn(
          WORKSPACE_SHELL_SPACE.iconButton,
          "shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
        menuLabel="App sidebar"
      />
    </AppNavTopbarIconTooltip>
  );
}
