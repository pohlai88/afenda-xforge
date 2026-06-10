import { getEmployeeSelfservicePortalProfileSource } from "../employee-records.integration.ts";
import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import { projectEmployeeSelfservicePortalProfile } from "../projector/profile.ts";
import { getEmployeeSelfservicePortalRepositoryRecordByEmployeeId } from "../repository.ts";
import type {
  EmployeeSelfservicePortalProfileQuery,
  EmployeeSelfservicePortalProfileView,
} from "../schema.ts";
import { employeeSelfservicePortalProfileQuerySchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

export function getEmployeeSelfservicePortalProfile(
  query: EmployeeSelfservicePortalProfileQuery = {},
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalProfileView | null {
  if (!context?.canRead) {
    return null;
  }

  const parsedQuery = employeeSelfservicePortalProfileQuerySchema.parse(query);
  const targetEmployeeId = parsedQuery.employeeId ?? context.actorEmployeeId;
  const actorEmployeeId = context.actorEmployeeId;
  const companyId = context.companyId;
  const tenantId = context.tenantId;

  if (
    !(
      targetEmployeeId &&
      actorEmployeeId &&
      companyId &&
      tenantId &&
      context.organizationId
    )
  ) {
    return null;
  }

  if (!(context.canReadAll || targetEmployeeId === actorEmployeeId)) {
    return null;
  }

  const portalRecord = getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
    targetEmployeeId,
    {
      companyId,
      tenantId,
    }
  );

  if (!portalRecord) {
    return null;
  }

  if (!canReadEmployeeSelfservicePortal(context, portalRecord)) {
    return null;
  }

  const profileSource = getEmployeeSelfservicePortalProfileSource({
    canViewSensitive: context.canViewSensitive ?? false,
    employeeId: targetEmployeeId,
    organizationId: context.organizationId,
  });

  if (!profileSource) {
    return null;
  }

  return projectEmployeeSelfservicePortalProfile(
    {
      countryCode: profileSource.countryCode,
      departmentName: profileSource.departmentName,
      displayName: profileSource.displayName,
      email: profileSource.email,
      employeeId: targetEmployeeId,
      employeeNumber: profileSource.employeeNumber,
      employmentStatus: profileSource.employmentStatus,
      employmentType: profileSource.employmentType,
      languagePreference: profileSource.languagePreference,
      legalName: profileSource.legalName,
      managerEmployeeId: profileSource.managerEmployeeId,
      personalEmail: profileSource.personalEmail,
      phoneNumber: profileSource.phoneNumber,
      positionTitle: profileSource.positionTitle,
      preferredName: profileSource.preferredName,
      workLocationCode: profileSource.workLocationCode,
    },
    actorEmployeeId,
    context.canViewSensitive ?? false,
    portalRecord
  );
}
