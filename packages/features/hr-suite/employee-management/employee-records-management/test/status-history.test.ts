import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createHrEmployeeRecordAction,
  updateHrEmployeeRecordAction,
} from "../src/hr.workforce.records.actions.server.ts";
import { getHrEmployeeRecord } from "../src/hr.workforce.records.queries.ts";
import { listHrEmployeeStatusHistory } from "../src/queries/status-history.query.ts";
import {
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
    `afenda-employee-records-status-history-${randomUUID()}.json`
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

test("seeds initial status history and appends ordered transitions", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "S100",
      legalName: "Status Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const initialHistory = listHrEmployeeStatusHistory(
    { employeeId },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(initialHistory.totalCount, 1);
  assert.equal(initialHistory.statusHistory[0]?.status, "draft");
  assert.equal(initialHistory.currentStatusHistory?.status, "draft");

  const updated = updateHrEmployeeRecordAction(
    {
      employeeId,
      employmentStatus: "active",
      reason: "Onboarding complete",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(updated.ok, true);

  const currentRecord = getHrEmployeeRecord(employeeId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(currentRecord);
  assert.equal(currentRecord?.employmentStatus, "active");

  const history = listHrEmployeeStatusHistory(
    { employeeId },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(history.totalCount, 2);
  assert.equal(history.statusHistory[0]?.status, "active");
  assert.equal(history.statusHistory[0]?.previousStatus, "draft");
  assert.equal(history.statusHistory[0]?.reason, "Onboarding complete");
  assert.equal(history.statusHistory[1]?.status, "draft");
  assert.equal(history.currentStatusHistory?.status, "active");

  const currentOnly = listHrEmployeeStatusHistory(
    { employeeId, current: true },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(currentOnly.statusHistory.length, 1);
  assert.equal(currentOnly.statusHistory[0]?.isCurrent, true);
});

test("rejects invalid transitions and enforces company scope", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "S200",
      legalName: "Scoped Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const activated = updateHrEmployeeRecordAction(
    {
      employeeId,
      employmentStatus: "active",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(activated.ok, true);

  const invalid = updateHrEmployeeRecordAction(
    {
      employeeId,
      employmentStatus: "draft",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /invalid employment status transition/i);

  const otherCompany = createHrEmployeeRecordAction(
    {
      employeeNumber: "S201",
      legalName: "Other Worker",
    },
    {
      canWrite: true,
      organizationId: "org-2",
      userId: "hr-admin",
    }
  );

  assert.equal(otherCompany.ok, true);

  const scopedOut = listHrEmployeeStatusHistory(
    { employeeId },
    {
      canRead: true,
      organizationId: "org-2",
    }
  );

  assert.equal(scopedOut.totalCount, 0);
  assert.equal(scopedOut.statusHistory.length, 0);
  assert.equal(scopedOut.currentStatusHistory, null);

  const denied = listHrEmployeeStatusHistory(
    { employeeId },
    {
      canRead: false,
      organizationId: "org-1",
    }
  );

  assert.equal(denied.totalCount, 0);
  assert.equal(denied.statusHistory.length, 0);
});
