import "server-only";

import type {
  CompensationPlanningModelingRecord,
  ListCompensationPlanningModelingQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CompensationPlanningModelingRecord[] = [];

export function listCompensationPlanningModelingRecords(
  _query: ListCompensationPlanningModelingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CompensationPlanningModelingRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getCompensationPlanningModelingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CompensationPlanningModelingRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
