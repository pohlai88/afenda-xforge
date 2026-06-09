import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  getDocumentsManagementDocument,
  getDocumentsManagementDocumentLatestVersion,
  getDocumentsManagementDocumentVersion,
  listDocumentsManagementDocumentVersions,
  registerDocumentsManagementDocument,
  updateDocumentsManagementDocument,
} from "../src/server.ts";

let sandboxDirectory: string;

const registrationContext = {
  actorId: "actor-1",
  canRead: true,
  canViewSensitive: true,
  canWrite: true,
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "documents-versioning-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
});

afterEach(() => {
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("registering and replacing a document preserves version history", () => {
  const createdDocument = registerDocumentsManagementDocument(
    {
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-1",
      reference: {
        sourceDocumentId: "policy-1",
        sourceDocumentNumber: "POL-1",
        sourceNotes: "Initial source notes",
      },
      title: "Employee Handbook",
      visibility: "confidential",
    },
    registrationContext
  );

  const firstVersion = getDocumentsManagementDocumentVersion(
    createdDocument.currentVersionId ?? "",
    registrationContext
  );

  assert.equal(createdDocument.currentVersionNumber, 1);
  assert.equal(createdDocument.versionCount, 1);
  assert.equal(firstVersion?.versionNumber, 1);
  assert.equal(firstVersion?.state, "current");
  assert.equal(firstVersion?.isLatest, true);
  assert.equal(firstVersion?.sourceNotes, "Initial source notes");

  const updatedDocument = updateDocumentsManagementDocument(
    {
      id: createdDocument.id,
      reference: {
        sourceDocumentId: "policy-2",
        sourceDocumentNumber: "POL-2",
        sourceNotes: "Replacement source notes",
      },
      status: "verified",
      title: "Employee Handbook Updated",
      verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    registrationContext
  );

  const versionHistory = listDocumentsManagementDocumentVersions(
    { documentId: createdDocument.id },
    registrationContext
  );
  const latestVersion = getDocumentsManagementDocumentLatestVersion(
    createdDocument.id,
    registrationContext
  );
  const storedDocument = getDocumentsManagementDocument(createdDocument.id, {
    ...registrationContext,
    canViewSensitive: true,
  });

  assert.equal(updatedDocument.currentVersionNumber, 2);
  assert.equal(updatedDocument.versionCount, 2);
  assert.equal(versionHistory.length, 2);
  assert.equal(versionHistory[0]?.versionNumber, 1);
  assert.equal(versionHistory[0]?.state, "superseded");
  assert.equal(versionHistory[0]?.isLatest, false);
  assert.equal(versionHistory[0]?.replacedByVersionId, versionHistory[1]?.id);
  assert.equal(versionHistory[1]?.versionNumber, 2);
  assert.equal(versionHistory[1]?.state, "current");
  assert.equal(versionHistory[1]?.isLatest, true);
  assert.equal(versionHistory[1]?.previousVersionId, versionHistory[0]?.id);
  assert.equal(versionHistory[1]?.sourceNotes, "Replacement source notes");
  assert.equal(latestVersion?.id, versionHistory[1]?.id);
  assert.equal(storedDocument?.currentVersionId, versionHistory[1]?.id);
  assert.equal(storedDocument?.currentVersionNumber, 2);

  const redactedVersion = getDocumentsManagementDocumentVersion(
    versionHistory[1]?.id ?? "",
    {
      ...registrationContext,
      canViewSensitive: false,
    }
  );

  assert.equal(redactedVersion?.sourceNotes, null);
});
