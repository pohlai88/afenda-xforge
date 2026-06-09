import assert from "node:assert/strict";
import { test } from "node:test";
import { createDocumentsManagementRecord } from "../src/actions.ts";
import {
  buildDocumentsManagementAuditMetadata,
  canReadDocumentsManagement,
  canViewDocumentsManagementSensitiveData,
  canWriteDocumentsManagement,
  normalizeDocumentsManagementActorId,
  redactDocumentsManagementDocument,
} from "../src/execution/index.ts";
import {
  getDocumentsManagementRecord,
  listDocumentsManagementRecords,
} from "../src/queries.ts";
import { documentsManagementDocumentSchema } from "../src/schema.ts";

test("policy helpers fail closed without explicit scope", () => {
  assert.equal(canReadDocumentsManagement({ canRead: true }), false);
  assert.equal(canWriteDocumentsManagement({ canWrite: true }), false);
  assert.equal(
    canViewDocumentsManagementSensitiveData({ canViewSensitive: true }),
    false
  );
});

test("actor normalization and audit metadata helpers are deterministic", () => {
  assert.equal(
    normalizeDocumentsManagementActorId({
      actorId: "  actor-1  ",
      tenantId: "tenant-a",
    }),
    "actor-1"
  );
  assert.equal(
    normalizeDocumentsManagementActorId({ tenantId: "tenant-a" }),
    "system"
  );
  assert.deepEqual(
    buildDocumentsManagementAuditMetadata({
      actorId: "actor-1",
      empty: null,
      omitted: undefined,
    }),
    {
      actorId: "actor-1",
      empty: null,
    }
  );
});

test("write operations reject missing tenant scope and redaction masks sensitive fields", () => {
  assert.deepEqual(listDocumentsManagementRecords(), []);
  assert.equal(getDocumentsManagementRecord("document-1"), null);
  assert.throws(
    () =>
      createDocumentsManagementRecord({ name: "Denied" }, { canWrite: true }),
    /Write access denied/
  );

  const document = documentsManagementDocumentSchema.parse({
    acknowledgment: {
      acknowledgedAt: new Date("2026-06-09T00:00:00.000Z"),
      acknowledgedBy: "employee-1",
      acknowledgmentMethod: "portal",
      documentId: "document-1",
      id: "ack-1",
      note: "Sensitive policy note",
      policyId: "policy-1",
      policyVersion: "v1",
    },
    archivedAt: null,
    companyId: "company-a",
    createdAt: new Date("2026-06-09T00:00:00.000Z"),
    currentVersionId: "version-1",
    currentVersionNumber: 1,
    description: "Employee copy",
    documentCategory: "policy",
    documentType: "employee_handbook_acknowledgment",
    employeeId: "employee-1",
    expiresAt: null,
    id: "document-1",
    issuedAt: null,
    legalEntityCode: null,
    mandatory: true,
    reference: {
      sourceDocumentId: "source-1",
      sourceDocumentNumber: "DOC-1",
      sourceNotes: "Internal notes",
    },
    rejectedAt: null,
    rejectionReason: "Sensitive rejection note",
    retention: {
      action: "archive",
      anonymizeBeforeDeletion: false,
      archiveAfterEmployeeSeparation: true,
      retentionPeriodDays: 365,
    },
    status: "verified",
    title: "Employee Handbook",
    updatedAt: new Date("2026-06-09T00:00:00.000Z"),
    versionCount: 1,
    visibility: "confidential",
    verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
  });

  const redactedDocument = redactDocumentsManagementDocument(document, false);

  assert.equal(redactedDocument.reference.sourceNotes, null);
  assert.equal(redactedDocument.rejectionReason, null);
  assert.equal(redactedDocument.acknowledgment?.note, null);
});
