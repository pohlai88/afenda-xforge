import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CompetencySkillsFrameworkRecord,
  CreateCompetencySkillsFrameworkInput,
  UpdateCompetencySkillsFrameworkInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createCompetencySkillsFrameworkRecord(
  input: CreateCompetencySkillsFrameworkInput,
  _context?: HrSuiteFeatureContext
): Promise<CompetencySkillsFrameworkRecord> {
  return runHrSuiteFeatureAction<Promise<CompetencySkillsFrameworkRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateCompetencySkillsFrameworkRecord(
  input: UpdateCompetencySkillsFrameworkInput,
  _context?: HrSuiteFeatureContext
): Promise<CompetencySkillsFrameworkRecord> {
  return runHrSuiteFeatureAction<Promise<CompetencySkillsFrameworkRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
