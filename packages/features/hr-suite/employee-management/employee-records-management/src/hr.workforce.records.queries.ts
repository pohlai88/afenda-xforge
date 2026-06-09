import "server-only";

import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "./hr.workforce.records.contract.ts";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

export function listHrEmployeeRecords(
  _query: HrRecordsSearchParams = {},
  context?: QueryContext
): readonly HrEmployeeRecordSummary[] {
  if (context?.canRead === false) {
    return [];
  }

  return hrRecordsStore.list({ organizationId: context?.organizationId });
}

export function getHrEmployeeRecord(
  id: string,
  context?: QueryContext
): HrEmployeeRecordDetail | null {
  if (context?.canRead === false) {
    return null;
  }

  return hrRecordsStore.get(id, { organizationId: context?.organizationId });
}
