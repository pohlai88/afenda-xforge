import "server-only";

import type {
  TrainingDevelopmentRecord,
  ListTrainingDevelopmentQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly TrainingDevelopmentRecord[] = [];

export async function listTrainingDevelopmentRecords(
  _query: ListTrainingDevelopmentQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly TrainingDevelopmentRecord[]> {
  return inMemoryRecords;
}

export async function getTrainingDevelopmentRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
