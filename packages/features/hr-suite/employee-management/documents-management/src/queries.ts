import "server-only";

import type {
  DocumentsManagementDocument,
  DocumentsManagementDocumentExpiringProjection,
  DocumentsManagementDocumentReadinessProjection,
  DocumentsManagementDocumentSummaryProjection,
  DocumentsManagementRecord,
  ListDocumentsManagementQuery,
} from "./contracts/index.ts";
import { listDocumentsManagementQuerySchema } from "./contracts/index.ts";
import type { DocumentsManagementPolicyContext } from "./policy.ts";
import {
  canReadDocumentsManagement,
  redactDocumentsManagementRecord,
} from "./policy.ts";
import {
  projectDocumentsManagementDocumentExpiring,
  projectDocumentsManagementDocumentReadiness,
  projectDocumentsManagementDocumentSummary,
} from "./projector.ts";
import {
  getDocumentsManagementRepositoryDocument,
  getDocumentsManagementRepositoryRecord,
  listDocumentsManagementRepositoryDocuments,
  listDocumentsManagementRepositoryRecords,
} from "./repository.ts";

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

const matchesOptionalString = (
  expected: string | null | undefined,
  actual: string | null | undefined
): boolean => expected === undefined || expected === actual;

const matchesOptionalBoolean = (
  expected: boolean | undefined,
  actual: boolean
): boolean => expected === undefined || expected === actual;

const matchesOptionalDateBefore = (
  actual: Date | null | undefined,
  boundary: Date | null | undefined
): boolean =>
  boundary == null ||
  (actual !== undefined && actual !== null
    ? actual.getTime() <= boundary.getTime()
    : false);

const matchesOptionalDateAfter = (
  actual: Date | null | undefined,
  boundary: Date | null | undefined
): boolean =>
  boundary == null ||
  (actual !== undefined && actual !== null
    ? actual.getTime() >= boundary.getTime()
    : false);

const matchesDocumentSearchTerm = (
  document: {
    documentCategory: string;
    documentType: string;
    employeeId: string;
    legalEntityCode?: string | null;
    status: string;
    title: string;
    visibility: string;
  },
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return (
    document.employeeId.toLowerCase().includes(searchTerm) ||
    document.legalEntityCode?.toLowerCase().includes(searchTerm) ||
    document.documentCategory.toLowerCase().includes(searchTerm) ||
    document.documentType.toLowerCase().includes(searchTerm) ||
    document.status.toLowerCase().includes(searchTerm) ||
    document.title.toLowerCase().includes(searchTerm) ||
    document.visibility.toLowerCase().includes(searchTerm)
  );
};

const matchesDocumentStatusFilters = (
  document: {
    documentCategory: string;
    documentType: string;
    employeeId: string;
    expiresAt?: Date | null;
    issuedAt?: Date | null;
    legalEntityCode?: string | null;
    mandatory: boolean;
    status: string;
    title: string;
    visibility: string;
    verifiedAt?: Date | null;
    companyId?: string | null;
  },
  query: ListDocumentsManagementQuery
): boolean => {
  if (!matchesOptionalString(query.companyId, document.companyId)) {
    return false;
  }

  if (!matchesOptionalString(query.employeeId, document.employeeId)) {
    return false;
  }

  if (!matchesOptionalString(query.legalEntityCode, document.legalEntityCode)) {
    return false;
  }

  if (
    !matchesOptionalString(query.documentCategory, document.documentCategory)
  ) {
    return false;
  }

  if (!matchesOptionalString(query.documentType, document.documentType)) {
    return false;
  }

  if (!matchesOptionalString(query.status, document.status)) {
    return false;
  }

  if (!matchesOptionalString(query.visibility, document.visibility)) {
    return false;
  }

  if (!matchesOptionalBoolean(query.mandatory, document.mandatory)) {
    return false;
  }

  if (query.verified !== undefined) {
    const isVerified =
      document.verifiedAt !== undefined && document.verifiedAt !== null;
    if (query.verified !== isVerified) {
      return false;
    }
  }

  return true;
};

const matchesDocumentDateFilters = (
  document: {
    expiresAt?: Date | null;
    issuedAt?: Date | null;
  },
  query: ListDocumentsManagementQuery
): boolean =>
  matchesOptionalDateBefore(document.expiresAt, query.expiresBefore) &&
  matchesOptionalDateAfter(document.expiresAt, query.expiresAfter) &&
  matchesOptionalDateBefore(document.issuedAt, query.issuedBefore) &&
  matchesOptionalDateAfter(document.issuedAt, query.issuedAfter);

const matchesDocumentsManagementDocumentQuery = (
  document: {
    companyId?: string | null;
    documentCategory: string;
    documentType: string;
    employeeId: string;
    expiresAt?: Date | null;
    issuedAt?: Date | null;
    legalEntityCode?: string | null;
    mandatory: boolean;
    status: string;
    title: string;
    visibility: string;
    verifiedAt?: Date | null;
  },
  query: ListDocumentsManagementQuery,
  searchTerm: string
): boolean =>
  matchesDocumentStatusFilters(document, query) &&
  matchesDocumentDateFilters(document, query) &&
  matchesDocumentSearchTerm(document, searchTerm);

export function listDocumentsManagementRecords(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementRecord[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const searchTerm = normalizeSearchTerm(query.search);
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);
  const filteredRecords = listDocumentsManagementRepositoryRecords(context)
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
  return filteredRecords
    .slice(startIndex, startIndex + pageSize)
    .map((record) =>
      redactDocumentsManagementRecord(
        record,
        Boolean(context?.canViewSensitive)
      )
    );
}

export function getDocumentsManagementRecord(
  id: string,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementRecord | null {
  if (!canReadDocumentsManagement(context)) {
    return null;
  }

  const record = getDocumentsManagementRepositoryRecord(id, context);
  return record
    ? redactDocumentsManagementRecord(
        record,
        Boolean(context?.canViewSensitive)
      )
    : null;
}

export function listDocumentsManagementDocumentSummaries(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDocumentSummaryProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const filteredDocuments = listDocumentsManagementRepositoryDocuments(context)
    .filter((document) =>
      matchesDocumentsManagementDocumentQuery(document, parsedQuery, searchTerm)
    )
    .sort(
      (leftDocument, rightDocument) =>
        leftDocument.title.localeCompare(rightDocument.title) ||
        leftDocument.employeeId.localeCompare(rightDocument.employeeId) ||
        rightDocument.updatedAt.getTime() - leftDocument.updatedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return filteredDocuments
    .slice(startIndex, startIndex + pageSize)
    .map((document) => projectDocumentsManagementDocumentSummary(document));
}

export function getDocumentsManagementDocumentSummary(
  id: string,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementDocumentSummaryProjection | null {
  if (!canReadDocumentsManagement(context)) {
    return null;
  }

  const document = getDocumentsManagementRepositoryDocument(id, context);

  return document ? projectDocumentsManagementDocumentSummary(document) : null;
}

export function listDocumentsManagementDocumentReadinessSummaries(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDocumentReadinessProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const groupedDocuments = new Map<string, DocumentsManagementDocument[]>();

  for (const document of listDocumentsManagementRepositoryDocuments(context)) {
    if (
      !matchesDocumentsManagementDocumentQuery(
        document,
        parsedQuery,
        searchTerm
      )
    ) {
      continue;
    }

    const existingDocuments = groupedDocuments.get(document.employeeId);
    if (existingDocuments) {
      existingDocuments.push(document);
      continue;
    }

    groupedDocuments.set(document.employeeId, [document]);
  }

  const readinessSummaries = Array.from(groupedDocuments.entries())
    .map(([employeeId, documents]) =>
      projectDocumentsManagementDocumentReadiness(employeeId, documents)
    )
    .sort((leftSummary, rightSummary) =>
      leftSummary.employeeId.localeCompare(rightSummary.employeeId)
    );

  const startIndex = (page - 1) * pageSize;
  return readinessSummaries.slice(startIndex, startIndex + pageSize);
}

export function listDocumentsManagementExpiringDocuments(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDocumentExpiringProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const currentTime = new Date();
  const fallbackExpiresBefore = new Date(
    currentTime.getTime() + 30 * 24 * 60 * 60 * 1000
  );
  const expiresBefore = parsedQuery.expiresBefore ?? fallbackExpiresBefore;
  const filteredDocuments = listDocumentsManagementRepositoryDocuments(context)
    .filter(
      (document) =>
        document.expiresAt !== undefined && document.expiresAt !== null
    )
    .filter((document) =>
      matchesDocumentsManagementDocumentQuery(document, parsedQuery, searchTerm)
    )
    .filter((document) => {
      const expiresAt = document.expiresAt;
      if (!expiresAt) {
        return false;
      }

      if (expiresAt.getTime() > expiresBefore.getTime()) {
        return false;
      }

      return true;
    })
    .sort(
      (leftDocument, rightDocument) =>
        (leftDocument.expiresAt?.getTime() ?? 0) -
          (rightDocument.expiresAt?.getTime() ?? 0) ||
        leftDocument.title.localeCompare(rightDocument.title)
    );

  const startIndex = (page - 1) * pageSize;
  return filteredDocuments
    .slice(startIndex, startIndex + pageSize)
    .map((document) =>
      projectDocumentsManagementDocumentExpiring(document, currentTime)
    );
}
