import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateGovernmentClassificationPayGradesInput,
  GovernmentClassificationPayGradesRecord,
  UpdateGovernmentClassificationPayGradesInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createGovernmentClassificationPayGradesRecord(
  input: CreateGovernmentClassificationPayGradesInput,
  _context?: HrSuiteFeatureContext
): Promise<GovernmentClassificationPayGradesRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateGovernmentClassificationPayGradesRecord(
  input: UpdateGovernmentClassificationPayGradesInput,
  _context?: HrSuiteFeatureContext
): Promise<GovernmentClassificationPayGradesRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
