import "server-only";

import type {
  ListOvertimeManagementQuery,
  OvertimeManagementRecord,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export const overtimeManagementStore = new Map<
  string,
  OvertimeManagementRecord
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

export function listOvertimeManagementRecords(
  query: ListOvertimeManagementQuery = {},
  _context?: HrSuiteFeatureContext
): readonly OvertimeManagementRecord[] {
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);

  const filteredRecords = Array.from(overtimeManagementStore.values())
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

export function getOvertimeManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): OvertimeManagementRecord | null {
  return overtimeManagementStore.get(id) ?? null;
}
