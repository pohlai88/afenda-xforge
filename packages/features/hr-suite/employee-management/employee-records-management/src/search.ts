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
import {
  hasPostgresSearchConfig,
  resolveSearchProvider,
  searchWorkspaceDocumentsPostgres,
  softDeleteWorkspaceSearchDocument,
  upsertWorkspaceSearchDocument,
} from "@repo/search/postgres";
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
const hrWorkspaceSearchPath = "/hr";

export type HrEmployeeRecordsSearchContext = {
  companyId?: string | null;
  organizationId?: string;
  tenantId: string;
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
let primedTenantId: string | null = null;

const usesPostgresWorkspaceSearch = (): boolean =>
  resolveSearchProvider() === "postgres" && hasPostgresSearchConfig();

const hasSearchBackend = (): boolean =>
  usesPostgresWorkspaceSearch() || hasMeilisearchConfig();

const normalizeOrganizationId = (organizationId?: string | null): string =>
  organizationId?.trim() || defaultOrganizationId;

const resolveSearchTenantId = (
  context?: HrEmployeeRecordsSearchContext
): string | null => {
  const tenantId = context?.tenantId?.trim();
  return tenantId ? tenantId : null;
};

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

const isSeparatedOrArchivedStatus = (
  status: HrRecordsEmploymentStatus
): boolean => status === "archived" || status === "separated";

const matchesHrStatusFilter = (
  record: Pick<HrEmployeeRecordDetail, "employmentStatus">,
  query: HrRecordsSearchParams
): boolean => {
  if (query.employmentStatusFilter) {
    return record.employmentStatus === query.employmentStatusFilter;
  }

  if (normalizeSearchTerm(query.separatedSearch)) {
    return isSeparatedOrArchivedStatus(record.employmentStatus);
  }

  return (
    record.employmentStatus === "draft" || record.employmentStatus === "active"
  );
};

const matchesHrOrganizationFilter = (
  record: Pick<RepositoryRecord, "organizationId">,
  context?: HrEmployeeRecordsSearchContext
): boolean => {
  const organizationId = context?.organizationId?.trim();
  if (!organizationId) {
    return true;
  }

  return normalizeOrganizationId(record.organizationId) === organizationId;
};

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
  context: HrEmployeeRecordsSearchContext
): HrEmployeeRecordSearchDocument => {
  const tenantId = resolveSearchTenantId(context);
  if (!tenantId) {
    throw new Error("tenantId is required for HR search documents");
  }

  const organizationId = normalizeOrganizationId(context.organizationId);

  return {
    id: record.id,
    tenantId,
    companyId: context.companyId ?? undefined,
    title: record.displayName,
    description:
      `${record.employeeNumber} ${record.employmentStatus} ${record.legalName} ${record.email}`.trim(),
    url: hrWorkspaceSearchPath,
    metadata: {
      displayName: record.displayName,
      employeeNumber: record.employeeNumber,
      employmentStatus: record.employmentStatus,
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
  record: RepositoryRecord,
  context: HrEmployeeRecordsSearchContext
): HrEmployeeRecordSearchDocument =>
  buildHrEmployeeRecordSearchDocument(record, {
    ...context,
    organizationId: record.organizationId ?? context.organizationId,
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

const primePostgresWorkspaceSearchIndex = async (
  context: HrEmployeeRecordsSearchContext
): Promise<void> => {
  for (const record of loadHrEmployeeRecordsRepository().records) {
    if (!matchesHrOrganizationFilter(record, context)) {
      continue;
    }

    if (isSeparatedOrArchivedStatus(record.employmentStatus)) {
      continue;
    }

    await upsertWorkspaceSearchDocument(
      hrEmployeeRecordsSearchIndexKey,
      buildHrEmployeeRecordSearchDocumentFromRepository(record, context)
    );
  }
};

const ensureSearchPrimed = async (
  context?: HrEmployeeRecordsSearchContext
): Promise<boolean> => {
  if (!hasSearchBackend()) {
    return false;
  }

  const tenantId = resolveSearchTenantId(context);
  if (!tenantId) {
    return false;
  }

  ensureHrEmployeeRecordsSearchIndexRegistered();

  if (searchIndexPrimed && primedTenantId === tenantId) {
    return true;
  }

  if (usesPostgresWorkspaceSearch()) {
    await primePostgresWorkspaceSearchIndex({
      ...context,
      tenantId,
    });
  } else {
    const indexer = createMeilisearchIndexer();
    await indexer.reindexAll(
      hrEmployeeRecordsSearchIndexKey,
      async (): Promise<readonly SearchDocument[]> =>
        loadHrEmployeeRecordsRepository().records
          .filter((record) => matchesHrOrganizationFilter(record, context))
          .map((record) =>
            buildHrEmployeeRecordSearchDocumentFromRepository(record, {
              ...context,
              tenantId,
              organizationId: record.organizationId ?? context?.organizationId,
            })
          )
    );
  }

  searchIndexPrimed = true;
  primedTenantId = tenantId;

  return true;
};

export const hasHrEmployeeRecordsSearch = (): boolean => hasSearchBackend();

export const syncAllHrEmployeeRecordsSearchDocuments = async (
  context: HrEmployeeRecordsSearchContext
): Promise<void> => {
  if (!(await ensureSearchPrimed(context))) {
    return;
  }
};

export const syncHrEmployeeRecordSearchDocument = async (
  record: HrEmployeeRecordDetail,
  context: HrEmployeeRecordsSearchContext
): Promise<void> => {
  if (!hasSearchBackend()) {
    return;
  }

  const tenantId = resolveSearchTenantId(context);
  if (!tenantId) {
    throw new Error("tenantId is required to sync HR search documents");
  }

  ensureHrEmployeeRecordsSearchIndexRegistered();

  const document = buildHrEmployeeRecordSearchDocument(record, context);

  if (usesPostgresWorkspaceSearch()) {
    if (isSeparatedOrArchivedStatus(record.employmentStatus)) {
      await softDeleteWorkspaceSearchDocument(
        tenantId,
        hrEmployeeRecordsSearchIndexKey,
        String(record.id)
      );
      return;
    }

    await upsertWorkspaceSearchDocument(
      hrEmployeeRecordsSearchIndexKey,
      document
    );
    return;
  }

  const indexer = createMeilisearchIndexer();
  await indexer.indexDocument(hrEmployeeRecordsSearchIndexKey, document);
};

const searchHrEmployeeRecordsPostgres = async (
  query: HrRecordsSearchParams,
  context: HrEmployeeRecordsSearchContext
): Promise<readonly HrEmployeeRecordSummary[]> => {
  const searchTerm = getSearchTerm(query);
  if (!searchTerm) {
    return [];
  }

  const tenantId = resolveSearchTenantId(context);
  if (!tenantId) {
    return [];
  }

  const results = await searchWorkspaceDocumentsPostgres({
    limit: searchBatchSize,
    query: searchTerm,
    tenantId,
  });

  const records: HrEmployeeRecordSummary[] = [];
  const seenRecordIds = new Set<string>();
  const repository = loadHrEmployeeRecordsRepository();

  for (const result of results) {
    if (result.indexKey !== hrEmployeeRecordsSearchIndexKey) {
      continue;
    }

    if (seenRecordIds.has(result.id)) {
      continue;
    }

    const record = repository.records.find((entry) => entry.id === result.id);
    if (!record) {
      continue;
    }

    if (!matchesHrOrganizationFilter(record, context)) {
      continue;
    }

    if (!matchesHrStatusFilter(record, query)) {
      continue;
    }

    seenRecordIds.add(result.id);
    records.push(
      projectHrEmployeeRecordSummary({
        id: record.id,
        employeeNumber: record.employeeNumber,
        displayName: record.displayName,
        employmentStatus: record.employmentStatus,
      })
    );
  }

  return records;
};

export const searchHrEmployeeRecords = async (
  query: HrRecordsSearchParams = {},
  context?: HrEmployeeRecordsSearchContext
): Promise<readonly HrEmployeeRecordSummary[] | null> => {
  if (!isEligibleSearchQuery(query)) {
    return null;
  }

  const tenantId = resolveSearchTenantId(context);
  if (!tenantId) {
    return null;
  }

  const scopedContext: HrEmployeeRecordsSearchContext = {
    ...context,
    tenantId,
  };

  if (!(await ensureSearchPrimed(scopedContext))) {
    return null;
  }

  const searchTerm = getSearchTerm(query);
  if (!searchTerm) {
    return null;
  }

  if (usesPostgresWorkspaceSearch()) {
    return searchHrEmployeeRecordsPostgres(query, scopedContext);
  }

  if (!hasMeilisearchConfig()) {
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
