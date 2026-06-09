import { hrRecordsAuditActions } from "../hr.workforce.records.event.ts";
import { hrRecordsAuditEvents } from "./audit.ts";
import { hrRecordsIntegrationEvents } from "./integration.ts";

export const hrRecordsActionRegistry = {
  create: {
    id: "create",
    auditEvent: hrRecordsAuditActions.employee.created,
    capabilities: ["hr.employees.write"],
    integrationEvent: hrRecordsIntegrationEvents.employeeIntegrationChanged,
    approval: { required: false },
    risk: "standard",
  },
  update: {
    id: "update",
    auditEvent: hrRecordsAuditActions.employee.updated,
    capabilities: ["hr.employees.write"],
    integrationEvent: hrRecordsIntegrationEvents.employeeIntegrationChanged,
    approval: { required: false },
    risk: "sensitive",
  },
  assignment: {
    id: "assignment",
    auditEvent: hrRecordsAuditActions.assignment.recorded,
    capabilities: ["hr.employees.write"],
    integrationEvent: hrRecordsIntegrationEvents.employeeIntegrationChanged,
    approval: { required: false },
    risk: "standard",
  },
  archive: {
    id: "archive",
    auditEvent: hrRecordsAuditEvents.employeeArchived,
    capabilities: ["hr.employees.write"],
    integrationEvent: hrRecordsIntegrationEvents.employeeIntegrationChanged,
    approval: { required: false },
    risk: "high",
    requiresReason: true,
  },
  rehire: {
    id: "rehire",
    auditEvent: hrRecordsAuditActions.employee.rehired,
    capabilities: ["hr.employees.write"],
    integrationEvent: hrRecordsIntegrationEvents.employeeIntegrationChanged,
    approval: { required: false },
    risk: "high",
  },
} as const;

export type HrRecordsActionRegistry = typeof hrRecordsActionRegistry;
