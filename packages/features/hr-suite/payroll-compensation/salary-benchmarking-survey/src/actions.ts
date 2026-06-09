import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateSalaryBenchmarkingSurveyInput,
  SalaryBenchmarkingSurveyRecord,
  UpdateSalaryBenchmarkingSurveyInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createSalaryBenchmarkingSurveyRecord(
  input: CreateSalaryBenchmarkingSurveyInput,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord> {
  return runHrSuiteFeatureAction<Promise<SalaryBenchmarkingSurveyRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateSalaryBenchmarkingSurveyRecord(
  input: UpdateSalaryBenchmarkingSurveyInput,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord> {
  return runHrSuiteFeatureAction<Promise<SalaryBenchmarkingSurveyRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
