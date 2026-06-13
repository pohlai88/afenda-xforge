import {
  AppWindow,
  BarChart3,
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
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { APP_SIDEBAR_NAV_GROUP_LABELS } from "./app-sidebar-metadata.labels.ts";
import type { WorkspaceNavGroup, WorkspaceNavItem } from "./types.ts";

export type WorkspaceAppSurfaceVisibility =
  | "primary"
  | "secondary"
  | "utility"
  | "internal";

export type WorkspaceAppSurfaceGroup =
  | "Apps"
  | "Governance"
  | "HR"
  | "Infrastructure"
  | "Resources"
  | "Settings"
  | "Workspace";

export type WorkspaceAppSurface = Omit<WorkspaceNavItem, "children"> & {
  group: WorkspaceAppSurfaceGroup;
  visibility: WorkspaceAppSurfaceVisibility;
  children?: readonly WorkspaceAppSurface[];
};

export type WorkspaceAppRouteExemption = {
  href: string;
  reason: "detail-route" | "redirect-only" | "scaffold-only" | "internal";
};

export const WORKSPACE_APP_SURFACES = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    featureId: "system-admin.overview",
    description: "Daily operating overview for active workspace work.",
    group: "Workspace",
    visibility: "primary",
  },
  {
    href: "/infrastructure/lynx",
    icon: Cpu,
    label: "Infrastructure",
    featureId: "workspace.infrastructure.lynx",
    description: "Reasoning, evidence, integrations, portal, and risk review.",
    availability: "scaffold",
    group: "Infrastructure",
    visibility: "primary",
    children: [
      {
        href: "/infrastructure/lynx",
        icon: Cpu,
        label: "Lynx",
        featureId: "workspace.infrastructure.lynx",
        description: "The machine layer for reasoning and evidence.",
        availability: "scaffold",
        group: "Infrastructure",
        visibility: "secondary",
      },
      {
        href: "/infrastructure/integration",
        icon: Link2,
        label: "Integration",
        featureId: "workspace.infrastructure.integration",
        description: "Review connected systems, handoffs, and sync health.",
        availability: "scaffold",
        group: "Infrastructure",
        visibility: "secondary",
      },
      {
        href: "/infrastructure/business-analysis",
        icon: BarChart3,
        label: "Business analysis",
        featureId: "workspace.infrastructure.business-analysis",
        description: "Inspect operational patterns and decision evidence.",
        availability: "scaffold",
        group: "Infrastructure",
        visibility: "secondary",
      },
      {
        href: "/infrastructure/portal",
        icon: AppWindow,
        label: "Portal",
        featureId: "workspace.infrastructure.portal",
        description: "Access workspace portal surfaces and entry points.",
        availability: "scaffold",
        group: "Infrastructure",
        visibility: "secondary",
      },
      {
        href: "/audit",
        icon: ScrollText,
        label: "Audit",
        featureId: "system-admin.audit",
        description:
          "Review risk, leakage, evidence, and unresolved operational exposure.",
        group: "Governance",
        visibility: "secondary",
      },
    ],
  },
  {
    href: "/resources/organization",
    icon: Building2,
    label: "Resources",
    featureId: "workspace.resources.organization",
    description: "Organization, department, team, press, and career surfaces.",
    availability: "scaffold",
    group: "Resources",
    visibility: "primary",
    children: [
      {
        href: "/resources/organization",
        icon: Building2,
        label: "My organization",
        featureId: "workspace.resources.organization",
        description: "View organization-level workspace resources.",
        availability: "scaffold",
        group: "Resources",
        visibility: "secondary",
      },
      {
        href: "/resources/department",
        icon: Building,
        label: "My department",
        featureId: "workspace.resources.department",
        description: "View department resources and operating context.",
        availability: "scaffold",
        group: "Resources",
        visibility: "secondary",
      },
      {
        href: "/resources/team",
        icon: Users,
        label: "My team",
        featureId: "workspace.resources.team",
        description: "View team resources and collaboration context.",
        availability: "scaffold",
        group: "Resources",
        visibility: "secondary",
      },
      {
        href: "/resources/press",
        icon: Newspaper,
        label: "Press",
        featureId: "workspace.resources.press",
        description: "Review press and public communication resources.",
        availability: "scaffold",
        group: "Resources",
        visibility: "secondary",
      },
      {
        href: "/resources/career",
        icon: Briefcase,
        label: "Career",
        featureId: "workspace.resources.career",
        description: "Review career and hiring-facing resources.",
        availability: "scaffold",
        group: "Resources",
        visibility: "secondary",
      },
    ],
  },
  {
    href: "/hr/documents",
    icon: FileText,
    label: "Documents Management",
    featureId: "hr-suite.employee-management.documents-management",
    description: "Manage HR documents, uploads, and employee evidence.",
    group: "HR",
    visibility: "primary",
    children: [
      {
        href: "/hr",
        icon: Users,
        label: "Overview",
        featureId: "hr-suite.employee-management.documents-management",
        description: "Documents Management overview and route entry.",
        group: "HR",
        visibility: "secondary",
      },
    ],
  },
  {
    href: "/orbit",
    icon: Grid2x2,
    label: "Orbit",
    featureId: "workspace.orbit",
    description: "Canonical map of declared app surfaces and availability.",
    availability: "scaffold",
    group: "Workspace",
    visibility: "secondary",
  },
  {
    href: "/infrastructure/matrix",
    icon: Grid2x2,
    label: "Eisenhower matrix",
    featureId: "workspace.infrastructure.matrix",
    description: "Expanded personal pressure review for captured work traces.",
    group: "Workspace",
    visibility: "secondary",
  },
  {
    href: "/assistant",
    icon: Search,
    label: "Assistant",
    featureId: "workspace.assistant",
    description: "Ask for workspace help, retrieval, and guided action.",
    group: "Workspace",
    visibility: "utility",
  },
  {
    href: "/settings/appearance",
    icon: Palette,
    label: "Settings",
    featureId: "system-admin.tenant-settings",
    description: "Personal workspace appearance settings.",
    group: "Settings",
    visibility: "utility",
    children: [
      {
        href: "/settings/appearance",
        icon: Palette,
        label: "My appearance",
        featureId: "system-admin.tenant-settings",
        description: "Personal workspace appearance settings.",
        group: "Settings",
        visibility: "utility",
      },
      {
        href: "/admin/branding",
        icon: Sparkles,
        label: "Tenant branding",
        featureId: "system-admin.tenant-settings",
        description: "Govern tenant-facing branding and presentation.",
        group: "Settings",
        visibility: "utility",
      },
      {
        href: "/admin/keyboard-shortcuts",
        icon: Keyboard,
        label: "Keyboard shortcuts",
        featureId: "system-admin.tenant-settings",
        description: "Review and configure workspace command shortcuts.",
        group: "Settings",
        visibility: "utility",
      },
    ],
  },
] as const satisfies readonly WorkspaceAppSurface[];

export const WORKSPACE_APP_ROUTE_EXEMPTIONS = [
  {
    href: "/hr/documents/[documentId]",
    reason: "detail-route",
  },
] as const satisfies readonly WorkspaceAppRouteExemption[];

export const WORKSPACE_APP_PRIMARY_SURFACES = WORKSPACE_APP_SURFACES.filter(
  (surface) => surface.visibility === "primary"
);

export const WORKSPACE_APP_SIDEBAR_NAV_GROUP: WorkspaceNavGroup = {
  label: "Apps",
  items: WORKSPACE_APP_PRIMARY_SURFACES,
};

export function flattenWorkspaceAppSurfaces(
  surfaces: readonly WorkspaceAppSurface[] = WORKSPACE_APP_SURFACES
): WorkspaceAppSurface[] {
  return surfaces.flatMap((surface) => [
    surface,
    ...flattenWorkspaceAppSurfaces(surface.children ?? []),
  ]);
}

export const WORKSPACE_APP_NAVIGATION_SURFACES = Array.from(
  new Map(
    flattenWorkspaceAppSurfaces()
      .filter((surface) => surface.visibility !== "internal")
      .map((surface) => [surface.href, surface])
  ).values()
);

export const WORKSPACE_APP_LIVE_NAVIGATION_SURFACES =
  WORKSPACE_APP_NAVIGATION_SURFACES.filter(
    (surface) => surface.availability !== "scaffold"
  );

function surfacesForGroup(
  group: WorkspaceAppSurfaceGroup
): readonly WorkspaceAppSurface[] {
  return WORKSPACE_APP_NAVIGATION_SURFACES.filter(
    (surface) => surface.group === group
  );
}

function rootSurfacesForGroup(
  group: WorkspaceAppSurfaceGroup
): readonly WorkspaceAppSurface[] {
  return WORKSPACE_APP_SURFACES.filter((surface) => surface.group === group);
}

function uniqueSidebarItems(
  items: readonly WorkspaceAppSurface[]
): readonly WorkspaceAppSurface[] {
  return Array.from(new Map(items.map((item) => [item.href, item])).values());
}

export const WORKSPACE_APP_SIDEBAR_NAV_GROUPS = [
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.workspace,
    items: uniqueSidebarItems(surfacesForGroup("Workspace")),
  },
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.infrastructure,
    items: uniqueSidebarItems(
      surfacesForGroup("Infrastructure").filter(
        (surface) => surface.label !== "Infrastructure"
      )
    ),
  },
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.governance,
    items: surfacesForGroup("Governance"),
  },
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.resources,
    items: uniqueSidebarItems(
      surfacesForGroup("Resources").filter(
        (surface) => surface.label !== "Resources"
      )
    ),
  },
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.hr,
    items: rootSurfacesForGroup("HR"),
  },
  {
    label: APP_SIDEBAR_NAV_GROUP_LABELS.settings,
    items: surfacesForGroup("Settings"),
  },
] as const satisfies readonly WorkspaceNavGroup[];

export const WORKSPACE_APP_DECLARED_AUTHENTICATED_HREFS = new Set(
  WORKSPACE_APP_NAVIGATION_SURFACES.map((surface) => surface.href)
);

export const WORKSPACE_APP_SURFACE_GROUPS = [
  "Workspace",
  "Infrastructure",
  "Governance",
  "Resources",
  "HR",
  "Settings",
] as const satisfies readonly WorkspaceAppSurfaceGroup[];
