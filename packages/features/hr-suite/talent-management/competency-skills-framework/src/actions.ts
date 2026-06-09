import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateCompetencySkillsFrameworkInput,
  CompetencySkillsFrameworkRecord,
  UpdateCompetencySkillsFrameworkInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createCompetencySkillsFrameworkRecord(
  input: CreateCompetencySkillsFrameworkInput,
  _context?: HrSuiteFeatureContext
): Promise<CompetencySkillsFrameworkRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateCompetencySkillsFrameworkRecord(
  input: UpdateCompetencySkillsFrameworkInput,
  _context?: HrSuiteFeatureContext
): Promise<CompetencySkillsFrameworkRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
