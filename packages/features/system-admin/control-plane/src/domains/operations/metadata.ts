export const systemAdminOperationsSectionDefinition = {
  description: "Read-only operational health and metrics summaries.",
  domain: "health-metrics",
  id: "system-admin.health-metrics",
  requiredPermission: "system-admin.health.read",
  status: "deferred",
  title: "Health & Metrics",
} as const;

export const systemAdminOperationsFilterOption = {
  label: "Health & Metrics",
  value: "health-metrics",
} as const;
