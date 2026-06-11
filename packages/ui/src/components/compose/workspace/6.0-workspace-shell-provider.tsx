"use client";

import { SidebarProvider } from "../../ui-shadcn/sidebar";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export type WorkspaceShellProviderProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  sidebarWidth?: string;
  style?: CSSProperties;
};

export function WorkspaceShellProvider({
  children,
  className,
  defaultOpen = true,
  sidebarWidth,
  style,
}: WorkspaceShellProviderProps): ReactElement {
  return (
    <SidebarProvider
      className={className}
      defaultOpen={defaultOpen}
      style={
        sidebarWidth
          ? ({
              "--sidebar-width": sidebarWidth,
              ...style,
            } as CSSProperties)
          : style
      }
    >
      {children}
    </SidebarProvider>
  );
}
