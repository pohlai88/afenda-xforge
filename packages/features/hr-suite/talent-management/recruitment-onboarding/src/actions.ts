import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateRecruitmentOnboardingInput,
  RecruitmentOnboardingRecord,
  UpdateRecruitmentOnboardingInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createRecruitmentOnboardingRecord(
  input: CreateRecruitmentOnboardingInput,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord> {
  return runHrSuiteFeatureAction<Promise<RecruitmentOnboardingRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateRecruitmentOnboardingRecord(
  input: UpdateRecruitmentOnboardingInput,
  _context?: HrSuiteFeatureContext
): Promise<RecruitmentOnboardingRecord> {
  return runHrSuiteFeatureAction<Promise<RecruitmentOnboardingRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
