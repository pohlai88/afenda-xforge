import { organizationalChartHierarchyAuditEvents } from "./audit.ts";
import { organizationalChartHierarchyCapabilities } from "./capability.ts";

export const organizationalChartHierarchyActions = {
  upsertPosition: {
    id: "upsert-position",
    label: "Upsert position",
    description: "Create or update an organization position.",
    capability: organizationalChartHierarchyCapabilities.structureWrite,
    risk: "medium",
    auditEvent: organizationalChartHierarchyAuditEvents.positionUpserted,
  },
  upsertReportingLine: {
    id: "upsert-reporting-line",
    label: "Upsert reporting line",
    description: "Create or update an employee reporting relationship.",
    capability: organizationalChartHierarchyCapabilities.structureWrite,
    risk: "medium",
    auditEvent:
      organizationalChartHierarchyAuditEvents.reportingRelationshipUpserted,
  },
  upsertUnit: {
    id: "upsert-unit",
    label: "Upsert unit",
    description: "Create or update an organization unit.",
    capability: organizationalChartHierarchyCapabilities.structureWrite,
    risk: "medium",
    auditEvent: organizationalChartHierarchyAuditEvents.unitUpserted,
  },
} as const;

export const organizationalChartHierarchyActionCatalog = Object.values(
  organizationalChartHierarchyActions
);
