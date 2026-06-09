import "server-only";

import type {
  SalaryBenchmarkingSurveyRecord,
  ListSalaryBenchmarkingSurveyQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly SalaryBenchmarkingSurveyRecord[] = [];

export async function listSalaryBenchmarkingSurveyRecords(
  _query: ListSalaryBenchmarkingSurveyQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly SalaryBenchmarkingSurveyRecord[]> {
  return inMemoryRecords;
}

export async function getSalaryBenchmarkingSurveyRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
