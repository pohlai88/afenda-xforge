import {
  buildHrEmployeeRecordDetailPageModel,
  updateHrEmployeeRecord,
} from "@repo/features-employee-management-employee-records-management/server";
import {
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration,
  configureEmployeeSelfservicePortalLeaveAttendanceIntegration,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { permissionCatalog } from "@repo/permissions";
import {
  listLeaveAttendanceManagementLeaveApplications,
  listLeaveAttendanceManagementLeaveBalances,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { listEmployeeSelfservicePortalRepositoryRecords } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { resolveHrTenantScopedAccess } from "../../_lib/access.ts";
import type { RuntimeTenantAccess } from "../../../../_runtime-access.ts";

const resolveActorEmployeeId = (access: RuntimeTenantAccess): string | undefined => {
  if (access.actorEmployeeId?.trim()) {
    return access.actorEmployeeId.trim();
  }

  const normalizedEmail = access.userEmail?.trim().toLowerCase();

  if (!normalizedEmail) {
    return undefined;
  }

  const portalRecord = listEmployeeSelfservicePortalRepositoryRecords().find(
    (record) =>
      record.tenantId === access.tenantId &&
      record.workEmail?.trim().toLowerCase() === normalizedEmail
  );

  return portalRecord?.employeeId;
};

export type EmployeeSelfservicePortalApiReadContext = {
  actorEmployeeId?: string;
  actorId?: string;
  canRead: boolean;
  canReadAll: boolean;
  canViewSensitive: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
};

export type EmployeeSelfservicePortalApiWriteContext =
  EmployeeSelfservicePortalApiReadContext & {
    canWrite: boolean;
  };

configureEmployeeSelfservicePortalEmployeeRecordsIntegration({
  applyApprovedProfileUpdate: async (input) =>
    updateHrEmployeeRecord(
      {
        employeeId: input.employeeId,
        ...input.requestedChanges,
        approvalReference: input.approvalReference,
        reason: input.reason,
      },
      {
        canViewSensitive: true,
        canWrite: true,
        organizationId: input.organizationId,
        userId: input.userId,
      }
    ),
  getProfileSource: (input) => {
    const detailPageModel = buildHrEmployeeRecordDetailPageModel({
      canViewSensitive: input.canViewSensitive,
      employeeId: input.employeeId,
      organizationId: input.organizationId,
    });

    if (!detailPageModel) {
      return null;
    }

    const employee = detailPageModel.employee;

    return {
      countryCode: employee.countryCode,
      departmentName: employee.departmentName,
      displayName: employee.displayName,
      email: employee.email,
      employeeId: input.employeeId,
      employeeNumber: employee.employeeNumber,
      employmentStatus: employee.employmentStatus,
      employmentType: employee.employmentType,
      languagePreference: employee.languagePreference,
      legalName: employee.legalName,
      managerEmployeeId: employee.managerEmployeeId,
      personalEmail: employee.personalEmail,
      phoneNumber: employee.phoneNumber,
      positionTitle: employee.positionTitle,
      preferredName: employee.preferredName,
      workLocationCode: employee.workLocationCode,
    };
  },
});

configureEmployeeSelfservicePortalLeaveAttendanceIntegration({
  listLeaveApplications: (query, context) =>
    listLeaveAttendanceManagementLeaveApplications(query, context).map(
      (record) => ({
        ...record,
        reason: record.reason ?? "",
      })
    ),
  listLeaveBalances: (query, context) =>
    listLeaveAttendanceManagementLeaveBalances(query, context),
});

const hasPermission = (
  grantedPermissions: readonly string[],
  permission: string
): boolean => grantedPermissions.includes(permission);

export const createEmployeeSelfservicePortalReadContext = async (
  _request: Request
): Promise<EmployeeSelfservicePortalApiReadContext> => {
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const canRead =
    hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrEmployeeSelfservicePortal.profileRead
    ) ||
    hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrEmployeeSelfservicePortal.recordsRead
    );
  const canReadAll = hasPermission(
    access.grantedPermissions,
    permissionCatalog.hrEmployeeSelfservicePortal.recordsReadAll
  );
  const canViewSensitive = hasPermission(
    access.grantedPermissions,
    permissionCatalog.hrEmployeeSelfservicePortal.sensitiveRead
  );

  const actorEmployeeId = resolveActorEmployeeId(access);

  return {
    actorEmployeeId,
    actorId: access.actorId,
    canRead,
    canReadAll,
    canViewSensitive,
    companyId,
    organizationId: access.organizationId ?? access.tenantId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
};

export const createEmployeeSelfservicePortalWriteContext = async (
  request: Request
): Promise<EmployeeSelfservicePortalApiWriteContext> => {
  const readContext = await createEmployeeSelfservicePortalReadContext(request);
  const { access } = await resolveHrTenantScopedAccess();

  return {
    ...readContext,
    canWrite: hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrEmployeeSelfservicePortal.write
    ),
  };
};
