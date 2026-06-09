import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreatePerformanceAppraisalsInput,
  PerformanceAppraisalsRecord,
  UpdatePerformanceAppraisalsInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createPerformanceAppraisalsRecord(
  input: CreatePerformanceAppraisalsInput,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord> {
  return runHrSuiteFeatureAction<Promise<PerformanceAppraisalsRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updatePerformanceAppraisalsRecord(
  input: UpdatePerformanceAppraisalsInput,
  _context?: HrSuiteFeatureContext
): Promise<PerformanceAppraisalsRecord> {
  return runHrSuiteFeatureAction<Promise<PerformanceAppraisalsRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
