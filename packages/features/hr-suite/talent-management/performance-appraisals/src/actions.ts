import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreatePerformanceAppraisalsInput,
  PerformanceAppraisalsRecord,
  UpdatePerformanceAppraisalsInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createPerformanceAppraisalsRecord(
  input: CreatePerformanceAppraisalsInput,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updatePerformanceAppraisalsRecord(
  input: UpdatePerformanceAppraisalsInput,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
