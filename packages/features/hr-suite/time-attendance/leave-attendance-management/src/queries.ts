import "server-only";

import type {
  LeaveAttendanceManagementLeaveApplicationRecord,
  LeaveAttendanceManagementLeaveBalanceRecord,
  LeaveAttendanceManagementRecord,
  ListLeaveAttendanceManagementLeaveApplicationsQuery,
  ListLeaveAttendanceManagementLeaveBalancesQuery,
  ListLeaveAttendanceManagementQuery,
} from "./contract.ts";
import {
  leaveAttendanceManagementLeaveApplicationStore,
  leaveAttendanceManagementLeaveBalanceStore,
  leaveAttendanceManagementStore,
} from "./repository.ts";
import {
  listLeaveAttendanceManagementLeaveApplicationsQuerySchema,
  listLeaveAttendanceManagementLeaveBalancesQuerySchema,
  listLeaveAttendanceManagementQuerySchema,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const DEFAULT_PAGE_SIZE = 25;

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
};

const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const hasScopedReadAccess = (
  context: HrSuiteFeatureContext | undefined
): context is HrSuiteFeatureContext &
  Required<Pick<HrSuiteFeatureContext, "companyId" | "tenantId">> =>
  Boolean(context?.canRead && context.companyId && context.tenantId);

const canReadEmployeeScopedRecord = (
  employeeId: string,
  tenantId: string | undefined,
  companyId: string | undefined,
  context: HrSuiteFeatureContext | undefined
): boolean => {
  if (!(hasScopedReadAccess(context) && context)) {
    return false;
  }

  if (
    tenantId &&
    companyId &&
    (tenantId !== context.tenantId || companyId !== context.companyId)
  ) {
    return false;
  }

  if (context.canReadAll && context.userId) {
    return true;
  }

  return context.actorEmployeeId === employeeId;
};

export function listLeaveAttendanceManagementRecords(
  query: ListLeaveAttendanceManagementQuery = {},
  _context?: HrSuiteFeatureContext
): readonly LeaveAttendanceManagementRecord[] {
  const parsedQuery = listLeaveAttendanceManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const filteredRecords = Array.from(leaveAttendanceManagementStore.values())
    .filter((record) => {
      if (searchTerm.length === 0) {
        return true;
      }

      return (
        record.id.toLowerCase().includes(searchTerm) ||
        record.name.toLowerCase().includes(searchTerm) ||
        record.status.toLowerCase().includes(searchTerm)
      );
    })
    .sort((leftRecord, rightRecord) =>
      leftRecord.name.localeCompare(rightRecord.name)
    );

  const startIndex = (page - 1) * pageSize;
  return filteredRecords.slice(startIndex, startIndex + pageSize);
}

export function getLeaveAttendanceManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): LeaveAttendanceManagementRecord | null {
  return leaveAttendanceManagementStore.get(id) ?? null;
}

const matchesLeaveBalanceSearch = (
  record: LeaveAttendanceManagementLeaveBalanceRecord,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [record.leaveTypeCode, record.leaveTypeName, record.unit].some(
    (value) => value.toLowerCase().includes(searchTerm)
  );
};

export function listLeaveAttendanceManagementLeaveBalances(
  query: ListLeaveAttendanceManagementLeaveBalancesQuery = {},
  context?: HrSuiteFeatureContext
): readonly LeaveAttendanceManagementLeaveBalanceRecord[] {
  const parsedQuery =
    listLeaveAttendanceManagementLeaveBalancesQuerySchema.parse(query);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  const records = Array.from(
    leaveAttendanceManagementLeaveBalanceStore.values()
  )
    .filter((record) =>
      canReadEmployeeScopedRecord(
        record.employeeId,
        record.tenantId,
        record.companyId,
        context
      )
    )
    .filter((record) =>
      parsedQuery.employeeId
        ? record.employeeId === parsedQuery.employeeId
        : true
    )
    .filter((record) =>
      parsedQuery.leaveTypeCode
        ? record.leaveTypeCode === parsedQuery.leaveTypeCode
        : true
    )
    .filter((record) => matchesLeaveBalanceSearch(record, searchTerm))
    .sort(
      (left, right) =>
        left.leaveTypeName.localeCompare(right.leaveTypeName) ||
        right.updatedAt.getTime() - left.updatedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return records.slice(startIndex, startIndex + pageSize);
}

const matchesLeaveApplicationSearch = (
  record: LeaveAttendanceManagementLeaveApplicationRecord,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    record.id,
    record.leaveTypeCode,
    record.leaveTypeName,
    record.status,
    record.approvalReference,
    record.reason,
    record.rejectionReason,
  ].some((value) => value?.toLowerCase().includes(searchTerm) ?? false);
};

export function listLeaveAttendanceManagementLeaveApplications(
  query: ListLeaveAttendanceManagementLeaveApplicationsQuery = {},
  context?: HrSuiteFeatureContext
): readonly LeaveAttendanceManagementLeaveApplicationRecord[] {
  const parsedQuery =
    listLeaveAttendanceManagementLeaveApplicationsQuerySchema.parse(query);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  const records = Array.from(
    leaveAttendanceManagementLeaveApplicationStore.values()
  )
    .filter((record) =>
      canReadEmployeeScopedRecord(
        record.employeeId,
        record.tenantId,
        record.companyId,
        context
      )
    )
    .filter((record) =>
      parsedQuery.employeeId
        ? record.employeeId === parsedQuery.employeeId
        : true
    )
    .filter((record) =>
      parsedQuery.leaveTypeCode
        ? record.leaveTypeCode === parsedQuery.leaveTypeCode
        : true
    )
    .filter((record) =>
      parsedQuery.status ? record.status === parsedQuery.status : true
    )
    .filter((record) => matchesLeaveApplicationSearch(record, searchTerm))
    .sort(
      (left, right) =>
        right.submittedAt.getTime() - left.submittedAt.getTime() ||
        right.updatedAt.getTime() - left.updatedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return records.slice(startIndex, startIndex + pageSize);
}
