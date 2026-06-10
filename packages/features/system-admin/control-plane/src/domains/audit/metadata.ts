export const systemAdminAuditSectionDefinition = {
  description: "Audit evidence discovery through the audit package.",
  domain: "audit",
  id: "system-admin.audit",
  requiredPermission: "system-admin.audit.read",
  status: "ready",
  title: "Audit Trail",
} as const;

export const systemAdminAuditFilterOption = {
  label: "Audit",
  value: "audit",
} as const;
