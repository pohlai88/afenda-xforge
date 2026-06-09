import { hrRecordsAuditActions } from "../hr.workforce.records.event.ts";
import { hrRecordsAuditEvents } from "./audit.ts";

export const hrRecordsActionRegistry = {
  create: {
    id: "create",
    auditEvent: hrRecordsAuditActions.employee.created,
  },
  update: {
    id: "update",
    auditEvent: hrRecordsAuditActions.employee.updated,
  },
  assignment: {
    id: "assignment",
    auditEvent: hrRecordsAuditActions.assignment.recorded,
  },
  archive: {
    id: "archive",
    auditEvent: hrRecordsAuditEvents.employeeArchived,
    requiresReason: true,
  },
  rehire: {
    id: "rehire",
    auditEvent: hrRecordsAuditActions.employee.rehired,
  },
} as const;

export type HrRecordsActionRegistry = typeof hrRecordsActionRegistry;
