import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreatePayrollProcessingInput,
  PayrollProcessingRecord,
  UpdatePayrollProcessingInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createPayrollProcessingRecord(
  input: CreatePayrollProcessingInput,
  _context?: HrSuiteFeatureContext
): Promise<PayrollProcessingRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updatePayrollProcessingRecord(
  input: UpdatePayrollProcessingInput,
  _context?: HrSuiteFeatureContext
): Promise<PayrollProcessingRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
