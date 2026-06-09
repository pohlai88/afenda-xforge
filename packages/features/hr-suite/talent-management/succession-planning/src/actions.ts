import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateSuccessionPlanningInput,
  SuccessionPlanningRecord,
  UpdateSuccessionPlanningInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createSuccessionPlanningRecord(
  input: CreateSuccessionPlanningInput,
  _context?: HrSuiteFeatureContext
): Promise<SuccessionPlanningRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateSuccessionPlanningRecord(
  input: UpdateSuccessionPlanningInput,
  _context?: HrSuiteFeatureContext
): Promise<SuccessionPlanningRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
