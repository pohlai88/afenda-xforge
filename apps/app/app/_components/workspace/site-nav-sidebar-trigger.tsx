"use client";

import { WORKSPACE_SHELL_SPACE } from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { SidebarIconControl } from "./sidebar-icon-control.tsx";

export function SiteNavSidebarTrigger(): ReactElement {
  return (
    <SidebarIconControl
      className={cn(
        WORKSPACE_SHELL_SPACE.iconButton,
        "shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
      menuLabel="Site sidebar"
    />
  );
}
