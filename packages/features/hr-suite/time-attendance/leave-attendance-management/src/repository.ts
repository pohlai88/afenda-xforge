import type {
  LeaveAttendanceManagementLeaveApplicationRecord,
  LeaveAttendanceManagementLeaveBalanceRecord,
  LeaveAttendanceManagementRecord,
} from "./schema.ts";
import {
  leaveAttendanceManagementLeaveApplicationRecordSchema,
  leaveAttendanceManagementLeaveBalanceRecordSchema,
  leaveAttendanceManagementRecordSchema,
} from "./schema.ts";

export const leaveAttendanceManagementStore = new Map<
  string,
  LeaveAttendanceManagementRecord
>();

export const leaveAttendanceManagementLeaveBalanceStore = new Map<
  string,
  LeaveAttendanceManagementLeaveBalanceRecord
>();

export const leaveAttendanceManagementLeaveApplicationStore = new Map<
  string,
  LeaveAttendanceManagementLeaveApplicationRecord
>();

export const resetLeaveAttendanceManagementStoresForTesting = (): void => {
  leaveAttendanceManagementStore.clear();
  leaveAttendanceManagementLeaveBalanceStore.clear();
  leaveAttendanceManagementLeaveApplicationStore.clear();
};

export const upsertLeaveAttendanceManagementRecord = (
  record: LeaveAttendanceManagementRecord
): LeaveAttendanceManagementRecord => {
  const parsedRecord = leaveAttendanceManagementRecordSchema.parse(record);
  leaveAttendanceManagementStore.set(parsedRecord.id, parsedRecord);
  return parsedRecord;
};

export const upsertLeaveAttendanceManagementLeaveBalanceRecord = (
  record: LeaveAttendanceManagementLeaveBalanceRecord
): LeaveAttendanceManagementLeaveBalanceRecord => {
  const parsedRecord =
    leaveAttendanceManagementLeaveBalanceRecordSchema.parse(record);
  leaveAttendanceManagementLeaveBalanceStore.set(parsedRecord.id, parsedRecord);
  return parsedRecord;
};

export const upsertLeaveAttendanceManagementLeaveApplicationRecord = (
  record: LeaveAttendanceManagementLeaveApplicationRecord
): LeaveAttendanceManagementLeaveApplicationRecord => {
  const parsedRecord =
    leaveAttendanceManagementLeaveApplicationRecordSchema.parse(record);
  leaveAttendanceManagementLeaveApplicationStore.set(
    parsedRecord.id,
    parsedRecord
  );
  return parsedRecord;
};
