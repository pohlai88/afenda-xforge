import "server-only";

import type {
  DocumentsManagementRecord,
  ListDocumentsManagementQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export const documentsManagementStore = new Map<
  string,
  DocumentsManagementRecord
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

export function listDocumentsManagementRecords(
  query: ListDocumentsManagementQuery = {},
  _context?: HrSuiteFeatureContext
): readonly DocumentsManagementRecord[] {
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);

  const filteredRecords = Array.from(documentsManagementStore.values())
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

export function getDocumentsManagementRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): DocumentsManagementRecord | null {
  return documentsManagementStore.get(id) ?? null;
}
