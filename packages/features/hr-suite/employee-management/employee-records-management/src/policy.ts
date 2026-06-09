import type { HrRecordsActionResult } from "./records.contract.ts";

export type HrRecordsPolicyContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  organizationId?: string;
  userId?: string;
};

export const hrEmployeeSensitiveMutationFields = [
  "dateOfBirth",
  "email",
  "identityNumber",
  "mailingAddress",
  "personalEmail",
  "phoneNumber",
  "residentialAddress",
  "emergencyContactPhoneNumber",
] as const;

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

export function hasHrEmployeeSensitiveMutationFields(
  input: Record<string, unknown>
): boolean {
  return hrEmployeeSensitiveMutationFields.some(
    (field) => input[field] !== undefined
  );
}

export function requireHrEmployeeSensitiveMutationAccess(
  context: HrRecordsPolicyContext,
  input: Record<string, unknown>
): HrRecordsActionResult {
  if (!hasHrEmployeeSensitiveMutationFields(input)) {
    return { ok: true };
  }

  if (canViewHrEmployeeRecordSensitiveData(context)) {
    return { ok: true };
  }

  return {
    ok: false,
    error: "Sensitive data access denied for employee records",
  };
}

export function requireHrRecordsWrite(
  context: HrRecordsPolicyContext
): HrRecordsActionResult {
  return canWriteHrEmployeeRecord(context)
    ? { ok: true }
    : { ok: false, error: "Write access denied for employee records" };
}
