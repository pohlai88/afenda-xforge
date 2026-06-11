import type { ReactNode } from "react";

export type WorkspaceNavItem = {
  description?: string;
  featureId?: string;
  href: string;
  label: string;
};

export type WorkspaceNavGroup = {
  items: readonly WorkspaceNavItem[];
  label: string;
};

export type WorkspaceSidebarSlots = {
  content: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
};

export type WorkspaceTopBarSlots = {
  actions?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};
