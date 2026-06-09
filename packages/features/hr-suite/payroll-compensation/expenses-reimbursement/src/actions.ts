import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateExpensesReimbursementInput,
  ExpensesReimbursementRecord,
  UpdateExpensesReimbursementInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createExpensesReimbursementRecord(
  input: CreateExpensesReimbursementInput,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateExpensesReimbursementRecord(
  input: UpdateExpensesReimbursementInput,
  _context?: HrSuiteFeatureContext
): Promise<ExpensesReimbursementRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
