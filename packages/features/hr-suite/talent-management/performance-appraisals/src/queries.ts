import "server-only";

import type {
  ListPerformanceAppraisalsQuery,
  PerformanceAppraisalsRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly PerformanceAppraisalsRecord[] = [];

export function listPerformanceAppraisalsRecords(
  _query: ListPerformanceAppraisalsQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly PerformanceAppraisalsRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getPerformanceAppraisalsRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
