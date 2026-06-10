export const systemAdminTenantSettingsSectionDefinition = {
  description: "Governed tenant display and operating settings.",
  domain: "tenant-settings",
  id: "system-admin.tenant-settings",
  requiredPermission: "system-admin.tenant-settings.read",
  status: "ready",
  title: "Tenant Settings",
} as const;

export const systemAdminTenantSettingsFilterOption = {
  label: "Tenant Settings",
  value: "tenant-settings",
} as const;

export const systemAdminTenantSettingsAction = {
  key: "tenant-setting-update",
  label: "Update tenant setting",
  kind: "update",
  placement: "primary",
  permissionHint: "system-admin.tenant-settings.write",
} as const;
