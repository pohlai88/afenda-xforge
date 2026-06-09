import "server-only";

import type {
  BonusIncentiveManagementRecord,
  ListBonusIncentiveManagementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly BonusIncentiveManagementRecord[] = [];

export function listBonusIncentiveManagementRecords(
  _query: ListBonusIncentiveManagementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly BonusIncentiveManagementRecord[]> {
  return inMemoryRecords;
}

export function getBonusIncentiveManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<BonusIncentiveManagementRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
