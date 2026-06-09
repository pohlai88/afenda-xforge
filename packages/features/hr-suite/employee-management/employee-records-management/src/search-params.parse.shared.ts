import type { HrRecordsEmploymentStatus } from "./employment-status.schema.ts";
import { hrRecordsEmploymentStatusSchema } from "./employment-status.schema.ts";
import type { HrRecordsPageModelInput } from "./records.contract.ts";
import {
  HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RECORDS_LIST_SURFACE_KEYS,
} from "./surface-metadata.shared.ts";

const MAX_DIRECTORY_PAGE_SIZE = 100;

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return;
}

function readPositiveIntegerSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  maxValue?: number
): number | undefined {
  const rawValue = readSearchParam(searchParams, key);
  if (!rawValue) {
    return;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    return;
  }

  if (maxValue && value > maxValue) {
    return maxValue;
  }

  return value;
}

export type HrRecordsSearchParams = {
  incompleteSearch?: string;
  directorySearch?: string;
  assignmentsSearch?: string;
  auditTrailSearch?: string;
  statusHistorySearch?: string;
  documentReferencesSearch?: string;
  separatedSearch?: string;
  employmentStatusFilter?: HrRecordsEmploymentStatus;
  page?: number;
  pageSize?: number;
};

export function parseHrRecordsSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined
): HrRecordsSearchParams {
  if (!searchParams) {
    return {};
  }

  const legacySearch =
    readSearchParam(searchParams, "recordsSearch") ??
    readSearchParam(searchParams, "search");

  const parsed: HrRecordsSearchParams = {};

  for (const surfaceKey of HR_RECORDS_LIST_SURFACE_KEYS) {
    const paramKey = HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
    const modelField = HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS[
      paramKey
    ] as keyof HrRecordsSearchParams;
    if (modelField === "employmentStatusFilter") {
      const statusRaw = readSearchParam(searchParams, paramKey) ?? legacySearch;
      if (statusRaw) {
        const status = hrRecordsEmploymentStatusSchema.safeParse(statusRaw);
        if (status.success) {
          parsed.employmentStatusFilter = status.data;
        }
      }
      continue;
    }

    const recordField = modelField as Exclude<
      keyof HrRecordsSearchParams,
      "page" | "pageSize" | "employmentStatusFilter"
    >;
    parsed[recordField] =
      readSearchParam(searchParams, paramKey) ?? legacySearch;
  }

  const employmentStatusRaw =
    readSearchParam(searchParams, "employmentStatusFilter") ?? legacySearch;
  if (employmentStatusRaw) {
    const status =
      hrRecordsEmploymentStatusSchema.safeParse(employmentStatusRaw);
    if (status.success) {
      parsed.employmentStatusFilter = status.data;
    }
  }

  parsed.page = readPositiveIntegerSearchParam(searchParams, "page");
  parsed.pageSize = readPositiveIntegerSearchParam(
    searchParams,
    "pageSize",
    MAX_DIRECTORY_PAGE_SIZE
  );

  return parsed;
}

export function toHrRecordsPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrRecordsPageModelInput {
  const parsed = parseHrRecordsSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    page: parsed.page,
    pageSize: parsed.pageSize,
    incompleteSearch: parsed.incompleteSearch,
    directorySearch: parsed.directorySearch,
    assignmentsSearch: parsed.assignmentsSearch,
    auditTrailSearch: parsed.auditTrailSearch,
    statusHistorySearch: parsed.statusHistorySearch,
    documentReferencesSearch: parsed.documentReferencesSearch,
    separatedSearch: parsed.separatedSearch,
    employmentStatusFilter: parsed.employmentStatusFilter,
  };
}
