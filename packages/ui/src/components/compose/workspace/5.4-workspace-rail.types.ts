import type { ElementType, ReactNode } from "react";

/** Organization → department → team → project context scopes. */
export type WorkspaceNavContextScope =
  | "department"
  | "organization"
  | "project"
  | "team";

export type WorkspaceNavContextOption = {
  id: string;
  logo?: ElementType<{ className?: string }>;
  name: string;
  subtitle: string;
};

export type WorkspaceNavTreeNode = {
  badge?: ReactNode;
  children?: string[];
  href?: string;
  icon?: ReactNode;
  id: string;
  label: string;
};

export type WorkspaceNavTreeData = Record<string, WorkspaceNavTreeNode>;

export const WORKSPACE_NAV_CONTEXT_LABELS: Record<
  WorkspaceNavContextScope,
  string
> = {
  department: "Departments",
  organization: "Organizations",
  project: "Projects",
  team: "Teams",
};

/** Singular scope indicator shown above each app topbar switcher value. */
export const WORKSPACE_NAV_CONTEXT_SCOPE_INDICATORS: Record<
  WorkspaceNavContextScope,
  string
> = {
  department: "Department",
  organization: "Organization",
  project: "Project",
  team: "Team",
};

export type WorkspaceNavTeam = {
  id: string;
  logo?: ElementType<{ className?: string }>;
  name: string;
  plan: string;
};
