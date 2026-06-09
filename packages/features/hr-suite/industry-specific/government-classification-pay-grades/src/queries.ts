import "server-only";

import type {
  GovernmentClassificationPayGradesRecord,
  ListGovernmentClassificationPayGradesQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly GovernmentClassificationPayGradesRecord[] = [];

export function listGovernmentClassificationPayGradesRecords(
  _query: ListGovernmentClassificationPayGradesQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly GovernmentClassificationPayGradesRecord[]> {
  return inMemoryRecords;
}

export function getGovernmentClassificationPayGradesRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<GovernmentClassificationPayGradesRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
