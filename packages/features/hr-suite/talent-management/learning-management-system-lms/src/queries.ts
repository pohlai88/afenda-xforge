import "server-only";

import type {
  LearningManagementSystemLmsRecord,
  ListLearningManagementSystemLmsQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly LearningManagementSystemLmsRecord[] = [];

export function listLearningManagementSystemLmsRecords(
  _query: ListLearningManagementSystemLmsQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly LearningManagementSystemLmsRecord[]> {
  return inMemoryRecords;
}

export function getLearningManagementSystemLmsRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<LearningManagementSystemLmsRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
