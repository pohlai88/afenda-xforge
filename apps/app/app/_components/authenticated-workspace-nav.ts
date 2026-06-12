import {
  AppWindow,
  BarChart3,
  Bot,
  Briefcase,
  Building,
  Building2,
  Cpu,
  FileText,
  Grid2x2,
  Keyboard,
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
  items: [],
};

export const AUTHENTICATED_INFRASTRUCTURE_LINKS: WorkspaceNavGroup = {
  label: "Infrastructure",
  items: [
    {
      href: "/infrastructure/lynx",
      icon: Cpu,
      label: "Lynx",
      featureId: "workspace.infrastructure.lynx",
      description: "The machine — reasoning and evidence",
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

/** App nav sidebar — three metadata blocks only. */
export const AUTHENTICATED_SIDEBAR_NAV_GROUPS = [
  AUTHENTICATED_ORBIT_NAV,
  AUTHENTICATED_INFRASTRUCTURE_LINKS,
  AUTHENTICATED_RESOURCES_NAV,
] as const;

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

/** Orbit route for feature scope when workload block is active. */
export const AUTHENTICATED_ORBIT_ROUTE = {
  href: "/orbit",
  icon: Grid2x2,
  label: "The Orbit",
  featureId: "workspace.orbit",
} as const;

export const AUTHENTICATED_MATRIX_ROUTE = {
  href: "/infrastructure/matrix",
  icon: Grid2x2,
  label: "Eisenhower matrix",
  featureId: "workspace.infrastructure.matrix",
} as const;

/** All routable surfaces for feature scope resolution (includes routes not on the sidebar). */
export const AUTHENTICATED_NAV_GROUPS = [
  ...AUTHENTICATED_SIDEBAR_NAV_GROUPS,
  {
    label: "Routes",
    items: [
      AUTHENTICATED_ORBIT_ROUTE,
      AUTHENTICATED_MATRIX_ROUTE,
      ...AUTHENTICATED_WORKSPACE_NAV.items,
      ...AUTHENTICATED_SETTINGS_NAV.items,
    ],
  },
] as const;

export const AUTHENTICATED_NAV_ITEMS = AUTHENTICATED_NAV_GROUPS.flatMap(
  (group) => group.items
);

export const AUTHENTICATED_DEFAULT_FEATURE_ID = "workspace.orbit";
