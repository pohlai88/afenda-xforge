import { Building2, Cpu, FileText, LayoutDashboard, Users } from "lucide-react";
import type { WorkspaceNavGroup } from "./types.ts";

export const WORKSPACE_APP_SIDEBAR_NAV_GROUP: WorkspaceNavGroup = {
  label: "Apps",
  items: [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      featureId: "system-admin.overview",
    },
    {
      href: "/infrastructure/lynx",
      icon: Cpu,
      label: "Infrastructure",
      featureId: "workspace.infrastructure.lynx",
      description: "Workspace infrastructure, reasoning, and evidence.",
    },
    {
      href: "/resources/organization",
      icon: Building2,
      label: "Resources",
      featureId: "workspace.resources.organization",
    },
    {
      href: "/hr",
      icon: Users,
      label: "HR hub",
      featureId: "hr-suite.employee-management.documents-management",
    },
    {
      href: "/hr/documents",
      icon: FileText,
      label: "Documents",
      featureId: "hr-suite.employee-management.documents-management",
    },
  ],
};
