"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactElement, ReactNode } from "react";

import { ThemeStudioShell } from "./theme-studio-shell.tsx";
import { ThemeStudioWorkspace } from "./theme-studio-workspace.tsx";

const WORKSPACE_RAIL_HREF = "/theme-studio/workspace-rail";

function isWorkspaceRailPath(pathname: string): boolean {
  return (
    pathname === WORKSPACE_RAIL_HREF ||
    pathname.startsWith(`${WORKSPACE_RAIL_HREF}/`)
  );
}

type ThemeStudioLayoutShellProps = {
  children: ReactNode;
};

export function ThemeStudioLayoutShell({
  children,
}: ThemeStudioLayoutShellProps): ReactElement {
  const pathname = usePathname();

  if (isWorkspaceRailPath(pathname)) {
    return <ThemeStudioWorkspace>{children}</ThemeStudioWorkspace>;
  }

  return <ThemeStudioShell>{children}</ThemeStudioShell>;
}
