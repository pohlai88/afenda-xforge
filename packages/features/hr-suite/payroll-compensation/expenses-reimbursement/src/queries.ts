import "server-only";

import type {
  ExpensesReimbursementRecord,
  ListExpensesReimbursementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly ExpensesReimbursementRecord[] = [];

export async function listExpensesReimbursementRecords(
  _query: ListExpensesReimbursementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly ExpensesReimbursementRecord[]> {
  return inMemoryRecords;
}

export async function getExpensesReimbursementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
