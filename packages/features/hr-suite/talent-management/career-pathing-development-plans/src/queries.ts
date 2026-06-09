import "server-only";

import type {
  CareerPathingDevelopmentPlansRecord,
  ListCareerPathingDevelopmentPlansQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CareerPathingDevelopmentPlansRecord[] = [];

export function listCareerPathingDevelopmentPlansRecords(
  _query: ListCareerPathingDevelopmentPlansQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CareerPathingDevelopmentPlansRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getCareerPathingDevelopmentPlansRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
