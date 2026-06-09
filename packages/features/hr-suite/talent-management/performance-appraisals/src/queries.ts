import "server-only";

import type {
  PerformanceAppraisalsRecord,
  ListPerformanceAppraisalsQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly PerformanceAppraisalsRecord[] = [];

export async function listPerformanceAppraisalsRecords(
  _query: ListPerformanceAppraisalsQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly PerformanceAppraisalsRecord[]> {
  return inMemoryRecords;
}

export async function getPerformanceAppraisalsRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
