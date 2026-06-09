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
  return inMemoryRecords;
}

export function getPerformanceAppraisalsRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
