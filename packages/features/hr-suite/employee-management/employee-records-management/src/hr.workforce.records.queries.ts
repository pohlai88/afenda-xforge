import "server-only";

import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "./hr.workforce.records.contract.ts";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";
import { canReadHrEmployeeRecord } from "./policy.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

export function listHrEmployeeRecords(
  _query: HrRecordsSearchParams = {},
  context?: QueryContext
): readonly HrEmployeeRecordSummary[] {
  if (!canReadHrEmployeeRecord(context ?? {})) {
    return [];
  }

  return hrRecordsStore.list({ organizationId: context?.organizationId });
}

export function getHrEmployeeRecord(
  id: string,
  context?: QueryContext
): HrEmployeeRecordDetail | null {
  if (!canReadHrEmployeeRecord(context ?? {})) {
    return null;
  }

  return hrRecordsStore.get(id, { organizationId: context?.organizationId });
}
