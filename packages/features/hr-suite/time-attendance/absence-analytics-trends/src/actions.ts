import "server-only";

import { randomUUID } from "node:crypto";
import type {
  AbsenceAnalyticsTrendsRecord,
  CreateAbsenceAnalyticsTrendsInput,
  UpdateAbsenceAnalyticsTrendsInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { absenceAnalyticsTrendsStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createAbsenceAnalyticsTrendsRecord(
  input: CreateAbsenceAnalyticsTrendsInput,
  _context?: HrSuiteFeatureContext
): AbsenceAnalyticsTrendsRecord {
  return runHrSuiteFeatureAction(() => {
    const record: AbsenceAnalyticsTrendsRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    absenceAnalyticsTrendsStore.set(record.id, record);
    return record;
  });
}

export function updateAbsenceAnalyticsTrendsRecord(
  input: UpdateAbsenceAnalyticsTrendsInput,
  _context?: HrSuiteFeatureContext
): AbsenceAnalyticsTrendsRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = absenceAnalyticsTrendsStore.get(input.id);
    const nextRecord: AbsenceAnalyticsTrendsRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    absenceAnalyticsTrendsStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
