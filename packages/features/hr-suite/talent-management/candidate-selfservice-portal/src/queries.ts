import "server-only";

import type {
  CandidateSelfservicePortalRecord,
  ListCandidateSelfservicePortalQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CandidateSelfservicePortalRecord[] = [];

export async function listCandidateSelfservicePortalRecords(
  _query: ListCandidateSelfservicePortalQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CandidateSelfservicePortalRecord[]> {
  return inMemoryRecords;
}

export async function getCandidateSelfservicePortalRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
