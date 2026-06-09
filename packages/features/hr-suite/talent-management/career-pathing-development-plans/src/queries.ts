import "server-only";

import type {
  CareerPathingDevelopmentPlansRecord,
  ListCareerPathingDevelopmentPlansQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CareerPathingDevelopmentPlansRecord[] = [];

export async function listCareerPathingDevelopmentPlansRecords(
  _query: ListCareerPathingDevelopmentPlansQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CareerPathingDevelopmentPlansRecord[]> {
  return inMemoryRecords;
}

export async function getCareerPathingDevelopmentPlansRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
