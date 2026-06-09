import "server-only";

import type {
  EmployeeEngagementSurveysRecord,
  ListEmployeeEngagementSurveysQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly EmployeeEngagementSurveysRecord[] = [];

export function listEmployeeEngagementSurveysRecords(
  _query: ListEmployeeEngagementSurveysQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly EmployeeEngagementSurveysRecord[]> {
  return inMemoryRecords;
}

export function getEmployeeEngagementSurveysRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<EmployeeEngagementSurveysRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
