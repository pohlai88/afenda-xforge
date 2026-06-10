import type {
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalRecord,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function canReadEmployeeSelfservicePortal(
  context: HrSuiteFeatureContext | undefined,
  record: EmployeeSelfservicePortalRecord
): boolean {
  if (!context?.canRead) {
    return false;
  }

  if (
    context.tenantId !== record.tenantId ||
    context.companyId !== record.companyId
  ) {
    return false;
  }

  if (context.canReadAll) {
    return true;
  }

  return context.actorEmployeeId === record.employeeId;
}

export function canWriteEmployeeSelfservicePortal(
  context: HrSuiteFeatureContext | undefined
): boolean {
  return Boolean(context?.canWrite && context.tenantId && context.companyId);
}

export function canSubmitEmployeeSelfservicePortalProfileUpdateRequest(
  context: HrSuiteFeatureContext | undefined,
  employeeId: string
): boolean {
  return Boolean(
    canWriteEmployeeSelfservicePortal(context) &&
      context?.actorEmployeeId &&
      context.actorEmployeeId === employeeId
  );
}

export function canReadEmployeeSelfservicePortalProfileUpdateRequest(
  context: HrSuiteFeatureContext | undefined,
  request: EmployeeSelfservicePortalProfileUpdateRequest
): boolean {
  if (
    !(
      context?.canRead &&
      context.tenantId === request.tenantId &&
      context.companyId === request.companyId
    )
  ) {
    return false;
  }

  if (context.canReadAll) {
    return true;
  }

  return context.actorEmployeeId === request.employeeId;
}

export function canReviewEmployeeSelfservicePortalProfileUpdateRequest(
  context: HrSuiteFeatureContext | undefined,
  request: EmployeeSelfservicePortalProfileUpdateRequest
): boolean {
  if (
    !(
      canWriteEmployeeSelfservicePortal(context) &&
      context?.canReadAll &&
      context.userId &&
      context.organizationId
    )
  ) {
    return false;
  }

  if (
    context.tenantId !== request.tenantId ||
    context.companyId !== request.companyId
  ) {
    return false;
  }

  if (request.requiresSensitiveApproval && !context.canViewSensitive) {
    return false;
  }

  return true;
}
