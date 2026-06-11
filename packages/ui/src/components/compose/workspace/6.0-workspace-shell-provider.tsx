"use client";

import { SidebarProvider } from "../../ui-shadcn/sidebar";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export type WorkspaceShellProviderProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  enableSidebarKeyboardShortcut?: boolean;
  sidebarWidth?: string;
  style?: CSSProperties;
};

export function WorkspaceShellProvider({
  children,
  className,
  defaultOpen = true,
  enableSidebarKeyboardShortcut = true,
  sidebarWidth,
  style,
}: WorkspaceShellProviderProps): ReactElement {
  return (
    <SidebarProvider
      className={className}
      defaultOpen={defaultOpen}
      enableKeyboardShortcut={enableSidebarKeyboardShortcut}
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
