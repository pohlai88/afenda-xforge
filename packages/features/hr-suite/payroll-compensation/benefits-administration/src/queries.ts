import "server-only";

import type {
  BenefitsAdministrationRecord,
  ListBenefitsAdministrationQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly BenefitsAdministrationRecord[] = [];

export function listBenefitsAdministrationRecords(
  _query: ListBenefitsAdministrationQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly BenefitsAdministrationRecord[]> {
  return inMemoryRecords;
}

export function getBenefitsAdministrationRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<BenefitsAdministrationRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
