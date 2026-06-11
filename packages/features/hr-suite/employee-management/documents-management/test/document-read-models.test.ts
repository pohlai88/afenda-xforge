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
  archiveDocumentsManagementDocument,
  getDocumentsManagementDocumentSummary,
  listDocumentsManagementDocumentReadinessSummaries,
  listDocumentsManagementDocumentSummaries,
  listDocumentsManagementExpiringDocuments,
  registerDocumentsManagementDocument,
  verifyDocumentsManagementDocument,
} from "../src/server.ts";

let sandboxDirectory: string;

const readContext = {
  canRead: true,
  canViewSensitive: false,
  canWrite: true,
  companyId: "company-a",
  tenantId: "tenant-a",
};

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "documents-read-models-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
  setDocumentsManagementAuditWriterForTesting(createNoopAuditWriter());
});

afterEach(() => {
  resetDocumentsManagementAuditWriterForTesting();
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("lists document summaries with search and paging", async () => {
  const alphaDocument = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-1",
      title: "Alpha Passport",
    },
    readContext
  );
  await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "nric",
      employeeId: "employee-1",
      title: "Beta Identity",
    },
    readContext
  );
  await registerDocumentsManagementDocument(
    {
      documentCategory: "qualification",
      documentType: "degree_certificate",
      employeeId: "employee-1",
      title: "Gamma Certificate",
    },
    readContext
  );

  const pageOneSummaries = listDocumentsManagementDocumentSummaries(
    { employeeId: "employee-1", page: 1, pageSize: 2 },
    readContext
  );
  const pageTwoSummaries = listDocumentsManagementDocumentSummaries(
    { employeeId: "employee-1", page: 2, pageSize: 2 },
    readContext
  );
  const searchedSummaries = listDocumentsManagementDocumentSummaries(
    { search: "passport" },
    readContext
  );
  const summary = getDocumentsManagementDocumentSummary(
    alphaDocument.id,
    readContext
  );

  assert.equal(pageOneSummaries.length, 2);
  assert.equal(pageOneSummaries[0]?.title, "Alpha Passport");
  assert.equal(pageOneSummaries[1]?.title, "Beta Identity");
  assert.equal(pageTwoSummaries.length, 1);
  assert.equal(pageTwoSummaries[0]?.title, "Gamma Certificate");
  assert.equal(searchedSummaries.length, 1);
  assert.equal(searchedSummaries[0]?.id, alphaDocument.id);
  assert.equal(summary?.id, alphaDocument.id);
  assert.equal(summary?.currentVersionNumber, 1);
});

test("projects readiness and expiring document views", async () => {
  const verifiedSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-2",
      mandatory: true,
      title: "Verified Passport",
    },
    readContext
  );
  await verifyDocumentsManagementDocument(
    {
      id: verifiedSeed.id,
      verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    readContext
  );

  await registerDocumentsManagementDocument(
    {
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-2",
      mandatory: true,
      status: "pending_verification",
      title: "Pending Handbook",
    },
    readContext
  );

  const archivedSeed = await registerDocumentsManagementDocument(
    {
      documentCategory: "qualification",
      documentType: "degree_certificate",
      employeeId: "employee-2",
      title: "Archived Certificate",
    },
    readContext
  );
  await archiveDocumentsManagementDocument(
    {
      archivedAt: new Date("2026-06-09T00:00:00.000Z"),
      id: archivedSeed.id,
    },
    readContext
  );

  await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(10),
      title: "Expiring Soon",
    },
    readContext
  );
  await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(40),
      title: "Not Yet Expiring",
    },
    readContext
  );
  await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(-2),
      title: "Already Expired",
    },
    readContext
  );

  const readinessSummaries = listDocumentsManagementDocumentReadinessSummaries(
    { employeeId: "employee-2" },
    readContext
  );
  const expiringDocuments = listDocumentsManagementExpiringDocuments(
    { employeeId: "employee-3" },
    readContext
  );

  assert.equal(readinessSummaries.length, 1);
  assert.equal(readinessSummaries[0]?.employeeId, "employee-2");
  assert.equal(readinessSummaries[0]?.documentCount, 3);
  assert.equal(readinessSummaries[0]?.mandatoryDocumentCount, 2);
  assert.equal(readinessSummaries[0]?.verifiedDocumentCount, 1);
  assert.equal(readinessSummaries[0]?.pendingVerificationDocumentCount, 1);
  assert.equal(readinessSummaries[0]?.archivedDocumentCount, 1);
  assert.equal(readinessSummaries[0]?.missingMandatoryDocumentCount, 1);
  assert.equal(readinessSummaries[0]?.ready, false);

  assert.equal(expiringDocuments.length, 2);
  assert.equal(expiringDocuments[0]?.title, "Already Expired");
  assert.equal(expiringDocuments[0]?.isExpired, true);
  assert.equal(expiringDocuments[1]?.title, "Expiring Soon");
  assert.equal(expiringDocuments[1]?.isExpiringSoon, true);
});
