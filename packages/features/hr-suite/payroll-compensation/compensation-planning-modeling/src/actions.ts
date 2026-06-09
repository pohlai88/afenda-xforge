import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CompensationPlanningModelingRecord,
  CreateCompensationPlanningModelingInput,
  UpdateCompensationPlanningModelingInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createCompensationPlanningModelingRecord(
  input: CreateCompensationPlanningModelingInput,
  _context?: HrSuiteFeatureContext
): Promise<CompensationPlanningModelingRecord> {
  return runHrSuiteFeatureAction<Promise<CompensationPlanningModelingRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateCompensationPlanningModelingRecord(
  input: UpdateCompensationPlanningModelingInput,
  _context?: HrSuiteFeatureContext
): Promise<CompensationPlanningModelingRecord> {
  return runHrSuiteFeatureAction<Promise<CompensationPlanningModelingRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
