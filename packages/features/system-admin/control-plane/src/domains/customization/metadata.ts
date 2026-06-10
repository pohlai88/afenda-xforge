export const systemAdminCustomizationSectionDefinition = {
  description: "Governed tenant customization review and publication.",
  domain: "customization-governance",
  id: "system-admin.customization-governance",
  requiredPermission: "system-admin.customization.read",
  status: "ready",
  title: "Customization Governance",
} as const;

export const systemAdminCustomizationFilterOption = {
  label: "Customization",
  value: "customization-governance",
} as const;

export const systemAdminCustomizationAction = {
  key: "customization-publish",
  label: "Publish customization",
  kind: "approve",
  placement: "primary",
  permissionHint: "system-admin.customization.publish",
} as const;
