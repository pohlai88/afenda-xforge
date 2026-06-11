import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createNoopAuditWriter } from "@repo/audit";
import {
  resetDocumentsManagementAuditWriterForTesting,
  setDocumentsManagementAuditWriterForTesting,
} from "../src/audit.ts";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../src/repository.testing.ts";
import {
  getDocumentsManagementDocument,
  listDocumentsManagementDocumentAuditTrail,
  registerDocumentsManagementDocument,
  updateDocumentsManagementDocument,
} from "../src/server.ts";

let sandboxDirectory: string;

const registrationContext = {
  actorId: "actor-1",
  canRead: true,
  canReadAudit: true,
  canViewSensitive: false,
  canWrite: true,
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "documents-registration-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
  setDocumentsManagementAuditWriterForTesting(createNoopAuditWriter());
});

afterEach(() => {
  resetDocumentsManagementAuditWriterForTesting();
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("registers document metadata and records an audit event", async () => {
  const createdDocument = await registerDocumentsManagementDocument(
    {
      description: "Employee policy acknowledgment",
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-1",
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      issuedAt: new Date("2026-06-01T00:00:00.000Z"),
      legalEntityCode: "LE-1",
      mandatory: true,
      reference: {
        sourceDocumentId: "policy-1",
        sourceDocumentNumber: "POL-1",
        sourceNotes: "Internal policy source note",
      },
      retention: {
        action: "archive",
        anonymizeBeforeDeletion: false,
        archiveAfterEmployeeSeparation: true,
        retentionPeriodDays: 365,
      },
      status: "pending_verification",
      title: "Employee Handbook",
      visibility: "confidential",
    },
    registrationContext
  );

  const auditEvents = listDocumentsManagementDocumentAuditTrail(
    { documentId: createdDocument.id },
    registrationContext
  );

  assert.equal(createdDocument.documentCategory, "policy");
  assert.equal(
    createdDocument.documentType,
    "employee_handbook_acknowledgment"
  );
  assert.equal(createdDocument.employeeId, "employee-1");
  assert.equal(createdDocument.reference.sourceNotes, null);
  assert.equal(auditEvents.length, 1);
  assert.equal(auditEvents[0]?.action, "register");
  assert.equal(auditEvents[0]?.employeeId, "employee-1");
  assert.equal(
    auditEvents[0]?.metadata.documentType,
    "employee_handbook_acknowledgment"
  );
});

test("updates document metadata and appends a second audit event", async () => {
  const createdDocument = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-1",
      reference: {
        sourceDocumentId: "passport-1",
        sourceDocumentNumber: "PP-1",
      },
      title: "Passport",
    },
    {
      ...registrationContext,
      canViewSensitive: true,
    }
  );

  const updatedDocument = await updateDocumentsManagementDocument(
    {
      id: createdDocument.id,
      rejectionReason: null,
      status: "verified",
      title: "Updated Passport",
      verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    {
      ...registrationContext,
      canViewSensitive: true,
    }
  );

  const storedDocument = getDocumentsManagementDocument(createdDocument.id, {
    ...registrationContext,
    canViewSensitive: true,
  });
  const auditEvents = listDocumentsManagementDocumentAuditTrail(
    { documentId: createdDocument.id },
    {
      ...registrationContext,
      canViewSensitive: true,
    }
  );

  assert.equal(updatedDocument.title, "Updated Passport");
  assert.equal(storedDocument?.status, "verified");
  assert.equal(storedDocument?.title, "Updated Passport");
  assert.equal(auditEvents.length, 2);
  assert.equal(auditEvents[1]?.action, "update");
  assert.ok(
    Array.isArray(auditEvents[1]?.metadata.changedFields) &&
      auditEvents[1]?.metadata.changedFields.includes("title")
  );
});
