import type { WorkspaceNavGroup } from "./workspace/types.ts";

export const AUTHENTICATED_PRIMARY_NAV: WorkspaceNavGroup = {
  label: "Modules",
  items: [
    {
      href: "/dashboard",
      label: "Dashboard",
      featureId: "system-admin.overview",
    },
    {
      href: "/assistant",
      label: "Assistant",
      featureId: "system-admin.overview",
    },
    {
      href: "/audit",
      label: "Audit",
      featureId: "system-admin.audit",
    },
    {
      href: "/hr",
      label: "HR hub",
      featureId: "hr-suite.employee-management.documents-management",
    },
    {
      href: "/hr/documents",
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
      label: "My appearance",
      featureId: "system-admin.tenant-settings",
    },
    {
      href: "/admin/branding",
      label: "Tenant branding",
      featureId: "system-admin.tenant-settings",
    },
    {
      href: "/admin/keyboard-shortcuts",
      label: "Keyboard shortcuts",
      featureId: "system-admin.tenant-settings",
    },
  ],
};

export const AUTHENTICATED_NAV_GROUPS = [
  AUTHENTICATED_PRIMARY_NAV,
  AUTHENTICATED_SETTINGS_NAV,
] as const;

export const AUTHENTICATED_NAV_ITEMS = AUTHENTICATED_NAV_GROUPS.flatMap(
  (group) => group.items
);

export const AUTHENTICATED_DEFAULT_FEATURE_ID = "system-admin.overview";
