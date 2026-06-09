import "server-only";

import type {
  ListManufacturingSafetyTrainingOshaComplianceQuery,
  ManufacturingSafetyTrainingOshaComplianceRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly ManufacturingSafetyTrainingOshaComplianceRecord[] =
  [];

export function listManufacturingSafetyTrainingOshaComplianceRecords(
  _query: ListManufacturingSafetyTrainingOshaComplianceQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly ManufacturingSafetyTrainingOshaComplianceRecord[]> {
  return inMemoryRecords;
}

export function getManufacturingSafetyTrainingOshaComplianceRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<ManufacturingSafetyTrainingOshaComplianceRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
