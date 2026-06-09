import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateTimeClockIntegrationInput,
  TimeClockIntegrationRecord,
  UpdateTimeClockIntegrationInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { timeClockIntegrationStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createTimeClockIntegrationRecord(
  input: CreateTimeClockIntegrationInput,
  _context?: HrSuiteFeatureContext
): TimeClockIntegrationRecord {
  return runHrSuiteFeatureAction(() => {
    const record: TimeClockIntegrationRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    timeClockIntegrationStore.set(record.id, record);
    return record;
  });
}

export function updateTimeClockIntegrationRecord(
  input: UpdateTimeClockIntegrationInput,
  _context?: HrSuiteFeatureContext
): TimeClockIntegrationRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = timeClockIntegrationStore.get(input.id);
    const nextRecord: TimeClockIntegrationRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    timeClockIntegrationStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
