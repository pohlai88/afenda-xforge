import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../src/repository.testing.ts";
import {
  resetDocumentsManagementAuditWriterForTesting,
  setDocumentsManagementAuditWriterForTesting,
} from "../src/audit.ts";
import {
  archiveDocumentsManagementDocument,
  expireDocumentsManagementDocument,
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  listDocumentsManagementDocumentAuditTrail,
  registerDocumentsManagementDocument,
  rejectDocumentsManagementDocument,
  updateDocumentsManagementDocumentRetention,
  verifyDocumentsManagementDocument,
} from "../src/server.ts";
import { createNoopAuditWriter } from "@repo/audit";

let sandboxDirectory: string;

const lifecycleContext = {
  actorId: "actor-2",
  canRead: true,
  canReadAudit: true,
  canViewSensitive: true,
  canWrite: true,
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "documents-lifecycle-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
  setDocumentsManagementAuditWriterForTesting(createNoopAuditWriter());
});

afterEach(() => {
  resetDocumentsManagementAuditWriterForTesting();
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("lifecycle transitions persist verification, expiry, archive, and retention state", async () => {
  const verifiedDocumentSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-1",
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      renewalDueAt: new Date("2026-11-01T00:00:00.000Z"),
      title: "Passport",
    },
    lifecycleContext
  );
  const verifiedDocument = await verifyDocumentsManagementDocument(
    {
      id: verifiedDocumentSeed.id,
      renewalDueAt: new Date("2026-12-01T00:00:00.000Z"),
      verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    lifecycleContext
  );
  const verifiedAuditTrail = listDocumentsManagementDocumentAuditTrail(
    { documentId: verifiedDocument.id },
    lifecycleContext
  );

  assert.equal(verifiedDocument.status, "verified");
  assert.equal(
    verifiedDocument.verifiedAt?.toISOString(),
    "2026-06-09T00:00:00.000Z"
  );
  assert.equal(
    verifiedDocument.renewalDueAt?.toISOString(),
    "2026-12-01T00:00:00.000Z"
  );
  assert.equal(
    getDocumentsManagementDocumentLatestVersion(
      verifiedDocument.id,
      lifecycleContext
    )?.versionNumber,
    2
  );
  assert.equal(verifiedAuditTrail[1]?.action, "verify");

  const rejectedDocumentSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-2",
      title: "Employee Handbook",
    },
    lifecycleContext
  );
  const rejectedDocument = await rejectDocumentsManagementDocument(
    {
      id: rejectedDocumentSeed.id,
      rejectionReason: "Missing signature",
      rejectedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    lifecycleContext
  );
  const rejectedAuditTrail = listDocumentsManagementDocumentAuditTrail(
    { documentId: rejectedDocument.id },
    lifecycleContext
  );

  assert.equal(rejectedDocument.status, "rejected");
  assert.equal(rejectedDocument.rejectionReason, "Missing signature");
  assert.equal(
    rejectedDocument.rejectedAt?.toISOString(),
    "2026-06-09T00:00:00.000Z"
  );
  assert.equal(rejectedAuditTrail[1]?.action, "reject");

  const expiredDocumentSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "qualification",
      documentType: "degree_certificate",
      employeeId: "employee-3",
      expiresAt: new Date("2026-05-01T00:00:00.000Z"),
      title: "Degree Certificate",
    },
    lifecycleContext
  );
  const expiredDocument = await expireDocumentsManagementDocument(
    {
      id: expiredDocumentSeed.id,
      renewalDueAt: new Date("2026-07-01T00:00:00.000Z"),
      expiredAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    lifecycleContext
  );
  const expiredAuditTrail = listDocumentsManagementDocumentAuditTrail(
    { documentId: expiredDocument.id },
    lifecycleContext
  );

  assert.equal(expiredDocument.status, "expired");
  assert.equal(
    expiredDocument.renewalDueAt?.toISOString(),
    "2026-07-01T00:00:00.000Z"
  );
  assert.equal(expiredAuditTrail[1]?.action, "expire");

  const archivedDocumentSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "employment",
      documentType: "employment_contract",
      employeeId: "employee-4",
      title: "Employment Contract",
    },
    lifecycleContext
  );
  const archivedDocument = await archiveDocumentsManagementDocument(
    {
      archivedAt: new Date("2026-06-09T00:00:00.000Z"),
      id: archivedDocumentSeed.id,
    },
    lifecycleContext
  );
  const archivedAuditTrail = listDocumentsManagementDocumentAuditTrail(
    { documentId: archivedDocument.id },
    lifecycleContext
  );

  assert.equal(archivedDocument.status, "archived");
  assert.equal(
    archivedDocument.archivedAt?.toISOString(),
    "2026-06-09T00:00:00.000Z"
  );
  assert.equal(archivedAuditTrail[1]?.action, "archive");

  const retentionDocumentSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "compliance",
      documentType: "regulatory_form",
      employeeId: "employee-5",
      retention: {
        action: "retain",
        anonymizeBeforeDeletion: false,
        archiveAfterEmployeeSeparation: false,
        retentionPeriodDays: 180,
      },
      title: "Regulatory Form",
    },
    lifecycleContext
  );
  const retentionDocument = await updateDocumentsManagementDocumentRetention(
    {
      id: retentionDocumentSeed.id,
      retention: {
        action: "archive",
        anonymizeBeforeDeletion: false,
        archiveAfterEmployeeSeparation: true,
        retentionPeriodDays: 365,
      },
    },
    lifecycleContext
  );
  const retentionAuditTrail = listDocumentsManagementDocumentAuditTrail(
    { documentId: retentionDocument.id },
    lifecycleContext
  );
  const storedRetentionDocument = getDocumentsManagementDocument(
    retentionDocument.id,
    lifecycleContext
  );

  assert.equal(retentionDocument.retention.action, "archive");
  assert.equal(storedRetentionDocument?.retention.retentionPeriodDays, 365);
  assert.equal(retentionAuditTrail[1]?.action, "update");
  assert.equal(retentionDocument.versionCount, 2);
});
