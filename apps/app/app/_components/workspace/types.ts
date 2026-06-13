import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type WorkspaceNavItem = {
  availability?: "live" | "scaffold";
  children?: readonly WorkspaceNavItem[];
  description?: string;
  featureId?: string;
  href: string;
  icon: LucideIcon;
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
