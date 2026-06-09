import "server-only";

import type {
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "../hr.workforce.records.contract.ts";
import { canReadHrEmployeeRecord } from "../policy.ts";
import { projectHrEmployeeRecordCoverage } from "../projector/completeness.ts";
import {
  isHrEmployeeRecordArchived,
  projectHrEmployeeRecordSummary,
  sortHrEmployeeRecordSummaries,
} from "../projector/record-summary.ts";
import { loadHrEmployeeRecordsRepository } from "../repository.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

const normalizeSearch = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

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

export function listHrEmployeeRecordSummaries(
  query: HrRecordsSearchParams = {},
  context?: QueryContext
): readonly HrEmployeeRecordSummary[] {
  if (!canReadHrEmployeeRecord(context ?? {})) {
    return [];
  }

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
}
