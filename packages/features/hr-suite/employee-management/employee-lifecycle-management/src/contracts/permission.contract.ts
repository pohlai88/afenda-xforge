export const employeeLifecycleManagementReadPermission = {
  module: "hr",
  object: "lifecycle",
  function: "read",
} as const;

export const employeeLifecycleManagementWritePermission = {
  module: "hr",
  object: "lifecycle",
  function: "write",
} as const;

export const employeeLifecycleManagementSensitiveReadPermission = {
  module: "hr",
  object: "lifecycle",
  function: "sensitive.read",
} as const;

export const hrWorkforceLifecycleReadPermission: typeof employeeLifecycleManagementReadPermission =
  employeeLifecycleManagementReadPermission;

export const hrWorkforceLifecycleWritePermission: typeof employeeLifecycleManagementWritePermission =
  employeeLifecycleManagementWritePermission;

export const hrWorkforceLifecycleSensitiveReadPermission: typeof employeeLifecycleManagementSensitiveReadPermission =
  employeeLifecycleManagementSensitiveReadPermission;

export const employeeLifecycleManagementPermissions = {
  read: employeeLifecycleManagementReadPermission,
  write: employeeLifecycleManagementWritePermission,
  sensitiveRead: employeeLifecycleManagementSensitiveReadPermission,
} as const;

export type EmployeeLifecycleManagementPermissionSet = {
  read: typeof employeeLifecycleManagementReadPermission;
  write: typeof employeeLifecycleManagementWritePermission;
  sensitiveRead: typeof employeeLifecycleManagementSensitiveReadPermission;
};

export type EmployeeLifecycleManagementPermission =
  | typeof employeeLifecycleManagementReadPermission
  | typeof employeeLifecycleManagementWritePermission
  | typeof employeeLifecycleManagementSensitiveReadPermission;
