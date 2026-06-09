import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateMultiCountryPayrollInput,
  MultiCountryPayrollRecord,
  UpdateMultiCountryPayrollInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createMultiCountryPayrollRecord(
  input: CreateMultiCountryPayrollInput,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateMultiCountryPayrollRecord(
  input: UpdateMultiCountryPayrollInput,
  _context?: HrSuiteFeatureContext
): Promise<MultiCountryPayrollRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
