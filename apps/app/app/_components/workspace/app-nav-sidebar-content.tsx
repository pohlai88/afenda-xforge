"use client";

import { ScrollArea, SidebarContent } from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** App nav sidebar only — no horizontal scroll; quiet vertical rail. */
const appNavSidebarScrollAreaClass =
  "h-full min-h-0 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:border-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:bg-transparent [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:opacity-0 hover:[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:opacity-100 [&_[data-slot=scroll-area-thumb]]:bg-border/25 hover:[&_[data-slot=scroll-area-thumb]]:bg-border/45";

type AppNavSidebarContentProps = {
  children: ReactNode;
  className?: string;
};

export function AppNavSidebarContent({
  children,
  className,
}: AppNavSidebarContentProps): ReactElement {
  return (
    <SidebarContent
      className="min-h-0 flex-1 gap-0 overflow-hidden p-0"
      data-slot="app-nav-sidebar-content"
    >
      <ScrollArea className={appNavSidebarScrollAreaClass}>
        <div
          className={cn(
            "min-w-0 max-w-full",
            WORKSPACE_SHELL_SPACE.sidebarRoot,
            WORKSPACE_SHELL_SPACE.sidebarSectionGap,
            WORKSPACE_SHELL_TYPE.sidebarRoot,
            className
          )}
        >
          {children}
        </div>
      </ScrollArea>
    </SidebarContent>
  );
}
