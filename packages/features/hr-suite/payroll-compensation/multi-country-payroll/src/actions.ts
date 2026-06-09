import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateMultiCountryPayrollInput,
  MultiCountryPayrollRecord,
  UpdateMultiCountryPayrollInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createMultiCountryPayrollRecord(
  input: CreateMultiCountryPayrollInput,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord> {
  return runHrSuiteFeatureAction<Promise<MultiCountryPayrollRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateMultiCountryPayrollRecord(
  input: UpdateMultiCountryPayrollInput,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord> {
  return runHrSuiteFeatureAction<Promise<MultiCountryPayrollRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
