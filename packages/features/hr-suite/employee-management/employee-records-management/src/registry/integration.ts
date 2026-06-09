import { z } from "zod";
import type {
  hrEmployeeIntegrationChangeEventSchema,
  hrEmployeeIntegrationSnapshotSchema,
} from "../contracts/integration.contract.ts";
import {
  projectHrEmployeeIntegrationChangeEvent,
  projectHrEmployeeIntegrationSnapshot,
} from "../projector/integration.ts";
import type { HrEmployeeRecordDetail } from "../records.contract.ts";

export const hrRecordsIntegrationEvents = {
  employeeIntegrationChanged: "hr.employees.employee.integration.changed.v1",
} as const;

export const hrRecordsIntegrationEventSchema = z.enum([
  hrRecordsIntegrationEvents.employeeIntegrationChanged,
]);

export const hrRecordsIntegrationSnapshotVersion = 1 as const;

export function buildHrEmployeeIntegrationSnapshot(
  record: HrEmployeeRecordDetail,
  options?: {
    canViewSensitive?: boolean;
    organizationId?: string | null;
  }
): z.infer<typeof hrEmployeeIntegrationSnapshotSchema> {
  return projectHrEmployeeIntegrationSnapshot(record, options);
}

export function buildHrEmployeeIntegrationChangeEvent(
  record: HrEmployeeRecordDetail,
  options?: {
    canViewSensitive?: boolean;
    organizationId?: string | null;
  }
): z.infer<typeof hrEmployeeIntegrationChangeEventSchema> {
  return projectHrEmployeeIntegrationChangeEvent(record, options);
}
