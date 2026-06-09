import "server-only";

import type { HrRecordsActionResult } from "./hr.workforce.records.contract.ts";
import type { HrRecordsPolicyContext } from "./policy.ts";
import {
  canViewHrEmployeeRecordSensitiveData as canViewHrEmployeeRecordSensitiveDataPolicy,
  requireHrRecordsWrite as requireHrRecordsWritePolicy,
} from "./policy.ts";

export type HrRecordsAccessContext = HrRecordsPolicyContext;

export function requireHrRecordsWrite(
  context: HrRecordsAccessContext
): HrRecordsActionResult {
  return requireHrRecordsWritePolicy(context);
}

export function canViewHrRecordsSensitiveData(
  context: HrRecordsAccessContext
): boolean {
  return canViewHrEmployeeRecordSensitiveDataPolicy(context);
}

export { canReadHrEmployeeRecord, canWriteHrEmployeeRecord } from "./policy.ts";
