import "server-only";

import type {
  ListSuccessionPlanningQuery,
  SuccessionPlanningRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly SuccessionPlanningRecord[] = [];

export function listSuccessionPlanningRecords(
  _query: ListSuccessionPlanningQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly SuccessionPlanningRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getSuccessionPlanningRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<SuccessionPlanningRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
