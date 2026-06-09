import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreatePayrollProcessingInput,
  PayrollProcessingRecord,
  UpdatePayrollProcessingInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createPayrollProcessingRecord(
  input: CreatePayrollProcessingInput,
  _context?: HrSuiteFeatureContext
): Promise<PayrollProcessingRecord> {
  return runHrSuiteFeatureAction<Promise<PayrollProcessingRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updatePayrollProcessingRecord(
  input: UpdatePayrollProcessingInput,
  _context?: HrSuiteFeatureContext
): Promise<PayrollProcessingRecord> {
  return runHrSuiteFeatureAction<Promise<PayrollProcessingRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
