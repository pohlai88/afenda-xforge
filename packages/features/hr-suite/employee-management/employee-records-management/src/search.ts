import "server-only";

import type { SearchDocument, SearchQueryOptions } from "@repo/search";
import {
  applySearchLanguagePreset,
  getSearchIndexDefinition,
  registerSearchIndex,
} from "@repo/search";
import {
  createMeilisearchIndexer,
  createMeilisearchSearchClient,
  hasMeilisearchConfig,
} from "@repo/search/meilisearch";
import type { HrRecordsEmploymentStatus } from "./employment-status.schema.ts";
import { projectHrEmployeeRecordSummary } from "./projector/record-summary.ts";
import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsSearchParams,
} from "./records.contract.ts";
import { loadHrEmployeeRecordsRepository } from "./repository.ts";

const hrEmployeeRecordsSearchIndexKey = "hr_employee_records";
const defaultOrganizationId = "__global__";
const searchBatchSize = 100;

type HrEmployeeRecordsSearchContext = {
  organizationId?: string;
};

type HrEmployeeRecordSearchDocument = SearchDocument & {
  organizationId: string;
  displayName: string;
  email: string;
  employeeNumber: string;
  employmentStatus: HrRecordsEmploymentStatus;
  legalName: string;
  preferredName?: string | null;
  recordType: "hrEmployeeRecord";
};

type RepositoryRecord = ReturnType<
  typeof loadHrEmployeeRecordsRepository
>["records"][number];

let searchIndexPrimed = false;

const normalizeOrganizationId = (organizationId?: string | null): string =>
  organizationId?.trim() || defaultOrganizationId;

const normalizeSearchTerm = (value?: string): string | null => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
};

const escapeFilterValue = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

const buildOrganizationFilter = (
  context?: HrEmployeeRecordsSearchContext
): string | null => {
  const organizationId = context?.organizationId?.trim();
  return organizationId
    ? `organizationId = "${escapeFilterValue(organizationId)}"`
    : null;
};

const buildStatusFilter = (query: HrRecordsSearchParams): string => {
  if (query.employmentStatusFilter) {
    return `employmentStatus = "${escapeFilterValue(query.employmentStatusFilter)}"`;
  }

  if (normalizeSearchTerm(query.separatedSearch)) {
    return '(employmentStatus = "archived" OR employmentStatus = "separated")';
  }

  return '(employmentStatus = "draft" OR employmentStatus = "active")';
};

const buildSearchFilter = (
  query: HrRecordsSearchParams,
  context?: HrEmployeeRecordsSearchContext
): SearchQueryOptions["filter"] => {
  const filters = [buildOrganizationFilter(context), buildStatusFilter(query)]
    .filter((value): value is string => Boolean(value))
    .map((value) => `(${value})`);

  if (filters.length === 0) {
    return;
  }

  return filters.join(" AND ");
};

const isEligibleSearchQuery = (query: HrRecordsSearchParams): boolean =>
  !normalizeSearchTerm(query.incompleteSearch) &&
  Boolean(
    normalizeSearchTerm(query.directorySearch) ??
      normalizeSearchTerm(query.separatedSearch)
  );

const getSearchTerm = (query: HrRecordsSearchParams): string | null =>
  normalizeSearchTerm(query.directorySearch) ??
  normalizeSearchTerm(query.separatedSearch);

const buildHrEmployeeRecordSearchDocument = (
  record: Pick<
    HrEmployeeRecordDetail,
    | "displayName"
    | "email"
    | "employeeNumber"
    | "employmentStatus"
    | "id"
    | "legalName"
    | "preferredName"
  >,
  context?: HrEmployeeRecordsSearchContext
): HrEmployeeRecordSearchDocument => {
  const organizationId = normalizeOrganizationId(context?.organizationId);

  return {
    id: record.id,
    tenantId: organizationId,
    companyId: organizationId,
    title: record.displayName,
    description:
      `${record.employeeNumber} ${record.employmentStatus} ${record.legalName} ${record.email}`.trim(),
    metadata: {
      organizationId,
      recordType: "hrEmployeeRecord",
    },
    organizationId,
    displayName: record.displayName,
    email: record.email,
    employeeNumber: record.employeeNumber,
    employmentStatus: record.employmentStatus,
    legalName: record.legalName,
    preferredName: record.preferredName,
    recordType: "hrEmployeeRecord",
  };
};

const buildHrEmployeeRecordSearchDocumentFromRepository = (
  record: RepositoryRecord
): HrEmployeeRecordSearchDocument =>
  buildHrEmployeeRecordSearchDocument(record, {
    organizationId: record.organizationId ?? undefined,
  });

const toRecordSummary = (
  document: HrEmployeeRecordSearchDocument
): HrEmployeeRecordSummary =>
  projectHrEmployeeRecordSummary({
    id: String(document.id),
    employeeNumber: document.employeeNumber,
    displayName: document.displayName,
    employmentStatus: document.employmentStatus,
  });

const ensureHrEmployeeRecordsSearchIndexRegistered = (): void => {
  if (getSearchIndexDefinition(hrEmployeeRecordsSearchIndexKey)) {
    return;
  }

  registerSearchIndex(
    applySearchLanguagePreset(
      {
        key: hrEmployeeRecordsSearchIndexKey,
        searchableAttributes: [
          "employeeNumber",
          "displayName",
          "legalName",
          "preferredName",
          "email",
          "employmentStatus",
          "title",
          "description",
        ],
        filterableAttributes: [
          "tenantId",
          "companyId",
          "organizationId",
          "employmentStatus",
        ],
        sortableAttributes: ["employeeNumber", "displayName"],
        displayedAttributes: [
          "id",
          "tenantId",
          "companyId",
          "organizationId",
          "employeeNumber",
          "displayName",
          "employmentStatus",
          "legalName",
          "preferredName",
          "email",
        ],
        distinctAttribute: "id",
      },
      "en"
    )
  );
};

const ensureSearchPrimed = async (): Promise<boolean> => {
  if (!hasMeilisearchConfig()) {
    return false;
  }

  ensureHrEmployeeRecordsSearchIndexRegistered();

  if (searchIndexPrimed) {
    return true;
  }

  const indexer = createMeilisearchIndexer();
  await indexer.reindexAll(
    hrEmployeeRecordsSearchIndexKey,
    async (): Promise<readonly SearchDocument[]> =>
      loadHrEmployeeRecordsRepository().records.map(
        buildHrEmployeeRecordSearchDocumentFromRepository
      )
  );
  searchIndexPrimed = true;

  return true;
};

export const hasHrEmployeeRecordsSearch = (): boolean => hasMeilisearchConfig();

export const syncAllHrEmployeeRecordsSearchDocuments =
  async (): Promise<void> => {
    if (!(await ensureSearchPrimed())) {
      return;
    }
  };

export const syncHrEmployeeRecordSearchDocument = async (
  record: HrEmployeeRecordDetail,
  context?: HrEmployeeRecordsSearchContext
): Promise<void> => {
  if (!hasMeilisearchConfig()) {
    return;
  }

  ensureHrEmployeeRecordsSearchIndexRegistered();

  const indexer = createMeilisearchIndexer();
  await indexer.indexDocument(
    hrEmployeeRecordsSearchIndexKey,
    buildHrEmployeeRecordSearchDocument(record, context)
  );
};

export const searchHrEmployeeRecords = async (
  query: HrRecordsSearchParams = {},
  context?: HrEmployeeRecordsSearchContext
): Promise<readonly HrEmployeeRecordSummary[] | null> => {
  if (!isEligibleSearchQuery(query)) {
    return null;
  }

  if (!(await ensureSearchPrimed())) {
    return null;
  }

  const searchTerm = getSearchTerm(query);
  if (!searchTerm) {
    return null;
  }

  const searchClient = createMeilisearchSearchClient();
  const records: HrEmployeeRecordSummary[] = [];
  const seenRecordIds = new Set<string>();

  for (let offset = 0; ; offset += searchBatchSize) {
    const results = await searchClient.search<HrEmployeeRecordSearchDocument>({
      query: searchTerm,
      indices: [hrEmployeeRecordsSearchIndexKey],
      filter: buildSearchFilter(query, context),
      limit: searchBatchSize,
      offset,
    });

    if (results.length === 0) {
      break;
    }

    for (const result of results) {
      if (seenRecordIds.has(result.id)) {
        continue;
      }

      seenRecordIds.add(result.id);
      records.push(toRecordSummary(result.document));
    }

    if (results.length < searchBatchSize) {
      break;
    }
  }

  return records;
};
