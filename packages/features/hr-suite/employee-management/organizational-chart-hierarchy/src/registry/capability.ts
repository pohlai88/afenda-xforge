export const organizationalChartHierarchyCapabilities = {
  auditRead: "hr.organization_structure.audit.read",
  positionsRead: "hr.organization_structure.positions.read",
  reportingLinesRead: "hr.organization_structure.reporting_lines.read",
  structureRead: "hr.organization_structure.read",
  structureWrite: "hr.organization_structure.write",
  unitsRead: "hr.organization_structure.units.read",
} as const;

export const organizationalChartHierarchyCapabilityCatalog = Object.values(
  organizationalChartHierarchyCapabilities
);

export type OrganizationalChartHierarchyCapability =
  (typeof organizationalChartHierarchyCapabilities)[keyof typeof organizationalChartHierarchyCapabilities];
