import "server-only";

import type {
  FieldWorkerRemoteWorkforceManagementRecord,
  ListFieldWorkerRemoteWorkforceManagementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const inMemoryRecords: readonly FieldWorkerRemoteWorkforceManagementRecord[] =
  [];

export function listFieldWorkerRemoteWorkforceManagementRecords(
  _query: ListFieldWorkerRemoteWorkforceManagementQuery = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly FieldWorkerRemoteWorkforceManagementRecord[]> {
  return Promise.resolve(inMemoryRecords);
}

export function getFieldWorkerRemoteWorkforceManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<FieldWorkerRemoteWorkforceManagementRecord | null> {
  return Promise.resolve(
    inMemoryRecords.find((record) => record.id === id) ?? null
  );
}
