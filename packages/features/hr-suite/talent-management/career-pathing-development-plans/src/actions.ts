import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateCareerPathingDevelopmentPlansInput,
  CareerPathingDevelopmentPlansRecord,
  UpdateCareerPathingDevelopmentPlansInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createCareerPathingDevelopmentPlansRecord(
  input: CreateCareerPathingDevelopmentPlansInput,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateCareerPathingDevelopmentPlansRecord(
  input: UpdateCareerPathingDevelopmentPlansInput,
  _context?: HrSuiteFeatureContext
): Promise<CareerPathingDevelopmentPlansRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
