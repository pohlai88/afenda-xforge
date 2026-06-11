"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../../../lib/utils";
import {
  WORKSPACE_CONTENT_SPACE,
  WORKSPACE_SHELL_SPACE,
} from "./6.1-workspace-shell.typography.ts";

type WorkspaceSiteContentProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function WorkspaceSiteContent({
  children,
  className,
  padded = false,
}: WorkspaceSiteContentProps): ReactElement {
  return (
    <div
      className={cn(
        "min-h-0 min-w-0 w-full max-w-none flex-1",
        WORKSPACE_SHELL_SPACE.contentRoot,
        WORKSPACE_SHELL_SPACE.siteInsetX,
        padded && cn("flex flex-col", WORKSPACE_CONTENT_SPACE.sectionGap),
        className,
      )}
      data-slot="workspace-site-content"
    >
      {children}
    </div>
  );
}
