export const systemAdminOverviewSectionDefinition = {
  description: "Tenant-scoped control-plane status and governance warnings.",
  domain: "overview",
  id: "system-admin.overview",
  requiredPermission: "system-admin.overview.read",
  status: "ready",
  title: "Overview",
} as const;

export const systemAdminOverviewFilterOption = {
  label: "Overview",
  value: "overview",
} as const;
