import "server-only";

import type {
  ExpensesReimbursementRecord,
  ListExpensesReimbursementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly ExpensesReimbursementRecord[] = [];

export function listExpensesReimbursementRecords(
  _query: ListExpensesReimbursementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly ExpensesReimbursementRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getExpensesReimbursementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
