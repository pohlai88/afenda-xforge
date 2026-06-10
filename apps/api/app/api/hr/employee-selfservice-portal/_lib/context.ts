import {
  buildHrEmployeeRecordDetailPageModel,
  updateHrEmployeeRecord,
} from "@repo/features-employee-management-employee-records-management/server";
import {
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration,
  configureEmployeeSelfservicePortalLeaveAttendanceIntegration,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import {
  listLeaveAttendanceManagementLeaveApplications,
  listLeaveAttendanceManagementLeaveBalances,
} from "../../../../../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/server.ts";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
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

export const createEmployeeSelfservicePortalReadContext = (
  request: Request
): EmployeeSelfservicePortalApiReadContext => ({
  actorEmployeeId: header(request, "x-actor-employee-id"),
  actorId: header(request, "x-actor-id"),
  canRead:
    boolHeader(request, "x-can-read-employee-selfservice-portal") ?? false,
  canReadAll:
    boolHeader(request, "x-can-read-all-employee-selfservice-portal") ?? false,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-employee-selfservice-portal") ??
    false,
  companyId: header(request, "x-company-id"),
  organizationId: header(request, "x-organization-id"),
  requestId: header(request, "x-request-id"),
  tenantId: header(request, "x-tenant-id"),
  userId: header(request, "x-user-id"),
});

export const createEmployeeSelfservicePortalWriteContext = (
  request: Request
): EmployeeSelfservicePortalApiWriteContext => ({
  ...createEmployeeSelfservicePortalReadContext(request),
  canWrite:
    boolHeader(request, "x-can-write-employee-selfservice-portal") ?? false,
});
