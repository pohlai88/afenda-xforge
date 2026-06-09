import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CandidateSelfservicePortalRecord,
  CreateCandidateSelfservicePortalInput,
  UpdateCandidateSelfservicePortalInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createCandidateSelfservicePortalRecord(
  input: CreateCandidateSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord> {
  return runHrSuiteFeatureAction<Promise<CandidateSelfservicePortalRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateCandidateSelfservicePortalRecord(
  input: UpdateCandidateSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord> {
  return runHrSuiteFeatureAction<Promise<CandidateSelfservicePortalRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
