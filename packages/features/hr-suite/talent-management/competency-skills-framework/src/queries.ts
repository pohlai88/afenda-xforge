import "server-only";

import type {
  CompetencySkillsFrameworkRecord,
  ListCompetencySkillsFrameworkQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly CompetencySkillsFrameworkRecord[] = [];

export async function listCompetencySkillsFrameworkRecords(
  _query: ListCompetencySkillsFrameworkQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly CompetencySkillsFrameworkRecord[]> {
  return inMemoryRecords;
}

export async function getCompetencySkillsFrameworkRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<CompetencySkillsFrameworkRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
