import "server-only";

import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "./hr.workforce.records.contract.ts";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";

type QueryContext = {
  canViewSensitive?: boolean;
  organizationId?: string;
};

export function listHrEmployeeRecords(
  _query: HrRecordsSearchParams = {},
  _context?: QueryContext
): readonly HrEmployeeRecordSummary[] {
  return hrRecordsStore.list();
}

export function getHrEmployeeRecord(
  id: string,
  _context?: QueryContext
): HrEmployeeRecordDetail | null {
  return hrRecordsStore.get(id);
}
