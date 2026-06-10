import { getEmployeeSelfservicePortalProfileSource } from "./employee-records.integration.ts";
import type {
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalRecord,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const hasScopedPortalAccess = (
  context: HrSuiteFeatureContext | undefined
): boolean =>
  Boolean(context?.canRead && context.tenantId && context.companyId);

const hasAuthenticatedElevatedPortalAccess = (
  context: HrSuiteFeatureContext | undefined
): boolean =>
  Boolean(
    hasScopedPortalAccess(context) && context?.canReadAll && context.userId
  );

const hasManagerApprovalInboxAccess = (
  context: HrSuiteFeatureContext | undefined
): context is HrSuiteFeatureContext &
  Required<
    Pick<
      HrSuiteFeatureContext,
      | "actorEmployeeId"
      | "canRead"
      | "canReadAll"
      | "companyId"
      | "organizationId"
      | "tenantId"
      | "userId"
    >
  > =>
  Boolean(
    hasAuthenticatedElevatedPortalAccess(context) &&
      context?.actorEmployeeId &&
      context.organizationId
  );

const isScopedRequest = (
  context: HrSuiteFeatureContext,
  request: EmployeeSelfservicePortalProfileUpdateRequest
): boolean =>
  context.tenantId === request.tenantId &&
  context.companyId === request.companyId;

export function isEmployeeSelfservicePortalManagerForEmployee(
  context: HrSuiteFeatureContext | undefined,
  employeeId: string
): boolean {
  if (!hasManagerApprovalInboxAccess(context)) {
    return false;
  }

  const profileSource = getEmployeeSelfservicePortalProfileSource({
    canViewSensitive: false,
    employeeId,
    organizationId: context.organizationId,
  });

  if (!profileSource?.managerEmployeeId) {
    return false;
  }

  return profileSource.managerEmployeeId === context.actorEmployeeId;
}

export function canReadEmployeeSelfservicePortal(
  context: HrSuiteFeatureContext | undefined,
  record: EmployeeSelfservicePortalRecord
): boolean {
  if (!(hasScopedPortalAccess(context) && context)) {
    return false;
  }

  if (
    context.tenantId !== record.tenantId ||
    context.companyId !== record.companyId
  ) {
    return false;
  }

  if (hasAuthenticatedElevatedPortalAccess(context)) {
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
  if (!(hasScopedPortalAccess(context) && context)) {
    return false;
  }

  if (
    context.tenantId !== request.tenantId ||
    context.companyId !== request.companyId
  ) {
    return false;
  }

  if (hasAuthenticatedElevatedPortalAccess(context)) {
    return true;
  }

  return context.actorEmployeeId === request.employeeId;
}

export function canReadEmployeeSelfservicePortalManagerApprovalInbox(
  context: HrSuiteFeatureContext | undefined
): boolean {
  return hasManagerApprovalInboxAccess(context);
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

  if (!isScopedRequest(context, request)) {
    return false;
  }

  if (request.requiresSensitiveApproval && !context.canViewSensitive) {
    return false;
  }

  if (
    isEmployeeSelfservicePortalManagerForEmployee(context, request.employeeId)
  ) {
    return true;
  }

  return !context.actorEmployeeId;
}
