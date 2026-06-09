import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateFlexibleWorkArrangementTrackingInput,
  FlexibleWorkArrangementTrackingRecord,
  UpdateFlexibleWorkArrangementTrackingInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { flexibleWorkArrangementTrackingStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createFlexibleWorkArrangementTrackingRecord(
  input: CreateFlexibleWorkArrangementTrackingInput,
  _context?: HrSuiteFeatureContext
): FlexibleWorkArrangementTrackingRecord {
  return runHrSuiteFeatureAction(() => {
    const record: FlexibleWorkArrangementTrackingRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    flexibleWorkArrangementTrackingStore.set(record.id, record);
    return record;
  });
}

export function updateFlexibleWorkArrangementTrackingRecord(
  input: UpdateFlexibleWorkArrangementTrackingInput,
  _context?: HrSuiteFeatureContext
): FlexibleWorkArrangementTrackingRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = flexibleWorkArrangementTrackingStore.get(input.id);
    const nextRecord: FlexibleWorkArrangementTrackingRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    flexibleWorkArrangementTrackingStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
