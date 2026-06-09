import "server-only";

import type {
  GeolocationRemoteCheckinRecord,
  ListGeolocationRemoteCheckinQuery,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export const geolocationRemoteCheckinStore = new Map<
  string,
  GeolocationRemoteCheckinRecord
>();

const DEFAULT_PAGE_SIZE = 25;

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
}

function normalizeSearchTerm(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function listGeolocationRemoteCheckinRecords(
  query: ListGeolocationRemoteCheckinQuery = {},
  _context?: HrSuiteFeatureContext
): readonly GeolocationRemoteCheckinRecord[] {
  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);

  const filteredRecords = Array.from(geolocationRemoteCheckinStore.values())
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

export function getGeolocationRemoteCheckinRecord(
  id: string,
  _context?: HrSuiteFeatureContext
): GeolocationRemoteCheckinRecord | null {
  return geolocationRemoteCheckinStore.get(id) ?? null;
}
