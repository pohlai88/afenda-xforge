import "server-only";

import type { HrRecordsActionResult } from "./hr.workforce.records.contract.ts";

export type HrRecordsAccessContext = {
  canWrite?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
  userId?: string;
};

export function requireHrRecordsWrite(
  context: HrRecordsAccessContext
): HrRecordsActionResult {
  return context.canWrite
    ? { ok: true }
    : { ok: false, error: "Write access denied for employee records" };
}

export function canViewHrRecordsSensitiveData(
  context: HrRecordsAccessContext
): boolean {
  return Boolean(context.canViewSensitive);
}
