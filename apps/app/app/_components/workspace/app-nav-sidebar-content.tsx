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
  "h-full min-h-0 w-full min-w-0 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-viewport]]:[scrollbar-width:none] [&_[data-slot=scroll-area-viewport]::-webkit-scrollbar]:hidden [&_[data-slot=scroll-area-viewport]>div]:box-border [&_[data-slot=scroll-area-viewport]>div]:w-full [&_[data-slot=scroll-area-viewport]>div]:max-w-full [&_[data-slot=scroll-area-viewport]>div]:min-w-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden";

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
            "box-border w-full min-w-0 max-w-full overflow-x-hidden",
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
