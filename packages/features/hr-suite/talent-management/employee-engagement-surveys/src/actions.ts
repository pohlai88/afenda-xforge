import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateEmployeeEngagementSurveysInput,
  EmployeeEngagementSurveysRecord,
  UpdateEmployeeEngagementSurveysInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createEmployeeEngagementSurveysRecord(
  input: CreateEmployeeEngagementSurveysInput,
  _context?: HrSuiteFeatureContext
): Promise<EmployeeEngagementSurveysRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateEmployeeEngagementSurveysRecord(
  input: UpdateEmployeeEngagementSurveysInput,
  _context?: HrSuiteFeatureContext
): Promise<EmployeeEngagementSurveysRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
