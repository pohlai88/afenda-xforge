import "server-only";

import type {
  ListTrainingDevelopmentQuery,
  TrainingDevelopmentRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly TrainingDevelopmentRecord[] = [];

export function listTrainingDevelopmentRecords(
  _query: ListTrainingDevelopmentQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly TrainingDevelopmentRecord[]> {
  return inMemoryRecords;
}

export function getTrainingDevelopmentRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
