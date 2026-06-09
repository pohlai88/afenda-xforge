import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { HrEmployeeRecordAuditRecord } from "../contracts/audit.contract.ts";
import type { HrRecordsAuditAction } from "../events.ts";
import { hrRecordsAuditActions } from "../events.ts";
import { hrEmployeeRecordAuditEntrySchema } from "../schema.ts";

export const hrRecordsAuditEvents = {
  employeeArchived: hrRecordsAuditActions.employee.archived,
} as const;

const hrRecordsAuditEventValues = [
  hrRecordsAuditEvents.employeeArchived,
] as const;

export const hrRecordsAuditEventSchema = z.enum(hrRecordsAuditEventValues);

export type HrRecordsAuditEvent =
  (typeof hrRecordsAuditEvents)[keyof typeof hrRecordsAuditEvents];

export function buildHrEmployeeRecordAuditRecord(input: {
  actorId?: string | null;
  action: HrRecordsAuditAction;
  employeeId: string;
  organizationId: string | null;
  reason?: string | null;
  occurredAt?: Date;
}): HrEmployeeRecordAuditRecord {
  const occurredAt = input.occurredAt ?? new Date();

  return hrEmployeeRecordAuditEntrySchema.parse({
    id: randomUUID(),
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    action: input.action,
    actorId: input.actorId ?? null,
    reason: input.reason ?? null,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  });
}

export function buildHrEmployeeRecordArchiveAuditRecord(input: {
  actorId?: string | null;
  action?: HrRecordsAuditEvent;
  employeeId: string;
  organizationId: string | null;
  reason?: string | null;
  occurredAt?: Date;
}): HrEmployeeRecordAuditRecord {
  return buildHrEmployeeRecordAuditRecord({
    action: input.action ?? hrRecordsAuditEvents.employeeArchived,
    actorId: input.actorId,
    employeeId: input.employeeId,
    organizationId: input.organizationId,
    reason: input.reason,
    occurredAt: input.occurredAt,
  });
}
