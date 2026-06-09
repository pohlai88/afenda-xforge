import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateRetailSeasonalHourlyWorkforceSchedulingInput,
  RetailSeasonalHourlyWorkforceSchedulingRecord,
  UpdateRetailSeasonalHourlyWorkforceSchedulingInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createRetailSeasonalHourlyWorkforceSchedulingRecord(
  input: CreateRetailSeasonalHourlyWorkforceSchedulingInput,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord> {
  return runHrSuiteFeatureAction<
    Promise<RetailSeasonalHourlyWorkforceSchedulingRecord>
  >(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateRetailSeasonalHourlyWorkforceSchedulingRecord(
  input: UpdateRetailSeasonalHourlyWorkforceSchedulingInput,
  _context?: HrSuiteFeatureContext
): Promise<RetailSeasonalHourlyWorkforceSchedulingRecord> {
  return runHrSuiteFeatureAction<
    Promise<RetailSeasonalHourlyWorkforceSchedulingRecord>
  >(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
