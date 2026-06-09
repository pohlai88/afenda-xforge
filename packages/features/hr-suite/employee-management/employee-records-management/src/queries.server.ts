import "server-only";

import { canReadHrEmployeeRecord } from "./policy.ts";
import { listHrEmployeeRecordSummaries } from "./queries/records.query.ts";
import type {
  HrEmployeeRecordDetail,
  HrRecordsSearchParams,
} from "./records.contract.ts";
import { hrRecordsStore } from "./records-store.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

export function listHrEmployeeRecords(
  query: HrRecordsSearchParams = {},
  context?: QueryContext
): ReturnType<typeof listHrEmployeeRecordSummaries> {
  if (!canReadHrEmployeeRecord(context ?? {})) {
    return [];
  }

  return listHrEmployeeRecordSummaries(query, context);
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

export { listHrEmployeeAssignments } from "./queries/assignments.query.ts";
export { listHrEmployeeStatusHistory } from "./queries/status-history.query.ts";
