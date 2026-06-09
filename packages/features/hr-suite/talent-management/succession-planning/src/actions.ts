import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateSuccessionPlanningInput,
  SuccessionPlanningRecord,
  UpdateSuccessionPlanningInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createSuccessionPlanningRecord(
  input: CreateSuccessionPlanningInput,
  _context?: HrSuiteFeatureContext
): Promise<SuccessionPlanningRecord> {
  return runHrSuiteFeatureAction<Promise<SuccessionPlanningRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateSuccessionPlanningRecord(
  input: UpdateSuccessionPlanningInput,
  _context?: HrSuiteFeatureContext
): Promise<SuccessionPlanningRecord> {
  return runHrSuiteFeatureAction<Promise<SuccessionPlanningRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
