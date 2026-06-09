import "server-only";

import type {
  RecruitmentOnboardingRecord,
  ListRecruitmentOnboardingQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly RecruitmentOnboardingRecord[] = [];

export async function listRecruitmentOnboardingRecords(
  _query: ListRecruitmentOnboardingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly RecruitmentOnboardingRecord[]> {
  return inMemoryRecords;
}

export async function getRecruitmentOnboardingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
