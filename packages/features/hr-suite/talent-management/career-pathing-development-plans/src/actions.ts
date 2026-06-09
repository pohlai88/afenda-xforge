import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CareerPathingDevelopmentPlansRecord,
  CreateCareerPathingDevelopmentPlansInput,
  UpdateCareerPathingDevelopmentPlansInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createCareerPathingDevelopmentPlansRecord(
  input: CreateCareerPathingDevelopmentPlansInput,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord> {
  return runHrSuiteFeatureAction<Promise<CareerPathingDevelopmentPlansRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateCareerPathingDevelopmentPlansRecord(
  input: UpdateCareerPathingDevelopmentPlansInput,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord> {
  return runHrSuiteFeatureAction<Promise<CareerPathingDevelopmentPlansRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
