import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateExpensesReimbursementInput,
  ExpensesReimbursementRecord,
  UpdateExpensesReimbursementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createExpensesReimbursementRecord(
  input: CreateExpensesReimbursementInput,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord> {
  return runHrSuiteFeatureAction<Promise<ExpensesReimbursementRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateExpensesReimbursementRecord(
  input: UpdateExpensesReimbursementInput,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord> {
  return runHrSuiteFeatureAction<Promise<ExpensesReimbursementRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
