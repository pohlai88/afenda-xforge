import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import {
  createDocumentsManagementRecord,
  updateDocumentsManagementRecord,
} from "../src/actions.ts";
import {
  getDocumentsManagementRecord,
  listDocumentsManagementRecords,
} from "../src/queries.ts";
import {
  getDocumentsManagementRepositoryPath,
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../src/repository.testing.ts";

let sandboxDirectory: string;
const defaultContext = {
  canRead: true,
  canViewSensitive: false,
  canWrite: true,
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "documents-management-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
});

afterEach(() => {
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("persists created records to disk", () => {
  const createdRecord = createDocumentsManagementRecord(
    {
      name: "  Employment Contract  ",
    },
    defaultContext
  );

  const repositoryPath = getDocumentsManagementRepositoryPath();
  const content = readFileSync(repositoryPath, "utf8");
  const parsed = JSON.parse(content) as {
    records: Array<{
      record: {
        id: string;
        name: string;
        status: string;
      };
    }>;
  };

  assert.equal(createdRecord.name, "Employment Contract");
  assert.equal(createdRecord.status, "draft");
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0]?.record.id, createdRecord.id);
  assert.equal(parsed.records[0]?.record.name, "Employment Contract");
});

test("scopes reads by tenant and company", () => {
  const scopedRecord = createDocumentsManagementRecord(
    { name: "Scoped record" },
    defaultContext
  );
  createDocumentsManagementRecord(
    { name: "Other record" },
    {
      ...defaultContext,
      companyId: "company-b",
      tenantId: "tenant-b",
    }
  );

  const scopedRecords = listDocumentsManagementRecords({}, defaultContext);

  assert.deepEqual(
    scopedRecords.map((record) => record.id),
    [scopedRecord.id]
  );
  assert.equal(
    getDocumentsManagementRecord(scopedRecord.id, {
      ...defaultContext,
    })?.id,
    scopedRecord.id
  );
  assert.equal(
    getDocumentsManagementRecord(scopedRecord.id, {
      ...defaultContext,
      companyId: "company-b",
      tenantId: "tenant-b",
    }),
    null
  );
});

test("updates persist and reset clears the repository", () => {
  const createdRecord = createDocumentsManagementRecord(
    {
      name: "Initial record",
    },
    defaultContext
  );

  const updatedRecord = updateDocumentsManagementRecord(
    {
      id: createdRecord.id,
      name: " Revised record ",
      status: "active",
    },
    defaultContext
  );

  assert.equal(updatedRecord.name, "Revised record");
  assert.equal(updatedRecord.status, "active");
  assert.equal(
    getDocumentsManagementRecord(createdRecord.id, defaultContext)?.status,
    "active"
  );

  resetDocumentsManagementRepositoryForTesting();

  assert.equal(listDocumentsManagementRecords({}, defaultContext).length, 0);
});
