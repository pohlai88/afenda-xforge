import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateOvertimeManagementInput,
  OvertimeManagementRecord,
  UpdateOvertimeManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { overtimeManagementStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createOvertimeManagementRecord(
  input: CreateOvertimeManagementInput,
  _context?: HrSuiteFeatureContext
): OvertimeManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const record: OvertimeManagementRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    overtimeManagementStore.set(record.id, record);
    return record;
  });
}

export function updateOvertimeManagementRecord(
  input: UpdateOvertimeManagementInput,
  _context?: HrSuiteFeatureContext
): OvertimeManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = overtimeManagementStore.get(input.id);
    const nextRecord: OvertimeManagementRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    overtimeManagementStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
