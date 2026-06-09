import "server-only";

import { randomUUID } from "node:crypto";
import type {
  BenefitsAdministrationRecord,
  CreateBenefitsAdministrationInput,
  UpdateBenefitsAdministrationInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createBenefitsAdministrationRecord(
  input: CreateBenefitsAdministrationInput,
  _context?: HrSuiteFeatureContext
): Promise<BenefitsAdministrationRecord> {
  return runHrSuiteFeatureAction<Promise<BenefitsAdministrationRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateBenefitsAdministrationRecord(
  input: UpdateBenefitsAdministrationInput,
  _context?: HrSuiteFeatureContext
): Promise<BenefitsAdministrationRecord> {
  return runHrSuiteFeatureAction<Promise<BenefitsAdministrationRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
