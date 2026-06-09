import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateSalaryBenchmarkingSurveyInput,
  SalaryBenchmarkingSurveyRecord,
  UpdateSalaryBenchmarkingSurveyInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createSalaryBenchmarkingSurveyRecord(
  input: CreateSalaryBenchmarkingSurveyInput,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateSalaryBenchmarkingSurveyRecord(
  input: UpdateSalaryBenchmarkingSurveyInput,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
