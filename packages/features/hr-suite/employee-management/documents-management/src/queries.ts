import "server-only";

import type {
  DocumentsManagementAlertReadyProjection,
  DocumentsManagementDocument,
  DocumentsManagementDocumentExpiringProjection,
  DocumentsManagementDocumentObligation,
  DocumentsManagementDocumentObligationProjection,
  DocumentsManagementDocumentReadinessProjection,
  DocumentsManagementDocumentSummaryProjection,
  DocumentsManagementDownstreamReadinessProjection,
  DocumentsManagementMissingRequirementProjection,
  DocumentsManagementPolicyAcknowledgmentSummaryProjection,
  DocumentsManagementRecord,
  DocumentsManagementRetentionCandidateProjection,
  ListDocumentsManagementQuery,
  ListDocumentsManagementRetentionCandidatesQuery,
} from "./contracts/index.ts";
import {
  listDocumentsManagementQuerySchema,
  listDocumentsManagementRetentionCandidatesQuerySchema,
} from "./contracts/index.ts";
import type { DocumentsManagementPolicyContext } from "./policy.ts";
import {
  canReadDocumentsManagement,
  redactDocumentsManagementDocumentObligation,
  redactDocumentsManagementRecord,
} from "./policy.ts";
import {
  projectDocumentsManagementAlertReady,
  projectDocumentsManagementDocumentExpiring,
  projectDocumentsManagementDocumentObligation,
  projectDocumentsManagementDocumentReadiness,
  projectDocumentsManagementDocumentSummary,
  projectDocumentsManagementDownstreamReadiness,
  projectDocumentsManagementMissingRequirement,
  projectDocumentsManagementPolicyAcknowledgmentSummary,
  projectDocumentsManagementRetentionCandidate,
} from "./projector.ts";
import {
  getDocumentsManagementRepositoryDocument,
  getDocumentsManagementRepositoryRecord,
  listDocumentsManagementRepositoryDocumentObligations,
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
  document: DocumentsManagementDocument,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return (
    document.employeeId.toLowerCase().includes(searchTerm) ||
    document.legalEntityCode?.toLowerCase().includes(searchTerm) ||
    document.jurisdictionCode?.toLowerCase().includes(searchTerm) ||
    document.documentCategory.toLowerCase().includes(searchTerm) ||
    document.documentType.toLowerCase().includes(searchTerm) ||
    document.status.toLowerCase().includes(searchTerm) ||
    document.title.toLowerCase().includes(searchTerm) ||
    document.visibility.toLowerCase().includes(searchTerm)
  );
};

const matchesDocumentsManagementDocumentQuery = (
  document: DocumentsManagementDocument,
  query: ListDocumentsManagementQuery,
  searchTerm: string
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
    !matchesOptionalString(query.jurisdictionCode, document.jurisdictionCode)
  ) {
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

  if (
    !(
      matchesOptionalDateBefore(document.expiresAt, query.expiresBefore) &&
      matchesOptionalDateAfter(document.expiresAt, query.expiresAfter) &&
      matchesOptionalDateBefore(document.issuedAt, query.issuedBefore) &&
      matchesOptionalDateAfter(document.issuedAt, query.issuedAfter) &&
      matchesOptionalDateBefore(document.uploadedAt, query.uploadedAtBefore) &&
      matchesOptionalDateAfter(document.uploadedAt, query.uploadedAtAfter)
    )
  ) {
    return false;
  }

  return matchesDocumentSearchTerm(document, searchTerm);
};

const matchesObligationSearchTerm = (
  obligation: DocumentsManagementDocumentObligation,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return (
    obligation.employeeId.toLowerCase().includes(searchTerm) ||
    (obligation.legalEntityCode?.toLowerCase().includes(searchTerm) ?? false) ||
    (obligation.jurisdictionCode?.toLowerCase().includes(searchTerm) ??
      false) ||
    obligation.documentCategory.toLowerCase().includes(searchTerm) ||
    obligation.documentType.toLowerCase().includes(searchTerm) ||
    obligation.title.toLowerCase().includes(searchTerm) ||
    (obligation.policyId?.toLowerCase().includes(searchTerm) ?? false) ||
    (obligation.policyVersion?.toLowerCase().includes(searchTerm) ?? false)
  );
};

const matchesDocumentsManagementObligationQuery = (
  obligation: DocumentsManagementDocumentObligation,
  query: ListDocumentsManagementQuery,
  searchTerm: string
): boolean => {
  if (!matchesOptionalString(query.companyId, obligation.companyId)) {
    return false;
  }

  if (!matchesOptionalString(query.employeeId, obligation.employeeId)) {
    return false;
  }

  if (
    !matchesOptionalString(query.legalEntityCode, obligation.legalEntityCode)
  ) {
    return false;
  }

  if (
    !matchesOptionalString(query.jurisdictionCode, obligation.jurisdictionCode)
  ) {
    return false;
  }

  if (
    !matchesOptionalString(query.documentCategory, obligation.documentCategory)
  ) {
    return false;
  }

  if (!matchesOptionalString(query.documentType, obligation.documentType)) {
    return false;
  }

  if (!matchesOptionalBoolean(query.mandatory, obligation.mandatory)) {
    return false;
  }

  if (query.obligationStatus && obligation.status !== query.obligationStatus) {
    return false;
  }

  if (query.acknowledgmentStatus) {
    const acknowledgmentStatus =
      obligation.status === "satisfied" ? "acknowledged" : "pending";

    if (acknowledgmentStatus !== query.acknowledgmentStatus) {
      return false;
    }
  }

  if (
    !(
      matchesOptionalDateBefore(obligation.expiresAt, query.expiresBefore) &&
      matchesOptionalDateAfter(obligation.expiresAt, query.expiresAfter)
    )
  ) {
    return false;
  }

  if (query.requiresAttention !== undefined) {
    const requiresAttention = obligation.status !== "satisfied";
    if (requiresAttention !== query.requiresAttention) {
      return false;
    }
  }

  return matchesObligationSearchTerm(obligation, searchTerm);
};

const paginate = <T>(
  items: readonly T[],
  query: ListDocumentsManagementQuery
) => {
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

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

  return paginate(filteredDocuments, parsedQuery).map((document) =>
    projectDocumentsManagementDocumentSummary(document)
  );
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

export function listDocumentsManagementDocumentObligations(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDocumentObligationProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  return paginate(
    listDocumentsManagementRepositoryDocumentObligations(context)
      .filter((obligation) =>
        matchesDocumentsManagementObligationQuery(
          obligation,
          parsedQuery,
          searchTerm
        )
      )
      .map((obligation) =>
        redactDocumentsManagementDocumentObligation(
          obligation,
          Boolean(context?.canViewSensitive)
        )
      )
      .sort(
        (left, right) =>
          left.employeeId.localeCompare(right.employeeId) ||
          left.title.localeCompare(right.title)
      ),
    parsedQuery
  ).map((obligation) =>
    projectDocumentsManagementDocumentObligation(obligation)
  );
}

export function listDocumentsManagementPolicyAcknowledgmentSummaries(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementPolicyAcknowledgmentSummaryProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  return paginate(
    listDocumentsManagementRepositoryDocumentObligations(context)
      .filter(
        (obligation) => obligation.obligationType === "policy_acknowledgment"
      )
      .filter((obligation) =>
        matchesDocumentsManagementObligationQuery(
          obligation,
          parsedQuery,
          searchTerm
        )
      )
      .sort(
        (left, right) =>
          left.employeeId.localeCompare(right.employeeId) ||
          left.title.localeCompare(right.title)
      ),
    parsedQuery
  ).map((obligation) =>
    projectDocumentsManagementPolicyAcknowledgmentSummary(obligation)
  );
}

export function listDocumentsManagementMissingRequirementSummaries(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementMissingRequirementProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  return paginate(
    listDocumentsManagementRepositoryDocumentObligations(context)
      .filter((obligation) => obligation.status !== "satisfied")
      .filter((obligation) =>
        matchesDocumentsManagementObligationQuery(
          obligation,
          parsedQuery,
          searchTerm
        )
      )
      .sort(
        (left, right) =>
          left.employeeId.localeCompare(right.employeeId) ||
          left.title.localeCompare(right.title)
      ),
    parsedQuery
  ).map((obligation) =>
    projectDocumentsManagementMissingRequirement(obligation)
  );
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
  const groupedDocuments = new Map<string, DocumentsManagementDocument[]>();
  const groupedObligations = new Map<
    string,
    DocumentsManagementDocumentObligation[]
  >();

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

  for (const obligation of listDocumentsManagementRepositoryDocumentObligations(
    context
  )) {
    if (
      !matchesDocumentsManagementObligationQuery(
        obligation,
        parsedQuery,
        searchTerm
      )
    ) {
      continue;
    }

    const existingObligations = groupedObligations.get(obligation.employeeId);
    if (existingObligations) {
      existingObligations.push(obligation);
      continue;
    }

    groupedObligations.set(obligation.employeeId, [obligation]);
  }

  const employeeIds = new Set([
    ...groupedDocuments.keys(),
    ...groupedObligations.keys(),
  ]);

  const readinessSummaries = Array.from(employeeIds)
    .map((employeeId) =>
      projectDocumentsManagementDocumentReadiness(
        employeeId,
        groupedDocuments.get(employeeId) ?? [],
        groupedObligations.get(employeeId) ?? []
      )
    )
    .sort((leftSummary, rightSummary) =>
      leftSummary.employeeId.localeCompare(rightSummary.employeeId)
    );

  return paginate(readinessSummaries, parsedQuery);
}

export function listDocumentsManagementDownstreamReadinessSummaries(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementDownstreamReadinessProjection[] {
  return listDocumentsManagementDocumentReadinessSummaries(query, context).map(
    (projection) => projectDocumentsManagementDownstreamReadiness(projection)
  );
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

  return paginate(filteredDocuments, parsedQuery).map((document) =>
    projectDocumentsManagementDocumentExpiring(document, currentTime)
  );
}

export function listDocumentsManagementAlertReadyRecords(
  query: ListDocumentsManagementQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementAlertReadyProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery = listDocumentsManagementQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  return paginate(
    listDocumentsManagementRepositoryDocumentObligations(context)
      .filter((obligation) => obligation.status !== "satisfied")
      .filter((obligation) =>
        matchesDocumentsManagementObligationQuery(
          obligation,
          parsedQuery,
          searchTerm
        )
      ),
    parsedQuery
  ).map((obligation) => projectDocumentsManagementAlertReady(obligation));
}

export function listDocumentsManagementRetentionCandidates(
  query: ListDocumentsManagementRetentionCandidatesQuery = {},
  context?: DocumentsManagementPolicyContext
): readonly DocumentsManagementRetentionCandidateProjection[] {
  if (!canReadDocumentsManagement(context)) {
    return [];
  }

  const parsedQuery =
    listDocumentsManagementRetentionCandidatesQuerySchema.parse(query);
  const currentTime = new Date();
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const candidates = listDocumentsManagementRepositoryDocuments(context)
    .filter((document) => !document.deletedAt)
    .filter((document) =>
      parsedQuery.action
        ? document.retention.action === parsedQuery.action
        : true
    )
    .map((document) => {
      const anchorDate =
        document.archivedAt ??
        document.expiresAt ??
        document.uploadedAt ??
        document.createdAt;
      const days = document.retention.retentionPeriodDays ?? 0;
      const retentionDueAt = new Date(
        anchorDate.getTime() + days * 24 * 60 * 60 * 1000
      );

      return {
        document,
        retentionDueAt,
      };
    })
    .filter(
      (candidate) => candidate.retentionDueAt.getTime() <= currentTime.getTime()
    )
    .sort(
      (left, right) =>
        left.retentionDueAt.getTime() - right.retentionDueAt.getTime() ||
        left.document.title.localeCompare(right.document.title)
    );

  const startIndex = (page - 1) * pageSize;
  return candidates
    .slice(startIndex, startIndex + pageSize)
    .map((candidate) =>
      projectDocumentsManagementRetentionCandidate(
        candidate.document,
        candidate.retentionDueAt
      )
    );
}
