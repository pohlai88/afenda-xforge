import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateTrainingDevelopmentInput,
  TrainingDevelopmentRecord,
  UpdateTrainingDevelopmentInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createTrainingDevelopmentRecord(
  input: CreateTrainingDevelopmentInput,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateTrainingDevelopmentRecord(
  input: UpdateTrainingDevelopmentInput,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
