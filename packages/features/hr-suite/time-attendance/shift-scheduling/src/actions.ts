import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateShiftSchedulingInput,
  ShiftSchedulingRecord,
  UpdateShiftSchedulingInput,
} from "./contract.ts";
import { shiftSchedulingStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createShiftSchedulingRecord(
  input: CreateShiftSchedulingInput,
  _context?: HrSuiteFeatureContext
): ShiftSchedulingRecord {
  const record: ShiftSchedulingRecord = {
    id: randomUUID(),
    name: normalizeName(input.name),
    status: "draft",
  };

  shiftSchedulingStore.set(record.id, record);
  return record;
}

export function updateShiftSchedulingRecord(
  input: UpdateShiftSchedulingInput,
  _context?: HrSuiteFeatureContext
): ShiftSchedulingRecord {
  const currentRecord = shiftSchedulingStore.get(input.id);
  const nextRecord: ShiftSchedulingRecord = {
    id: input.id,
    name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
    status: input.status ?? currentRecord?.status ?? "draft",
  };

  shiftSchedulingStore.set(nextRecord.id, nextRecord);
  return nextRecord;
}
