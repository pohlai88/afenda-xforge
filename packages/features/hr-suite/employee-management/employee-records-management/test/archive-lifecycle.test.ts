import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  archiveHrEmployeeRecordAction,
  createHrEmployeeRecordAction,
} from "../src/actions.server.ts";
import {
  getHrEmployeeRecord,
  listHrEmployeeRecords,
} from "../src/queries.server.ts";
import {
  loadHrEmployeeRecordsRepository,
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../src/repository.ts";

let repositoryPath = "";

const requireTargetId = (
  result: { ok: true; targetId?: string } | { ok: false; error: string }
): string => {
  if (!(result.ok && result.targetId)) {
    throw new Error("Expected mutation result to include targetId");
  }

  return result.targetId;
};

beforeEach(() => {
  repositoryPath = resolve(
    tmpdir(),
    `afenda-employee-records-archive-${randomUUID()}.json`
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

test("archives records with audit trail and keeps the archive idempotent", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "A100",
      legalName: "Archive Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const archived = archiveHrEmployeeRecordAction(
    {
      employeeId,
      reason: "Role eliminated",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(archived.ok, true);

  const detail = getHrEmployeeRecord(employeeId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(detail);
  assert.equal(detail?.employmentStatus, "archived");

  const repositoryState = loadHrEmployeeRecordsRepository();
  const archivedRecord = repositoryState.records.find(
    (record) => record.id === employeeId
  );

  assert.ok(archivedRecord);
  assert.equal(archivedRecord?.statusHistory.length, 2);
  assert.equal(archivedRecord?.auditTrail.length, 2);
  assert.equal(
    archivedRecord?.auditTrail[0]?.action,
    "hr.employees.employee.created"
  );
  assert.equal(
    archivedRecord?.auditTrail[1]?.action,
    "hr.employees.employee.archived"
  );
  assert.equal(archivedRecord?.auditTrail[1]?.reason, "Role eliminated");

  const repeatedArchive = archiveHrEmployeeRecordAction(
    {
      employeeId,
      reason: "Role eliminated",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(repeatedArchive.ok, true);

  const repeatedState = loadHrEmployeeRecordsRepository();
  const repeatedRecord = repeatedState.records.find(
    (record) => record.id === employeeId
  );

  assert.equal(repeatedRecord?.auditTrail.length, 2);
  assert.equal(repeatedRecord?.statusHistory.length, 2);

  const directoryRecords = listHrEmployeeRecords(
    {},
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(directoryRecords.length, 0);

  const separatedRecords = listHrEmployeeRecords(
    {
      separatedSearch: "Archive Worker",
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(separatedRecords.length, 1);
  assert.equal(separatedRecords[0]?.id, employeeId);
  assert.equal(separatedRecords[0]?.employmentStatus, "archived");
});

test("rejects archive without a reason and respects company scope", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "A101",
      legalName: "Scoped Archive Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const missingReason = archiveHrEmployeeRecordAction(
    {
      employeeId,
    } as never,
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(missingReason.ok, false);
  assert.match(missingReason.error, /reason/i);

  const crossScopeArchive = archiveHrEmployeeRecordAction(
    {
      employeeId,
      reason: "No longer needed",
    },
    {
      canWrite: true,
      organizationId: "org-2",
      userId: "hr-admin",
    }
  );

  assert.equal(crossScopeArchive.ok, false);
  assert.match(crossScopeArchive.error, /record not found/i);
});
