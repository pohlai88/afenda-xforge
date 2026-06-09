import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateCandidateSelfservicePortalInput,
  CandidateSelfservicePortalRecord,
  UpdateCandidateSelfservicePortalInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createCandidateSelfservicePortalRecord(
  input: CreateCandidateSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateCandidateSelfservicePortalRecord(
  input: UpdateCandidateSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): Promise<CandidateSelfservicePortalRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
