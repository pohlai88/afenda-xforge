import "server-only";

import type {
  FoodHandlerCertificationHealthComplianceRecord,
  ListFoodHandlerCertificationHealthComplianceQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly FoodHandlerCertificationHealthComplianceRecord[] = [];

export async function listFoodHandlerCertificationHealthComplianceRecords(
  _query: ListFoodHandlerCertificationHealthComplianceQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly FoodHandlerCertificationHealthComplianceRecord[]> {
  return inMemoryRecords;
}

export async function getFoodHandlerCertificationHealthComplianceRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
