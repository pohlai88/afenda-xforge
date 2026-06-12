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

const sidebarBodyClass = cn(
  "box-border w-full min-w-0 max-w-full overflow-x-hidden",
  WORKSPACE_SHELL_SPACE.sidebarRoot,
  WORKSPACE_SHELL_TYPE.sidebarRoot
);

type AppNavSidebarContentProps = {
  children: ReactNode;
  className?: string;
  /** Pinned above the scroll region — e.g. workspace utility actions. */
  pinned?: ReactNode;
};

export function AppNavSidebarContent({
  children,
  className,
  pinned,
}: AppNavSidebarContentProps): ReactElement {
  if (!pinned) {
    return (
      <SidebarContent
        className="min-h-0 flex-1 gap-0 overflow-hidden p-0"
        data-slot="app-nav-sidebar-content"
      >
        <ScrollArea className={appNavSidebarScrollAreaClass}>
          <div
            className={cn(
              sidebarBodyClass,
              WORKSPACE_SHELL_SPACE.sidebarSectionGap,
              className
            )}
          >
            {children}
          </div>
        </ScrollArea>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent
      className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0"
      data-slot="app-nav-sidebar-content"
    >
      <div className={cn(sidebarBodyClass, "shrink-0 pb-1")}>{pinned}</div>
      <ScrollArea
        className={cn(appNavSidebarScrollAreaClass, "min-h-0 flex-1")}
      >
        <div
          className={cn(
            sidebarBodyClass,
            WORKSPACE_SHELL_SPACE.sidebarSectionGap,
            className
          )}
        >
          {children}
        </div>
      </ScrollArea>
    </SidebarContent>
  );
}
