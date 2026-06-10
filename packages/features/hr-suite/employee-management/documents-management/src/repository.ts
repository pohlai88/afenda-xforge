import "server-only";

import { createRequire } from "node:module";

export type {
  DocumentsManagementDocumentObligationRepositoryEntry,
  DocumentsManagementDocumentRepositoryEntry,
  DocumentsManagementDocumentVersionRepositoryEntry,
  DocumentsManagementRepositoryEntry,
  DocumentsManagementRepositoryScope,
  DocumentsManagementRepositoryState,
} from "./repository.file.ts";

type DocumentsManagementRepositoryModule =
  typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadRepositoryModule = (): DocumentsManagementRepositoryModule =>
  nodeRequire("./repository.file.ts") as DocumentsManagementRepositoryModule;

export const appendDocumentsManagementRepositoryAuditEvent: DocumentsManagementRepositoryModule["appendDocumentsManagementRepositoryAuditEvents" extends never
  ? never
  : "appendDocumentsManagementRepositoryAuditEvent"] = (...args) =>
  loadRepositoryModule().appendDocumentsManagementRepositoryAuditEvent(...args);
export const createDocumentsManagementDocumentObligationId: DocumentsManagementRepositoryModule["createDocumentsManagementDocumentObligationId"] =
  (...args) =>
    loadRepositoryModule().createDocumentsManagementDocumentObligationId(
      ...args
    );
export const createDocumentsManagementRecordId: DocumentsManagementRepositoryModule["createDocumentsManagementRecordId"] =
  (...args) =>
    loadRepositoryModule().createDocumentsManagementRecordId(...args);
export const getDocumentsManagementRepositoryDocument: DocumentsManagementRepositoryModule["getDocumentsManagementRepositoryDocument"] =
  (...args) =>
    loadRepositoryModule().getDocumentsManagementRepositoryDocument(...args);
export const getDocumentsManagementRepositoryDocumentObligation: DocumentsManagementRepositoryModule["getDocumentsManagementRepositoryDocumentObligation"] =
  (...args) =>
    loadRepositoryModule().getDocumentsManagementRepositoryDocumentObligation(
      ...args
    );
export const getDocumentsManagementRepositoryDocumentVersion: DocumentsManagementRepositoryModule["getDocumentsManagementRepositoryDocumentVersion"] =
  (...args) =>
    loadRepositoryModule().getDocumentsManagementRepositoryDocumentVersion(
      ...args
    );
export const getDocumentsManagementRepositoryLatestDocumentVersion: DocumentsManagementRepositoryModule["getDocumentsManagementRepositoryLatestDocumentVersion"] =
  (...args) =>
    loadRepositoryModule().getDocumentsManagementRepositoryLatestDocumentVersion(
      ...args
    );
export const getDocumentsManagementRepositoryRecord: DocumentsManagementRepositoryModule["getDocumentsManagementRepositoryRecord"] =
  (...args) =>
    loadRepositoryModule().getDocumentsManagementRepositoryRecord(...args);
export const listDocumentsManagementRepositoryAuditEvents: DocumentsManagementRepositoryModule["listDocumentsManagementRepositoryAuditEvents"] =
  (...args) =>
    loadRepositoryModule().listDocumentsManagementRepositoryAuditEvents(
      ...args
    );
export const listDocumentsManagementRepositoryDocumentObligations: DocumentsManagementRepositoryModule["listDocumentsManagementRepositoryDocumentObligations"] =
  (...args) =>
    loadRepositoryModule().listDocumentsManagementRepositoryDocumentObligations(
      ...args
    );
export const listDocumentsManagementRepositoryDocuments: DocumentsManagementRepositoryModule["listDocumentsManagementRepositoryDocuments"] =
  (...args) =>
    loadRepositoryModule().listDocumentsManagementRepositoryDocuments(...args);
export const listDocumentsManagementRepositoryDocumentVersions: DocumentsManagementRepositoryModule["listDocumentsManagementRepositoryDocumentVersions"] =
  (...args) =>
    loadRepositoryModule().listDocumentsManagementRepositoryDocumentVersions(
      ...args
    );
export const listDocumentsManagementRepositoryRecords: DocumentsManagementRepositoryModule["listDocumentsManagementRepositoryRecords"] =
  (...args) =>
    loadRepositoryModule().listDocumentsManagementRepositoryRecords(...args);
export const loadDocumentsManagementRepository: DocumentsManagementRepositoryModule["loadDocumentsManagementRepository"] =
  (...args) =>
    loadRepositoryModule().loadDocumentsManagementRepository(...args);
export const mutateDocumentsManagementRepository: DocumentsManagementRepositoryModule["mutateDocumentsManagementRepository"] =
  (...args) =>
    loadRepositoryModule().mutateDocumentsManagementRepository(...args);
export const saveDocumentsManagementRepository: DocumentsManagementRepositoryModule["saveDocumentsManagementRepository"] =
  (...args) =>
    loadRepositoryModule().saveDocumentsManagementRepository(...args);
export const upsertDocumentsManagementRepositoryDocument: DocumentsManagementRepositoryModule["upsertDocumentsManagementRepositoryDocument"] =
  (...args) =>
    loadRepositoryModule().upsertDocumentsManagementRepositoryDocument(...args);
export const upsertDocumentsManagementRepositoryDocumentObligation: DocumentsManagementRepositoryModule["upsertDocumentsManagementRepositoryDocumentObligation"] =
  (...args) =>
    loadRepositoryModule().upsertDocumentsManagementRepositoryDocumentObligation(
      ...args
    );
export const upsertDocumentsManagementRepositoryDocumentVersion: DocumentsManagementRepositoryModule["upsertDocumentsManagementRepositoryDocumentVersion"] =
  (...args) =>
    loadRepositoryModule().upsertDocumentsManagementRepositoryDocumentVersion(
      ...args
    );
export const upsertDocumentsManagementRepositoryRecord: DocumentsManagementRepositoryModule["upsertDocumentsManagementRepositoryRecord"] =
  (...args) =>
    loadRepositoryModule().upsertDocumentsManagementRepositoryRecord(...args);
export {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "./repository.testing.ts";
