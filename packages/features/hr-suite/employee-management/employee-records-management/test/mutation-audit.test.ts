import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  archiveHrEmployeeRecordAction,
  createHrEmployeeRecordAction,
  recordHrEmployeeAssignmentAction,
  rehireHrEmployeeAction,
  updateHrEmployeeRecordAction,
} from "../src/actions.server.ts";
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
    `afenda-employee-records-mutation-audit-${randomUUID()}.json`
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

test("persists audit entries across the full record lifecycle", () => {
  const manager = createHrEmployeeRecordAction(
    {
      employeeNumber: "M500",
      legalName: "Lifecycle Manager",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(manager.ok, true);

  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "L100",
      legalName: "Lifecycle Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  let repositoryState = loadHrEmployeeRecordsRepository();
  let record = repositoryState.records.find((entry) => entry.id === employeeId);
  assert.ok(record);
  assert.equal(record?.auditTrail.length, 1);
  assert.equal(record?.auditTrail[0]?.action, "hr.employees.employee.created");

  const updated = updateHrEmployeeRecordAction(
    {
      employeeId,
      preferredName: "Lifecycle",
      reason: "Preferred name correction",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(updated.ok, true);

  repositoryState = loadHrEmployeeRecordsRepository();
  record = repositoryState.records.find((entry) => entry.id === employeeId);
  assert.ok(record);
  assert.equal(record?.auditTrail.length, 2);
  assert.equal(record?.auditTrail[1]?.action, "hr.employees.employee.updated");

  const assigned = recordHrEmployeeAssignmentAction(
    {
      employeeId,
      currentDepartmentId: "dept-1",
      managerEmployeeId: requireTargetId(manager),
      assignmentReason: "Org transfer",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(assigned.ok, true);

  repositoryState = loadHrEmployeeRecordsRepository();
  record = repositoryState.records.find((entry) => entry.id === employeeId);
  assert.ok(record);
  assert.equal(record?.auditTrail.length, 3);
  assert.equal(
    record?.auditTrail[2]?.action,
    "hr.employees.assignment.recorded"
  );

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

  repositoryState = loadHrEmployeeRecordsRepository();
  record = repositoryState.records.find((entry) => entry.id === employeeId);
  assert.ok(record);
  assert.equal(record?.employmentStatus, "archived");
  assert.equal(record?.auditTrail.length, 4);
  assert.equal(record?.auditTrail[3]?.action, "hr.employees.employee.archived");

  const rehired = rehireHrEmployeeAction(
    {
      priorEmployeeId: employeeId,
      employeeNumber: "L100",
      legalName: "Lifecycle Worker",
      reason: "Returned to work",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(rehired.ok, true);
  assert.equal(rehired.targetId, employeeId);

  repositoryState = loadHrEmployeeRecordsRepository();
  record = repositoryState.records.find((entry) => entry.id === employeeId);
  assert.ok(record);
  assert.equal(record?.employmentStatus, "active");
  assert.equal(record?.statusHistory.length, 3);
  assert.equal(record?.auditTrail.length, 5);
  assert.equal(record?.auditTrail[4]?.action, "hr.employees.employee.rehired");
});

test("rejects rehire for active records and cross-company scopes", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "L200",
      legalName: "Cross Scope Worker",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const rehireOnDraft = rehireHrEmployeeAction(
    {
      priorEmployeeId: employeeId,
      employeeNumber: "L200",
      legalName: "Cross Scope Worker",
      reason: "Unexpected return",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(rehireOnDraft.ok, false);
  assert.match(rehireOnDraft.error, /archived or separated/i);

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

  const rehired = rehireHrEmployeeAction(
    {
      priorEmployeeId: employeeId,
      employeeNumber: "L200",
      legalName: "Cross Scope Worker",
      reason: "Returned to work",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(rehired.ok, true);

  const activeRehire = rehireHrEmployeeAction(
    {
      priorEmployeeId: employeeId,
      employeeNumber: "L200",
      legalName: "Cross Scope Worker",
      reason: "Duplicate return",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(activeRehire.ok, false);
  assert.match(activeRehire.error, /archived or separated/i);

  const crossScopeRehire = rehireHrEmployeeAction(
    {
      priorEmployeeId: employeeId,
      employeeNumber: "L200",
      legalName: "Cross Scope Worker",
      reason: "Cross scope attempt",
    },
    {
      canWrite: true,
      organizationId: "org-2",
      userId: "hr-admin",
    }
  );

  assert.equal(crossScopeRehire.ok, false);
  assert.match(crossScopeRehire.error, /record not found/i);
});
