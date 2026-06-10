import { buildHrEmployeeRecordDetailPageModel } from "@repo/features-employee-management-employee-records-management/server";
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

  const detailPageModel = buildHrEmployeeRecordDetailPageModel({
    canViewSensitive: context.canViewSensitive ?? false,
    employeeId: targetEmployeeId,
    organizationId: context.organizationId,
  });

  if (!detailPageModel) {
    return null;
  }

  const projectedRecord = detailPageModel.employee;

  return projectEmployeeSelfservicePortalProfile(
    {
      countryCode: projectedRecord.countryCode,
      departmentName: projectedRecord.departmentName,
      displayName: projectedRecord.displayName,
      email: projectedRecord.email,
      employeeId: targetEmployeeId,
      employeeNumber: projectedRecord.employeeNumber,
      employmentStatus: projectedRecord.employmentStatus,
      employmentType: projectedRecord.employmentType,
      languagePreference: projectedRecord.languagePreference,
      legalName: projectedRecord.legalName,
      managerEmployeeId: projectedRecord.managerEmployeeId,
      personalEmail: projectedRecord.personalEmail,
      phoneNumber: projectedRecord.phoneNumber,
      positionTitle: projectedRecord.positionTitle,
      preferredName: projectedRecord.preferredName,
      workLocationCode: projectedRecord.workLocationCode,
    },
    actorEmployeeId,
    context.canViewSensitive ?? false,
    portalRecord
  );
}
