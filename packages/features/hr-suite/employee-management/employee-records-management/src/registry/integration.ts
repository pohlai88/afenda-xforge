import { z } from "zod";
import type { HrEmployeeRecordDetail } from "../hr.workforce.records.contract.ts";
import {
  hrEmployeeIntegrationChangeEventSchema,
  hrEmployeeIntegrationSnapshotSchema,
} from "../contracts/integration.contract.ts";
import {
  projectHrEmployeeIntegrationChangeEvent,
  projectHrEmployeeIntegrationSnapshot,
} from "../projector/integration.ts";

export const hrRecordsIntegrationEvents = {
  employeeIntegrationChanged: "hr.employees.employee.integration.changed.v1",
} as const;

export const hrRecordsIntegrationEventSchema = z.enum([
  hrRecordsIntegrationEvents.employeeIntegrationChanged,
]);

export const hrRecordsIntegrationSnapshotVersion = 1 as const;

export function buildHrEmployeeIntegrationSnapshot(
  record: HrEmployeeRecordDetail,
  canViewSensitive = false
): z.infer<typeof hrEmployeeIntegrationSnapshotSchema> {
  return projectHrEmployeeIntegrationSnapshot(record, canViewSensitive);
}

export function buildHrEmployeeIntegrationChangeEvent(
  record: HrEmployeeRecordDetail,
  canViewSensitive = false
): z.infer<typeof hrEmployeeIntegrationChangeEventSchema> {
  return projectHrEmployeeIntegrationChangeEvent(record, canViewSensitive);
}
