export const systemAdminIntegrationsSectionDefinition = {
  description:
    "Governed external endpoint and connector administration, including webhook delivery endpoints.",
  domain: "integrations",
  id: "system-admin.integrations",
  requiredPermission: "system-admin.integrations.read",
  status: "ready",
  title: "Integrations",
} as const;

export const systemAdminIntegrationsFilterOption = {
  label: "Integrations",
  value: "integrations",
} as const;
