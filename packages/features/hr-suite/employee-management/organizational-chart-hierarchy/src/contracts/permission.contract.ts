export const organizationalChartHierarchyReadPermission = {
  action: "read",
  object: "organization_structure",
} as const;

export const organizationalChartHierarchyWritePermission = {
  action: "write",
  object: "organization_structure",
} as const;

export const hrWorkforceOrgReadPermission: typeof organizationalChartHierarchyReadPermission =
  organizationalChartHierarchyReadPermission;

export const hrWorkforceOrgWritePermission: typeof organizationalChartHierarchyWritePermission =
  organizationalChartHierarchyWritePermission;
