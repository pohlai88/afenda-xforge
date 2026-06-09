import "server-only";

import type {
  ListPayrollProcessingQuery,
  PayrollProcessingRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly PayrollProcessingRecord[] = [];

export function listPayrollProcessingRecords(
  _query: ListPayrollProcessingQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly PayrollProcessingRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getPayrollProcessingRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<PayrollProcessingRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
