import "server-only";

import type {
  ListMultiCountryPayrollQuery,
  MultiCountryPayrollRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly MultiCountryPayrollRecord[] = [];

export function listMultiCountryPayrollRecords(
  _query: ListMultiCountryPayrollQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly MultiCountryPayrollRecord[]> {
  return inMemoryRecords;
}

export function getMultiCountryPayrollRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
