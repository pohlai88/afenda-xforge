"use client";

import { SidebarInset } from "../../ui-shadcn/sidebar";
import { cn } from "../../../lib/utils";
import type { ReactElement, ReactNode } from "react";
import { WORKSPACE_SHELL_BORDER } from "./6.1-workspace-shell.typography.ts";

type WorkspaceNavSiteContentProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceNavSiteContent({
  children,
  className,
}: WorkspaceNavSiteContentProps): ReactElement {
  return (
    <SidebarInset
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden",
        WORKSPACE_SHELL_BORDER.siteContentOuter,
        "md:peer-data-[variant=inset]:me-0 md:peer-data-[variant=inset]:rounded-r-none",
        className
      )}
      data-slot="workspace-nav-site-content"
    >
      {children}
    </SidebarInset>
  );
}
