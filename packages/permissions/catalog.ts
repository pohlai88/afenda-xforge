export const permissionCatalog = {
  ai: {
    read: "ai.read",
  },
  audit: {
    read: "audit.read",
  },
  companies: {
    read: "master-data.companies:read",
    write: "master-data.companies:write",
  },
  customers: {
    read: "master-data.customers:read",
    write: "master-data.customers:write",
  },
} as const;

export type PermissionCatalog = typeof permissionCatalog;

export type TenantRole = "member" | "manager" | "admin" | "owner";

const tenantRolePermissions: Record<string, string[]> = {
  admin: [
    permissionCatalog.ai.read,
    permissionCatalog.audit.read,
    permissionCatalog.companies.read,
    permissionCatalog.companies.write,
    permissionCatalog.customers.read,
    permissionCatalog.customers.write,
  ],
  manager: [
    permissionCatalog.audit.read,
    permissionCatalog.companies.read,
    permissionCatalog.companies.write,
    permissionCatalog.customers.read,
    permissionCatalog.customers.write,
  ],
  member: [permissionCatalog.companies.read, permissionCatalog.customers.read],
  owner: [
    permissionCatalog.ai.read,
    permissionCatalog.audit.read,
    permissionCatalog.companies.read,
    permissionCatalog.companies.write,
    permissionCatalog.customers.read,
    permissionCatalog.customers.write,
  ],
};

export const resolvePermissionsForTenantRole = (role: string): string[] =>
  tenantRolePermissions[role] ?? [];
