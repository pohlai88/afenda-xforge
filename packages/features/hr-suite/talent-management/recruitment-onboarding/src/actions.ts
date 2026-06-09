import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateRecruitmentOnboardingInput,
  RecruitmentOnboardingRecord,
  UpdateRecruitmentOnboardingInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createRecruitmentOnboardingRecord(
  input: CreateRecruitmentOnboardingInput,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateRecruitmentOnboardingRecord(
  input: UpdateRecruitmentOnboardingInput,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
