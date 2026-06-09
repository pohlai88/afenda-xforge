import "server-only";

import type {
  CandidateSelfservicePortalRecord,
  ListCandidateSelfservicePortalQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CandidateSelfservicePortalRecord[] = [];

export function listCandidateSelfservicePortalRecords(
  _query: ListCandidateSelfservicePortalQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CandidateSelfservicePortalRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getCandidateSelfservicePortalRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
