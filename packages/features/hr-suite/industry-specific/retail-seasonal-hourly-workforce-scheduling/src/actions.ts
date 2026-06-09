import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateRetailSeasonalHourlyWorkforceSchedulingInput,
  RetailSeasonalHourlyWorkforceSchedulingRecord,
  UpdateRetailSeasonalHourlyWorkforceSchedulingInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createRetailSeasonalHourlyWorkforceSchedulingRecord(
  input: CreateRetailSeasonalHourlyWorkforceSchedulingInput,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateRetailSeasonalHourlyWorkforceSchedulingRecord(
  input: UpdateRetailSeasonalHourlyWorkforceSchedulingInput,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
