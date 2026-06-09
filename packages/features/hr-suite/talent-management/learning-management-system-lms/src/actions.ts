import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateLearningManagementSystemLmsInput,
  LearningManagementSystemLmsRecord,
  UpdateLearningManagementSystemLmsInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createLearningManagementSystemLmsRecord(
  input: CreateLearningManagementSystemLmsInput,
  _context?: HrSuiteFeatureContext
): Promise<LearningManagementSystemLmsRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateLearningManagementSystemLmsRecord(
  input: UpdateLearningManagementSystemLmsInput,
  _context?: HrSuiteFeatureContext
): Promise<LearningManagementSystemLmsRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
