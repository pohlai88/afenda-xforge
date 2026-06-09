import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateLeaveAttendanceManagementInput,
  LeaveAttendanceManagementRecord,
  UpdateLeaveAttendanceManagementInput,
} from "./contract.ts";
import { leaveAttendanceManagementStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createLeaveAttendanceManagementRecord(
  input: CreateLeaveAttendanceManagementInput,
  _context?: HrSuiteFeatureContext
): LeaveAttendanceManagementRecord {
  const record: LeaveAttendanceManagementRecord = {
    id: randomUUID(),
    name: normalizeName(input.name),
    status: "draft",
  };

  leaveAttendanceManagementStore.set(record.id, record);
  return record;
}

export function updateLeaveAttendanceManagementRecord(
  input: UpdateLeaveAttendanceManagementInput,
  _context?: HrSuiteFeatureContext
): LeaveAttendanceManagementRecord {
  const currentRecord = leaveAttendanceManagementStore.get(input.id);
  const nextRecord: LeaveAttendanceManagementRecord = {
    id: input.id,
    name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
    status: input.status ?? currentRecord?.status ?? "draft",
  };

  leaveAttendanceManagementStore.set(nextRecord.id, nextRecord);
  return nextRecord;
}
