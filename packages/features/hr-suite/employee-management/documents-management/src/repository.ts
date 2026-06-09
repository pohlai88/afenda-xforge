import "server-only";

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";

import type { DocumentsManagementRecord } from "./contract.ts";
import { documentsManagementRecordProjectionSchema } from "./contracts/projection.contract.ts";
import type {
  DocumentsManagementAuditEvent,
  DocumentsManagementDocument,
  DocumentsManagementDocumentVersion,
} from "./schema.ts";
import {
  documentsManagementAuditEventSchema,
  documentsManagementDocumentSchema,
  documentsManagementDocumentVersionSchema,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export type DocumentsManagementRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type DocumentsManagementRepositoryEntry = {
  companyId: string | null;
  record: DocumentsManagementRecord;
  tenantId: string | null;
};

export type DocumentsManagementDocumentRepositoryEntry = {
  companyId: string | null;
  document: DocumentsManagementDocument;
  tenantId: string | null;
};

export type DocumentsManagementDocumentVersionRepositoryEntry = {
  companyId: string | null;
  tenantId: string | null;
  version: DocumentsManagementDocumentVersion;
};

export type DocumentsManagementRepositoryState = {
  auditEvents: DocumentsManagementAuditEvent[];
  documents: DocumentsManagementDocumentRepositoryEntry[];
  versions: DocumentsManagementDocumentVersionRepositoryEntry[];
  records: DocumentsManagementRepositoryEntry[];
};

const documentsManagementDocumentRepositoryEntrySchema = z.object({
  companyId: z.string().trim().min(1).nullable(),
  document: documentsManagementDocumentSchema,
  tenantId: z.string().trim().min(1).nullable(),
});

const documentsManagementDocumentVersionRepositoryEntrySchema = z.object({
  companyId: z.string().trim().min(1).nullable(),
  tenantId: z.string().trim().min(1).nullable(),
  version: documentsManagementDocumentVersionSchema,
});

const documentsManagementRepositoryEntrySchema = z.object({
  companyId: z.string().trim().min(1).nullable(),
  record: documentsManagementRecordProjectionSchema,
  tenantId: z.string().trim().min(1).nullable(),
});

const documentsManagementRepositoryStateSchema = z.object({
  auditEvents: documentsManagementAuditEventSchema.array().default([]),
  documents: documentsManagementDocumentRepositoryEntrySchema
    .array()
    .default([]),
  versions: documentsManagementDocumentVersionRepositoryEntrySchema
    .array()
    .default([]),
  records: documentsManagementRepositoryEntrySchema.array().default([]),
});

const defaultRepositoryPath = resolve(
  process.cwd(),
  ".cache",
  "hr-suite",
  "documents-management.repository.json"
);

let repositoryFilePath: string =
  process.env.AFENDA_DOCUMENTS_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_DOCUMENTS_MANAGEMENT_STORE_PATH ??
  defaultRepositoryPath;

let cache: DocumentsManagementRepositoryState | null = null;

const emptyState = (): DocumentsManagementRepositoryState => ({
  auditEvents: [],
  documents: [],
  versions: [],
  records: [],
});

const cloneState = (
  state: DocumentsManagementRepositoryState
): DocumentsManagementRepositoryState => structuredClone(state);

const serializeRepositoryState = (
  state: DocumentsManagementRepositoryState
): string => JSON.stringify(state);

const normalizeScopeValue = (
  value: string | null | undefined
): string | null => (value?.trim() ? value.trim() : null);

const normalizeScope = (
  context?: HrSuiteFeatureContext
): DocumentsManagementRepositoryScope => {
  const scope: DocumentsManagementRepositoryScope = {};

  if (context?.companyId !== undefined) {
    scope.companyId = normalizeScopeValue(context.companyId);
  }

  if (context?.tenantId !== undefined) {
    scope.tenantId = normalizeScopeValue(context.tenantId);
  }

  return scope;
};

const matchesScope = (
  entry: { companyId: string | null; tenantId: string | null },
  scope?: DocumentsManagementRepositoryScope
): boolean => matchesScopeFields(entry.companyId, entry.tenantId, scope);

const matchesScopeFields = (
  companyId: string | null,
  tenantId: string | null,
  scope?: DocumentsManagementRepositoryScope
): boolean => {
  if (!scope) {
    return true;
  }

  if (scope.companyId !== undefined && companyId !== scope.companyId) {
    return false;
  }

  if (scope.tenantId !== undefined && tenantId !== scope.tenantId) {
    return false;
  }

  return true;
};

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): DocumentsManagementRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  return documentsManagementRepositoryStateSchema.parse(parsed);
};

const persistRepositoryState = (
  state: DocumentsManagementRepositoryState
): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeRepositoryState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const loadRepositoryState = (): DocumentsManagementRepositoryState => {
  if (cache === null) {
    cache = readRepositoryStateFromDisk();
  }

  return cloneState(cache);
};

const saveRepositoryState = (
  state: DocumentsManagementRepositoryState
): void => {
  cache = cloneState(state);
  persistRepositoryState(cache);
};

const mutateRepositoryState = (
  updater: (draft: DocumentsManagementRepositoryState) => void
): DocumentsManagementRepositoryState => {
  const nextState = loadRepositoryState();
  updater(nextState);
  saveRepositoryState(nextState);
  return loadRepositoryState();
};

const toRepositoryEntry = (
  record: DocumentsManagementRecord,
  context?: HrSuiteFeatureContext
): DocumentsManagementRepositoryEntry => {
  const companyId =
    context?.companyId === undefined
      ? null
      : normalizeScopeValue(context.companyId);
  const tenantId =
    context?.tenantId === undefined
      ? null
      : normalizeScopeValue(context.tenantId);

  return {
    companyId,
    record,
    tenantId,
  };
};

const updateRepositoryEntry = (
  entry: DocumentsManagementRepositoryEntry,
  record: DocumentsManagementRecord
): DocumentsManagementRepositoryEntry => ({
  ...entry,
  record,
});

const toVersionRepositoryEntry = (
  version: DocumentsManagementDocumentVersion,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocumentVersionRepositoryEntry => {
  const companyId =
    context?.companyId === undefined
      ? null
      : normalizeScopeValue(context.companyId);
  const tenantId =
    context?.tenantId === undefined
      ? null
      : normalizeScopeValue(context.tenantId);

  return {
    companyId,
    tenantId,
    version,
  };
};

const updateVersionRepositoryEntry = (
  entry: DocumentsManagementDocumentVersionRepositoryEntry,
  version: DocumentsManagementDocumentVersion
): DocumentsManagementDocumentVersionRepositoryEntry => ({
  ...entry,
  version,
});

export const getDocumentsManagementRepositoryPath = (): string =>
  repositoryFilePath;

export const setDocumentsManagementRepositoryPathForTesting = (
  nextPath: string
): void => {
  process.env.AFENDA_DOCUMENTS_MANAGEMENT_REPOSITORY_MODE = "file";
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const resetDocumentsManagementRepositoryForTesting = (): void => {
  cache = emptyState();
  persistRepositoryState(cache);
};

export const createDocumentsManagementRecordId = (): string => randomUUID();

export const loadDocumentsManagementRepository =
  (): DocumentsManagementRepositoryState => loadRepositoryState();

export const saveDocumentsManagementRepository = (
  state: DocumentsManagementRepositoryState
): void => {
  saveRepositoryState(state);
};

export const mutateDocumentsManagementRepository = (
  updater: (draft: DocumentsManagementRepositoryState) => void
): DocumentsManagementRepositoryState => mutateRepositoryState(updater);

export function listDocumentsManagementRepositoryDocuments(
  context?: HrSuiteFeatureContext
): readonly DocumentsManagementDocument[] {
  const scope = context ? normalizeScope(context) : undefined;

  return loadRepositoryState()
    .documents.filter((entry) => matchesScope(entry, scope))
    .map((entry) => entry.document);
}

export function getDocumentsManagementRepositoryDocument(
  id: string,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocument | null {
  const scope = context ? normalizeScope(context) : undefined;
  const entry = loadRepositoryState().documents.find(
    (candidate) =>
      candidate.document.id === id && matchesScope(candidate, scope)
  );

  return entry ? entry.document : null;
}

export function upsertDocumentsManagementRepositoryDocument(
  document: DocumentsManagementDocument,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocument {
  const scope = context ? normalizeScope(context) : undefined;

  mutateRepositoryState((draft) => {
    const entryIndex = draft.documents.findIndex(
      (candidate) =>
        candidate.document.id === document.id && matchesScope(candidate, scope)
    );

    if (entryIndex >= 0) {
      draft.documents = draft.documents.map((entry, index) =>
        index === entryIndex
          ? {
              ...entry,
              document,
            }
          : entry
      );
      return;
    }

    const conflictingEntry = draft.documents.find(
      (candidate) => candidate.document.id === document.id
    );
    if (conflictingEntry) {
      throw new Error(
        "documents-management document scope mismatch while persisting"
      );
    }

    draft.documents = [
      ...draft.documents,
      {
        companyId:
          scope?.companyId === undefined ? null : (scope.companyId ?? null),
        document,
        tenantId:
          scope?.tenantId === undefined ? null : (scope.tenantId ?? null),
      },
    ];
  });

  return document;
}

export function listDocumentsManagementRepositoryAuditEvents(
  documentId?: string,
  context?: HrSuiteFeatureContext
): readonly DocumentsManagementAuditEvent[] {
  const scope = context ? normalizeScope(context) : undefined;

  return loadRepositoryState()
    .auditEvents.filter((event) => {
      if (documentId && event.documentId !== documentId) {
        return false;
      }

      return matchesScopeFields(
        event.companyId ?? null,
        event.tenantId ?? null,
        scope
      );
    })
    .sort(
      (leftEvent, rightEvent) =>
        leftEvent.createdAt.getTime() - rightEvent.createdAt.getTime() ||
        leftEvent.id.localeCompare(rightEvent.id)
    );
}

export function appendDocumentsManagementRepositoryAuditEvent(
  auditEvent: DocumentsManagementAuditEvent
): DocumentsManagementAuditEvent {
  mutateRepositoryState((draft) => {
    draft.auditEvents = [...draft.auditEvents, auditEvent];
  });

  return auditEvent;
}

export function listDocumentsManagementRepositoryDocumentVersions(
  documentId?: string,
  context?: HrSuiteFeatureContext
): readonly DocumentsManagementDocumentVersion[] {
  const scope = context ? normalizeScope(context) : undefined;

  return loadRepositoryState()
    .versions.filter((entry) => {
      if (documentId && entry.version.documentId !== documentId) {
        return false;
      }

      return matchesScope(entry, scope);
    })
    .map((entry) => entry.version)
    .sort(
      (leftVersion, rightVersion) =>
        leftVersion.versionNumber - rightVersion.versionNumber ||
        leftVersion.createdAt.getTime() - rightVersion.createdAt.getTime() ||
        leftVersion.id.localeCompare(rightVersion.id)
    );
}

export function getDocumentsManagementRepositoryDocumentVersion(
  id: string,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocumentVersion | null {
  const scope = context ? normalizeScope(context) : undefined;
  const entry = loadRepositoryState().versions.find(
    (candidate) => candidate.version.id === id && matchesScope(candidate, scope)
  );

  return entry ? entry.version : null;
}

export function getDocumentsManagementRepositoryLatestDocumentVersion(
  documentId: string,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocumentVersion | null {
  const versions = listDocumentsManagementRepositoryDocumentVersions(
    documentId,
    context
  );

  if (versions.length === 0) {
    return null;
  }

  const latestVersions = versions.filter((version) => version.isLatest);
  if (latestVersions.length > 1) {
    throw new Error(
      "documents-management version state conflict while resolving latest version"
    );
  }

  if (latestVersions.length === 1) {
    return latestVersions[0] ?? null;
  }

  return versions.at(-1) ?? null;
}

export function upsertDocumentsManagementRepositoryDocumentVersion(
  version: DocumentsManagementDocumentVersion,
  context?: HrSuiteFeatureContext
): DocumentsManagementDocumentVersion {
  const scope = context ? normalizeScope(context) : undefined;

  mutateRepositoryState((draft) => {
    const entryIndex = draft.versions.findIndex(
      (candidate) =>
        candidate.version.id === version.id && matchesScope(candidate, scope)
    );

    if (entryIndex >= 0) {
      draft.versions = draft.versions.map((entry, index) =>
        index === entryIndex
          ? updateVersionRepositoryEntry(entry, version)
          : entry
      );
      return;
    }

    const conflictingEntry = draft.versions.find(
      (candidate) => candidate.version.id === version.id
    );
    if (conflictingEntry) {
      throw new Error(
        "documents-management version scope mismatch while persisting"
      );
    }

    draft.versions = [
      ...draft.versions,
      toVersionRepositoryEntry(version, context),
    ];
  });

  return version;
}

export function listDocumentsManagementRepositoryRecords(
  context?: HrSuiteFeatureContext
): readonly DocumentsManagementRecord[] {
  const scope = context ? normalizeScope(context) : undefined;

  return loadRepositoryState()
    .records.filter((entry) => matchesScope(entry, scope))
    .map((entry) => entry.record);
}

export function getDocumentsManagementRepositoryRecord(
  id: string,
  context?: HrSuiteFeatureContext
): DocumentsManagementRecord | null {
  const scope = context ? normalizeScope(context) : undefined;
  const entry = loadRepositoryState().records.find(
    (candidate) => candidate.record.id === id && matchesScope(candidate, scope)
  );

  return entry ? entry.record : null;
}

export function upsertDocumentsManagementRepositoryRecord(
  record: DocumentsManagementRecord,
  context?: HrSuiteFeatureContext
): DocumentsManagementRecord {
  const scope = context ? normalizeScope(context) : undefined;

  mutateRepositoryState((draft) => {
    const entryIndex = draft.records.findIndex(
      (candidate) =>
        candidate.record.id === record.id && matchesScope(candidate, scope)
    );

    if (entryIndex >= 0) {
      draft.records = draft.records.map((entry, index) =>
        index === entryIndex ? updateRepositoryEntry(entry, record) : entry
      );
      return;
    }

    const conflictingEntry = draft.records.find(
      (candidate) => candidate.record.id === record.id
    );
    if (conflictingEntry) {
      throw new Error(
        "documents-management record scope mismatch while persisting"
      );
    }

    draft.records = [...draft.records, toRepositoryEntry(record, context)];
  });

  return record;
}
