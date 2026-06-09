import type { HrRecordsActionResult } from "./hr.workforce.records.contract.ts";

export type HrRecordsPolicyContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  organizationId?: string;
  userId?: string;
};

export function canReadHrEmployeeRecord(
  context: HrRecordsPolicyContext
): boolean {
  return context.canRead !== false;
}

export function canWriteHrEmployeeRecord(
  context: HrRecordsPolicyContext
): boolean {
  return context.canWrite !== false;
}

export function canViewHrEmployeeRecordSensitiveData(
  context: HrRecordsPolicyContext
): boolean {
  return Boolean(context.canViewSensitive);
}

export function requireHrRecordsWrite(
  context: HrRecordsPolicyContext
): HrRecordsActionResult {
  return canWriteHrEmployeeRecord(context)
    ? { ok: true }
    : { ok: false, error: "Write access denied for employee records" };
}
