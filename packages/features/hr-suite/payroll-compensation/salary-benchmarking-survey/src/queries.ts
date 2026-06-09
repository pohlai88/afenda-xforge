import "server-only";

import type {
  ListSalaryBenchmarkingSurveyQuery,
  SalaryBenchmarkingSurveyRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly SalaryBenchmarkingSurveyRecord[] = [];

export function listSalaryBenchmarkingSurveyRecords(
  _query: ListSalaryBenchmarkingSurveyQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly SalaryBenchmarkingSurveyRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getSalaryBenchmarkingSurveyRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<SalaryBenchmarkingSurveyRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
