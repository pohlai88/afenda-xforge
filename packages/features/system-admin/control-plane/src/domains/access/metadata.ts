export const systemAdminAccessSectionDefinition = {
  description: "User, role, and permission administration entrypoints.",
  domain: "users-access",
  id: "system-admin.users-access",
  requiredPermission: "system-admin.users-access.read",
  status: "deferred",
  title: "Users & Access",
} as const;

export const systemAdminAccessFilterOption = {
  label: "Users & Access",
  value: "users-access",
} as const;

export const systemAdminAccessAction = {
  key: "role-assign",
  label: "Assign role",
  kind: "update",
  placement: "overflow",
  permissionHint: "system-admin.users-access.write",
} as const;
