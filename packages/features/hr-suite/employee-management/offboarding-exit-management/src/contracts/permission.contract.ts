export const offboardingExitManagementReadPermission = {
  module: "hr",
  object: "offboarding",
  function: "read",
} as const;

export const offboardingExitManagementWritePermission = {
  module: "hr",
  object: "offboarding",
  function: "write",
} as const;

export const offboardingExitManagementSensitiveReadPermission = {
  module: "hr",
  object: "offboarding",
  function: "sensitive.read",
} as const;

export const hrWorkforceOffboardingReadPermission =
  offboardingExitManagementReadPermission;
export const hrWorkforceOffboardingWritePermission =
  offboardingExitManagementWritePermission;
export const hrWorkforceOffboardingSensitiveReadPermission =
  offboardingExitManagementSensitiveReadPermission;

export const offboardingExitManagementPermissions = {
  read: offboardingExitManagementReadPermission,
  write: offboardingExitManagementWritePermission,
  sensitiveRead: offboardingExitManagementSensitiveReadPermission,
} as const;

export type OffboardingExitManagementPermissionSet = {
  read: typeof offboardingExitManagementReadPermission;
  write: typeof offboardingExitManagementWritePermission;
  sensitiveRead: typeof offboardingExitManagementSensitiveReadPermission;
};

export type OffboardingExitManagementPermission =
  | typeof offboardingExitManagementReadPermission
  | typeof offboardingExitManagementWritePermission
  | typeof offboardingExitManagementSensitiveReadPermission;
