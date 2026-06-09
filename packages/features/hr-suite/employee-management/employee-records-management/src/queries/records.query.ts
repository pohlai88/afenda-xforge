import "server-only";

import { canReadHrEmployeeRecord } from "../policy.ts";
import { projectHrEmployeeRecordCoverage } from "../projector/completeness.ts";
import {
  isHrEmployeeRecordArchived,
  projectHrEmployeeRecordSummary,
  sortHrEmployeeRecordSummaries,
} from "../projector/record-summary.ts";
import type {
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "../records.contract.ts";
import { loadHrEmployeeRecordsRepository } from "../repository.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

export type HrEmployeeRecordSummariesPage = {
  records: readonly HrEmployeeRecordSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

const DEFAULT_DIRECTORY_PAGE_SIZE = 25;
const MAX_DIRECTORY_PAGE_SIZE = 100;

const normalizeSearch = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const resolvePage = (value: number | undefined): number => {
  const resolvedValue = value ?? 1;
  return Number.isFinite(resolvedValue) && resolvedValue > 0
    ? Math.floor(resolvedValue)
    : 1;
};

const resolvePageSize = (value: number | undefined): number => {
  const resolvedValue = value ?? DEFAULT_DIRECTORY_PAGE_SIZE;
  if (!Number.isFinite(resolvedValue) || resolvedValue <= 0) {
    return DEFAULT_DIRECTORY_PAGE_SIZE;
  }

  return Math.min(Math.floor(resolvedValue), MAX_DIRECTORY_PAGE_SIZE);
};

const paginate = <T>(
  values: readonly T[],
  page: number,
  pageSize: number
): readonly T[] => {
  const start = (page - 1) * pageSize;
  return values.slice(start, start + pageSize);
};

const matchesSummarySearch = (
  record: HrEmployeeRecordSummary,
  search: string
): boolean => {
  if (!search) {
    return true;
  }

  return (
    record.employeeNumber.toLowerCase().includes(search) ||
    record.displayName.toLowerCase().includes(search) ||
    record.employmentStatus.toLowerCase().includes(search)
  );
};

const matchesIncompleteSearch = (
  record: HrEmployeeRecordSummary,
  coverageMissingFields: readonly string[],
  search: string
): boolean => {
  if (!search) {
    return true;
  }

  const searchable = [
    record.employeeNumber,
    record.displayName,
    record.employmentStatus,
    ...coverageMissingFields,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(search);
};

const shouldIncludeRecord = (
  record: HrEmployeeRecordSummary,
  query: HrRecordsSearchParams
): boolean => {
  if (query.employmentStatusFilter) {
    return record.employmentStatus === query.employmentStatusFilter;
  }

  if (query.separatedSearch) {
    return (
      record.employmentStatus === "archived" ||
      record.employmentStatus === "separated"
    );
  }

  return (
    !isHrEmployeeRecordArchived(record) &&
    record.employmentStatus !== "separated"
  );
};

const buildScopedDirectoryRecords = (
  query: HrRecordsSearchParams,
  context: QueryContext | undefined
): readonly HrEmployeeRecordSummary[] => {
  const records = loadHrEmployeeRecordsRepository().records.filter(
    (record) =>
      !context?.organizationId ||
      record.organizationId === context.organizationId
  );
  const search = normalizeSearch(
    query.directorySearch ?? query.separatedSearch ?? query.incompleteSearch
  );
  const incompleteMode = Boolean(query.incompleteSearch);

  return sortHrEmployeeRecordSummaries(
    records
      .filter((record) =>
        shouldIncludeRecord(projectHrEmployeeRecordSummary(record), query)
      )
      .filter((record) => {
        const summary = projectHrEmployeeRecordSummary(record);
        const coverage = projectHrEmployeeRecordCoverage(record);

        if (incompleteMode) {
          if (coverage.isComplete) {
            return false;
          }

          return matchesIncompleteSearch(
            summary,
            coverage.missingFields,
            search
          );
        }

        return matchesSummarySearch(summary, search);
      })
      .map(projectHrEmployeeRecordSummary)
  );
};

export function listHrEmployeeRecordSummariesPage(
  query: HrRecordsSearchParams = {},
  context?: QueryContext
): HrEmployeeRecordSummariesPage {
  const page = resolvePage(query.page);
  const pageSize = resolvePageSize(query.pageSize);

  if (!canReadHrEmployeeRecord(context ?? {})) {
    return {
      records: [],
      page,
      pageSize,
      totalCount: 0,
      hasNextPage: false,
    };
  }

  const filteredRecords = buildScopedDirectoryRecords(query, context);
  const pagedRecords = paginate(filteredRecords, page, pageSize);

  return {
    records: pagedRecords,
    page,
    pageSize,
    totalCount: filteredRecords.length,
    hasNextPage: page * pageSize < filteredRecords.length,
  };
}

export function listHrEmployeeRecordSummaries(
  query: HrRecordsSearchParams = {},
  context?: QueryContext
): readonly HrEmployeeRecordSummary[] {
  if (!canReadHrEmployeeRecord(context ?? {})) {
    return [];
  }

  return buildScopedDirectoryRecords(query, context);
}
