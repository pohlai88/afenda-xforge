export const complianceRegulatoryTrackingReadPermission = {
  module: "hr",
  object: "compliance",
  function: "read",
} as const;

export const complianceRegulatoryTrackingWritePermission = {
  module: "hr",
  object: "compliance",
  function: "write",
} as const;

export const complianceRegulatoryTrackingSensitiveReadPermission = {
  module: "hr",
  object: "compliance",
  function: "sensitive.read",
} as const;

export const hrWorkforceComplianceReadPermission: typeof complianceRegulatoryTrackingReadPermission =
  complianceRegulatoryTrackingReadPermission;

export const hrWorkforceComplianceWritePermission: typeof complianceRegulatoryTrackingWritePermission =
  complianceRegulatoryTrackingWritePermission;

export const hrWorkforceComplianceSensitiveReadPermission: typeof complianceRegulatoryTrackingSensitiveReadPermission =
  complianceRegulatoryTrackingSensitiveReadPermission;
