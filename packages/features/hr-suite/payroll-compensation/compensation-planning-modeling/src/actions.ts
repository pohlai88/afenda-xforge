import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateCompensationPlanningModelingInput,
  CompensationPlanningModelingRecord,
  UpdateCompensationPlanningModelingInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createCompensationPlanningModelingRecord(
  input: CreateCompensationPlanningModelingInput,
  _context?: HrSuiteFeatureContext
): Promise<CompensationPlanningModelingRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateCompensationPlanningModelingRecord(
  input: UpdateCompensationPlanningModelingInput,
  _context?: HrSuiteFeatureContext
): Promise<CompensationPlanningModelingRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
