import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  confirmLamLeaveDocumentUpload,
  createLamLeaveDocumentUploadSession,
} from "../src/actions/leave-documents.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  getLamLeaveDocumentById,
  listLamLeaveDocumentsRecords,
} from "../src/queries/leave-documents.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { lamLeaveDocumentSchema } from "../src/schema.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
  ],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-documents-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-008 createLamLeaveDocumentUploadSession registers pending document with storage key", async () => {
  const result = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
      referenceNumber: "MC-2026-001",
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected upload session to succeed");
  }

  assert.match(result.storageKey, /medical-cert\.pdf$/);

  const document = await getLamLeaveDocumentById(result.targetId, readContext);
  assert.ok(document);
  lamLeaveDocumentSchema.parse(document);
  assert.equal(document?.status, "pending_upload");
  assert.equal(document?.referenceNumber, "MC-2026-001");

  const state = await loadLamRepository(writeContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveDocumentReferenceCreated
  );
  assert.ok(audit);
  assert.equal(audit?.entityType, "leave_document");
});

test("HRM-LAM-008 confirmLamLeaveDocumentUpload marks document available", async () => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  const confirm = await confirmLamLeaveDocumentUpload(
    { companyId: "company-001", documentId: session.targetId },
    writeContext
  );
  assert.equal(confirm.ok, true);

  const document = await getLamLeaveDocumentById(session.targetId, readContext);
  assert.equal(document?.status, "available");
  assert.ok(document?.uploadedAt);

  const state = await loadLamRepository(writeContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveDocumentUploadConfirmed
  );
  assert.ok(audit);
});

test("confirmLamLeaveDocumentUpload rejects non-pending document", async () => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  await confirmLamLeaveDocumentUpload(
    { documentId: session.targetId },
    writeContext
  );

  const secondConfirm = await confirmLamLeaveDocumentUpload(
    { documentId: session.targetId },
    writeContext
  );
  assert.equal(secondConfirm.ok, false);
  if (secondConfirm.ok) {
    throw new Error("Expected second confirm to fail");
  }
  assert.match(secondConfirm.error, /cannot be confirmed/);
});

test("leave document queries fail closed without read access", async () => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  assert.equal(
    (await listLamLeaveDocumentsRecords({}, { companyId: "company-001" }))
      .length,
    0
  );
  assert.equal(
    await getLamLeaveDocumentById(session.targetId, {
      companyId: "company-001",
      canRead: false,
    }),
    null
  );
});

test("document mutations fail closed without write access", async () => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
    },
    { companyId: "company-001", canWrite: false }
  );
  assert.equal(session.ok, false);
});
