import {
  BarChart3,
  Bot,
  Briefcase,
  Building,
  Building2,
  Cpu,
  FileText,
  Gauge,
  Grid2x2,
  Keyboard,
  AppWindow,
  LayoutDashboard,
  Link2,
  Newspaper,
  Palette,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";
import type { WorkspaceNavGroup } from "./workspace/types.ts";

export const AUTHENTICATED_ORBIT_NAV: WorkspaceNavGroup = {
  label: "The Orbit",
  items: [
    {
      href: "/orbit",
      icon: Gauge,
      label: "The Orbit",
      featureId: "workspace.orbit",
      description: "Today's workload signal",
    },
  ],
};

export const AUTHENTICATED_INFRASTRUCTURE_NAV: WorkspaceNavGroup = {
  label: "Infrastructure",
  items: [
    {
      href: "/infrastructure/matrix",
      icon: Grid2x2,
      label: "Eisenhower matrix",
      featureId: "workspace.infrastructure.matrix",
    },
    {
      href: "/infrastructure/lynx",
      icon: Cpu,
      label: "Lynx",
      featureId: "workspace.infrastructure.lynx",
    },
    {
      href: "/infrastructure/integration",
      icon: Link2,
      label: "Integration",
      featureId: "workspace.infrastructure.integration",
    },
    {
      href: "/audit",
      icon: ScrollText,
      label: "Audit",
      featureId: "system-admin.audit",
    },
    {
      href: "/infrastructure/business-analysis",
      icon: BarChart3,
      label: "Business analysis",
      featureId: "workspace.infrastructure.business-analysis",
    },
    {
      href: "/infrastructure/portal",
      icon: AppWindow,
      label: "Portal",
      featureId: "workspace.infrastructure.portal",
    },
  ],
};

export const AUTHENTICATED_RESOURCES_NAV: WorkspaceNavGroup = {
  label: "Resources",
  items: [
    {
      href: "/resources/organization",
      icon: Building2,
      label: "My organization",
      featureId: "workspace.resources.organization",
    },
    {
      href: "/resources/department",
      icon: Building,
      label: "My department",
      featureId: "workspace.resources.department",
    },
    {
      href: "/resources/team",
      icon: Users,
      label: "My team",
      featureId: "workspace.resources.team",
    },
    {
      href: "/resources/press",
      icon: Newspaper,
      label: "Press",
      featureId: "workspace.resources.press",
    },
    {
      href: "/resources/career",
      icon: Briefcase,
      label: "Career",
      featureId: "workspace.resources.career",
    },
  ],
};

export const AUTHENTICATED_WORKSPACE_NAV: WorkspaceNavGroup = {
  label: "Workspace",
  items: [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      featureId: "system-admin.overview",
    },
    {
      href: "/assistant",
      icon: Bot,
      label: "Assistant",
      featureId: "system-admin.overview",
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

export const AUTHENTICATED_SETTINGS_NAV: WorkspaceNavGroup = {
  label: "Theme",
  items: [
    {
      href: "/settings/appearance",
      icon: Palette,
      label: "My appearance",
      featureId: "system-admin.tenant-settings",
    },
    {
      href: "/admin/branding",
      icon: Sparkles,
      label: "Tenant branding",
      featureId: "system-admin.tenant-settings",
    },
    {
      href: "/admin/keyboard-shortcuts",
      icon: Keyboard,
      label: "Keyboard shortcuts",
      featureId: "system-admin.tenant-settings",
    },
  ],
};

export const AUTHENTICATED_NAV_GROUPS = [
  AUTHENTICATED_ORBIT_NAV,
  AUTHENTICATED_INFRASTRUCTURE_NAV,
  AUTHENTICATED_RESOURCES_NAV,
  AUTHENTICATED_WORKSPACE_NAV,
  AUTHENTICATED_SETTINGS_NAV,
] as const;

export const AUTHENTICATED_NAV_ITEMS = AUTHENTICATED_NAV_GROUPS.flatMap(
  (group) => group.items
);

export const AUTHENTICATED_DEFAULT_FEATURE_ID = "workspace.orbit";
