import { lamLeaveApplicationSensitiveFieldPolicy } from "../contracts/policy.contract.ts";
import { canReadLeaveAttendanceManagementSensitiveData } from "../policy.ts";
import type { LamLeaveApplication, LamReadContext } from "../schema.ts";

export const canViewLamLeaveApplicationSensitiveFields = (
  context?: LamReadContext
): boolean => canReadLeaveAttendanceManagementSensitiveData(context ?? {});

export const redactLamLeaveApplicationSensitiveFields = (
  application: LamLeaveApplication,
  context?: LamReadContext
): LamLeaveApplication => {
  if (canViewLamLeaveApplicationSensitiveFields(context)) {
    return application;
  }

  const redacted: LamLeaveApplication = { ...application };

  for (const field of lamLeaveApplicationSensitiveFieldPolicy.fields) {
    if (field === "rejectionReason") {
      redacted.rejectionReason = null;
      continue;
    }

    if (field === "supportingDocumentId") {
      redacted.supportingDocumentId = null;
    }
  }

  return redacted;
};
