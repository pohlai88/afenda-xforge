import "server-only";

import type {
  MultiCountryPayrollRecord,
  ListMultiCountryPayrollQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly MultiCountryPayrollRecord[] = [];

export async function listMultiCountryPayrollRecords(
  _query: ListMultiCountryPayrollQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly MultiCountryPayrollRecord[]> {
  return inMemoryRecords;
}

export async function getMultiCountryPayrollRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
