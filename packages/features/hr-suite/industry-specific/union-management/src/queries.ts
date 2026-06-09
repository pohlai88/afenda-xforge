import "server-only";

import type {
  UnionManagementRecord,
  ListUnionManagementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly UnionManagementRecord[] = [];

export async function listUnionManagementRecords(
  _query: ListUnionManagementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly UnionManagementRecord[]> {
  return inMemoryRecords;
}

export async function getUnionManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}
