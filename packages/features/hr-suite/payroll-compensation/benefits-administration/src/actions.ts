import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateBenefitsAdministrationInput,
  BenefitsAdministrationRecord,
  UpdateBenefitsAdministrationInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createBenefitsAdministrationRecord(
  input: CreateBenefitsAdministrationInput,
  _context?: HrSuiteFeatureContext
): Promise<BenefitsAdministrationRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateBenefitsAdministrationRecord(
  input: UpdateBenefitsAdministrationInput,
  _context?: HrSuiteFeatureContext
): Promise<BenefitsAdministrationRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
