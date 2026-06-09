import "server-only";

import type {
  FoodHandlerCertificationHealthComplianceRecord,
  ListFoodHandlerCertificationHealthComplianceQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly FoodHandlerCertificationHealthComplianceRecord[] =
  [];

export function listFoodHandlerCertificationHealthComplianceRecords(
  _query: ListFoodHandlerCertificationHealthComplianceQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly FoodHandlerCertificationHealthComplianceRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getFoodHandlerCertificationHealthComplianceRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
