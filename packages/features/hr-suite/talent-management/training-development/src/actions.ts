import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateTrainingDevelopmentInput,
  TrainingDevelopmentRecord,
  UpdateTrainingDevelopmentInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createTrainingDevelopmentRecord(
  input: CreateTrainingDevelopmentInput,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord> {
  return runHrSuiteFeatureAction<Promise<TrainingDevelopmentRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateTrainingDevelopmentRecord(
  input: UpdateTrainingDevelopmentInput,
  _context?: HrSuiteFeatureContext
): Promise<TrainingDevelopmentRecord> {
  return runHrSuiteFeatureAction<Promise<TrainingDevelopmentRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
