import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateGovernmentClassificationPayGradesInput,
  GovernmentClassificationPayGradesRecord,
  UpdateGovernmentClassificationPayGradesInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createGovernmentClassificationPayGradesRecord(
  input: CreateGovernmentClassificationPayGradesInput,
  _context?: HrSuiteFeatureContext
): Promise<GovernmentClassificationPayGradesRecord> {
  return runHrSuiteFeatureAction<
    Promise<GovernmentClassificationPayGradesRecord>
  >(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateGovernmentClassificationPayGradesRecord(
  input: UpdateGovernmentClassificationPayGradesInput,
  _context?: HrSuiteFeatureContext
): Promise<GovernmentClassificationPayGradesRecord> {
  return runHrSuiteFeatureAction<
    Promise<GovernmentClassificationPayGradesRecord>
  >(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
