import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateEmployeeEngagementSurveysInput,
  EmployeeEngagementSurveysRecord,
  UpdateEmployeeEngagementSurveysInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createEmployeeEngagementSurveysRecord(
  input: CreateEmployeeEngagementSurveysInput,
  _context?: HrSuiteFeatureContext
): Promise<EmployeeEngagementSurveysRecord> {
  return runHrSuiteFeatureAction<Promise<EmployeeEngagementSurveysRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateEmployeeEngagementSurveysRecord(
  input: UpdateEmployeeEngagementSurveysInput,
  _context?: HrSuiteFeatureContext
): Promise<EmployeeEngagementSurveysRecord> {
  return runHrSuiteFeatureAction<Promise<EmployeeEngagementSurveysRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
