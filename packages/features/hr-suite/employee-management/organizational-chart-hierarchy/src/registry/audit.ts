export const organizationalChartHierarchyAuditEvents = {
  positionUpserted: "hr.organization_structure.position.upserted",
  reportingRelationshipUpserted:
    "hr.organization_structure.reporting_relationship.upserted",
  unitUpserted: "hr.organization_structure.unit.upserted",
} as const;

export const organizationalChartHierarchyAuditEventCatalog = Object.values(
  organizationalChartHierarchyAuditEvents
);
