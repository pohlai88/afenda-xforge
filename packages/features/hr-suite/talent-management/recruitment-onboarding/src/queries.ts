import "server-only";

import type {
  ListRecruitmentOnboardingQuery,
  RecruitmentOnboardingRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly RecruitmentOnboardingRecord[] = [];

export function listRecruitmentOnboardingRecords(
  _query: ListRecruitmentOnboardingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly RecruitmentOnboardingRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getRecruitmentOnboardingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
