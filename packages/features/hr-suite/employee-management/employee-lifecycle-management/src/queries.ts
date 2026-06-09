import "server-only";

import type {
  EmployeeLifecycleManagementRecord,
  ListEmployeeLifecycleManagementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export const employeeLifecycleManagementStore = new Map<
  string,
  EmployeeLifecycleManagementRecord
>();

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

export function listEmployeeLifecycleManagementRecords(
  query: ListEmployeeLifecycleManagementQuery = {},
  _context?: HrSuiteFeatureContext
): readonly EmployeeLifecycleManagementRecord[] {
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);

  const filteredRecords = Array.from(employeeLifecycleManagementStore.values())
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

export function getEmployeeLifecycleManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): EmployeeLifecycleManagementRecord | null {
  return employeeLifecycleManagementStore.get(id) ?? null;
}
