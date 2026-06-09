import "server-only";

import type {
  ListRetailSeasonalHourlyWorkforceSchedulingQuery,
  RetailSeasonalHourlyWorkforceSchedulingRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly RetailSeasonalHourlyWorkforceSchedulingRecord[] =
  [];

export function listRetailSeasonalHourlyWorkforceSchedulingRecords(
  _query: ListRetailSeasonalHourlyWorkforceSchedulingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly RetailSeasonalHourlyWorkforceSchedulingRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getRetailSeasonalHourlyWorkforceSchedulingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
