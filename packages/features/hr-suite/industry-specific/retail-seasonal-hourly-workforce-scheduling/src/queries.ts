import "server-only";

import type {
  RetailSeasonalHourlyWorkforceSchedulingRecord,
  ListRetailSeasonalHourlyWorkforceSchedulingQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly RetailSeasonalHourlyWorkforceSchedulingRecord[] = [];

export async function listRetailSeasonalHourlyWorkforceSchedulingRecords(
  _query: ListRetailSeasonalHourlyWorkforceSchedulingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly RetailSeasonalHourlyWorkforceSchedulingRecord[]> {
  return inMemoryRecords;
}

export async function getRetailSeasonalHourlyWorkforceSchedulingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
