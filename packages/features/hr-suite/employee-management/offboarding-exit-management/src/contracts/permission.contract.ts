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

export const hrWorkforceOffboardingReadPermission: typeof offboardingExitManagementReadPermission =
  offboardingExitManagementReadPermission;

export const hrWorkforceOffboardingWritePermission: typeof offboardingExitManagementWritePermission =
  offboardingExitManagementWritePermission;

export const hrWorkforceOffboardingSensitiveReadPermission: typeof offboardingExitManagementSensitiveReadPermission =
  offboardingExitManagementSensitiveReadPermission;
