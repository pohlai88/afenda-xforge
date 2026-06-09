import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createHrEmployeeRecordAction } from "../src/actions.server.ts";
import {
  getHrEmployeeRecord,
  listHrEmployeeRecords,
} from "../src/queries.server.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../src/repository.ts";

let repositoryPath = "";

beforeEach(() => {
  repositoryPath = resolve(
    tmpdir(),
    `afenda-employee-records-${randomUUID()}.json`
  );
  setHrEmployeeRecordsRepositoryPathForTesting(repositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(repositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository test artifacts.
  }
});

test("persists employee records and respects organization scope", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E001",
      legalName: "Alex Worker",
      preferredName: "Alex",
      email: "alex@example.com",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  const record = getHrEmployeeRecord(created.targetId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(record);
  assert.equal(record.employeeNumber, "E001");
  assert.equal(record.displayName, "Alex");

  setHrEmployeeRecordsRepositoryPathForTesting(repositoryPath);

  const scopedRecords = listHrEmployeeRecords(
    {},
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(scopedRecords.length, 1);
  assert.equal(scopedRecords[0]?.id, created.targetId);

  const otherScopeRecords = listHrEmployeeRecords(
    {},
    {
      canRead: true,
      organizationId: "org-2",
    }
  );

  assert.equal(otherScopeRecords.length, 0);

  const deniedRead = listHrEmployeeRecords(
    {},
    {
      canRead: false,
      organizationId: "org-1",
    }
  );

  assert.equal(deniedRead.length, 0);
});

test("denies writes when write access is missing", () => {
  const denied = createHrEmployeeRecordAction(
    {
      employeeNumber: "E002",
      legalName: "Denied Worker",
    },
    {
      canWrite: false,
      organizationId: "org-1",
      userId: "viewer",
    }
  );

  assert.equal(denied.ok, false);
  assert.match(denied.error, /write access denied/i);
});
