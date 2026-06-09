export const organizationalChartHierarchyOwnership = {
  businessOwner: "HR Operations",
  technicalOwner: "HR Platform",
  dataSteward: "HR Operations",
} as const;

export const organizationalChartHierarchyGovernance = {
  auditTrail: true,
  deterministicProjections: true,
  effectiveDating: true,
  hierarchyIntegrity: true,
  permissionEnforcement: true,
  sensitiveAccessControl: true,
} as const;

export const organizationalChartHierarchyDataClassification = {
  confidentiality: "internal",
  containsPii: false,
  retentionRequired: true,
} as const;

export const organizationalChartHierarchyRiskClassification = {
  dataSensitivity: "medium",
  auditRequired: true,
  approvalRequiredFor: ["structure-write", "reporting-line-write"] as const,
} as const;
