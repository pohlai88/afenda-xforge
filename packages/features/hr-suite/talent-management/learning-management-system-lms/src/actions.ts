import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateLearningManagementSystemLmsInput,
  LearningManagementSystemLmsRecord,
  UpdateLearningManagementSystemLmsInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createLearningManagementSystemLmsRecord(
  input: CreateLearningManagementSystemLmsInput,
  _context?: HrSuiteFeatureContext
): Promise<LearningManagementSystemLmsRecord> {
  return runHrSuiteFeatureAction<Promise<LearningManagementSystemLmsRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateLearningManagementSystemLmsRecord(
  input: UpdateLearningManagementSystemLmsInput,
  _context?: HrSuiteFeatureContext
): Promise<LearningManagementSystemLmsRecord> {
  return runHrSuiteFeatureAction<Promise<LearningManagementSystemLmsRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
