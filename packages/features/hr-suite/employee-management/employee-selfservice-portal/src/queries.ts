import "server-only";

import { canReadEmployeeSelfservicePortal } from "./policy.ts";
import {
  getEmployeeSelfservicePortalRepositoryRecordById,
  listEmployeeSelfservicePortalRepositoryRecords,
} from "./repository.ts";
import type {
  EmployeeSelfservicePortalRecord,
  ListEmployeeSelfservicePortalQuery,
} from "./schema.ts";
import { listEmployeeSelfservicePortalQuerySchema } from "./schema.ts";
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

export function listEmployeeSelfservicePortalRecords(
  query: ListEmployeeSelfservicePortalQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalRecord[] {
  const parsedQuery = listEmployeeSelfservicePortalQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const filteredRecords = listEmployeeSelfservicePortalRepositoryRecords()
    .filter((record) => canReadEmployeeSelfservicePortal(context, record))
    .filter((record) => {
      if (!parsedQuery.employeeId) {
        return true;
      }

      return record.employeeId === parsedQuery.employeeId;
    })
    .filter((record) => {
      if (!parsedQuery.status) {
        return true;
      }

      return record.status === parsedQuery.status;
    })
    .filter((record) => {
      if (searchTerm.length === 0) {
        return true;
      }

      return (
        record.id.toLowerCase().includes(searchTerm) ||
        record.employeeId.toLowerCase().includes(searchTerm) ||
        record.employeeNumber.toLowerCase().includes(searchTerm) ||
        record.displayName.toLowerCase().includes(searchTerm) ||
        record.status.toLowerCase().includes(searchTerm)
      );
    })
    .sort((leftRecord, rightRecord) =>
      leftRecord.displayName.localeCompare(rightRecord.displayName)
    );

  const startIndex = (page - 1) * pageSize;
  return filteredRecords.slice(startIndex, startIndex + pageSize);
}

export function getEmployeeSelfservicePortalRecord(
  id: string,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalRecord | null {
  const record = getEmployeeSelfservicePortalRepositoryRecordById(id);
  if (!record) {
    return null;
  }

  return canReadEmployeeSelfservicePortal(context, record) ? record : null;
}

export {
  getEmployeeSelfservicePortalProfileUpdateRequestView,
  listEmployeeSelfservicePortalProfileUpdateRequestViews,
} from "./queries/profile-update-requests.query.ts";
