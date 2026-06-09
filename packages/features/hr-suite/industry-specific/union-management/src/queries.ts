import "server-only";

import type {
  ListUnionManagementQuery,
  UnionManagementRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly UnionManagementRecord[] = [];

export function listUnionManagementRecords(
  _query: ListUnionManagementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly UnionManagementRecord[]> {
  return inMemoryRecords;
}

export function getUnionManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
