import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createHrEmployeeRecordAction,
  recordHrEmployeeAssignmentAction,
} from "../src/hr.workforce.records.actions.server.ts";
import { getHrEmployeeRecord } from "../src/hr.workforce.records.queries.ts";
import { listHrEmployeeAssignments } from "../src/queries/assignments.query.ts";
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
    `afenda-employee-records-assignments-${randomUUID()}.json`
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

test("appends assignment history and derives the current assignment from facts", () => {
  const managerOne = createHrEmployeeRecordAction(
    {
      employeeNumber: "M200",
      legalName: "Manager One",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );
  const managerTwo = createHrEmployeeRecordAction(
    {
      employeeNumber: "M201",
      legalName: "Manager Two",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(managerOne.ok, true);
  assert.equal(managerTwo.ok, true);

  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E200",
      legalName: "Taylor Worker",
      currentDepartmentId: "dept-1",
      currentPositionId: "pos-1",
      managerEmployeeId: requireTargetId(managerOne),
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  const employeeId = requireTargetId(created);

  const assigned = recordHrEmployeeAssignmentAction(
    {
      employeeId,
      currentDepartmentId: "dept-2",
      currentPositionId: "pos-2",
      managerEmployeeId: requireTargetId(managerTwo),
      workLocationCode: "HQ-2",
      assignmentReason: "Internal transfer",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(assigned.ok, true);

  const history = listHrEmployeeAssignments(
    {
      employeeId,
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(history.totalCount, 2);
  assert.equal(history.assignments.length, 2);
  assert.equal(history.currentAssignment?.departmentId, "dept-2");
  assert.equal(history.currentAssignment?.positionId, "pos-2");
  assert.equal(
    history.currentAssignment?.managerEmployeeId,
    requireTargetId(managerTwo)
  );
  assert.equal(history.assignments[0]?.departmentId, "dept-2");
  assert.equal(history.assignments[0]?.source, "assignment");
  assert.equal(history.assignments[1]?.departmentId, "dept-1");
  assert.equal(history.assignments[1]?.source, "create");

  const currentSnapshot = getHrEmployeeRecord(employeeId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(currentSnapshot);
  assert.equal(currentSnapshot?.currentDepartmentId, "dept-2");
  assert.equal(currentSnapshot?.currentPositionId, "pos-2");
  assert.equal(currentSnapshot?.managerEmployeeId, requireTargetId(managerTwo));

  const currentAssignments = listHrEmployeeAssignments(
    {
      managerEmployeeId: requireTargetId(managerTwo),
      current: true,
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(currentAssignments.assignments.length, 1);
  assert.equal(currentAssignments.assignments[0]?.employeeId, employeeId);
  assert.equal(currentAssignments.assignments[0]?.isCurrent, true);
});

test("rejects assignment changes for missing records and isolates companies", () => {
  const denied = recordHrEmployeeAssignmentAction(
    {
      employeeId: "missing-employee",
      currentDepartmentId: "dept-2",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(denied.ok, false);
  assert.match(denied.error, /record not found/i);

  const orgOneManager = createHrEmployeeRecordAction(
    {
      employeeNumber: "M202",
      legalName: "Org One Manager",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  const orgTwoManager = createHrEmployeeRecordAction(
    {
      employeeNumber: "M203",
      legalName: "Org Two Manager",
    },
    {
      canWrite: true,
      organizationId: "org-2",
      userId: "hr-admin",
    }
  );

  assert.equal(orgOneManager.ok, true);
  assert.equal(orgTwoManager.ok, true);

  const orgOne = createHrEmployeeRecordAction(
    {
      employeeNumber: "E201",
      legalName: "Jordan Worker",
      currentDepartmentId: "dept-a",
      managerEmployeeId: requireTargetId(orgOneManager),
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  const orgTwo = createHrEmployeeRecordAction(
    {
      employeeNumber: "E202",
      legalName: "Morgan Worker",
      currentDepartmentId: "dept-b",
      managerEmployeeId: requireTargetId(orgTwoManager),
    },
    {
      canWrite: true,
      organizationId: "org-2",
      userId: "hr-admin",
    }
  );

  assert.equal(orgOne.ok, true);
  assert.equal(orgTwo.ok, true);
  const orgOneEmployeeId = requireTargetId(orgOne);
  const orgTwoEmployeeId = requireTargetId(orgTwo);

  const orgOneAssignment = recordHrEmployeeAssignmentAction(
    {
      employeeId: orgOneEmployeeId,
      currentDepartmentId: "dept-a2",
      managerEmployeeId: requireTargetId(orgOneManager),
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(orgOneAssignment.ok, true);

  const scopedToOrgTwo = listHrEmployeeAssignments(
    {
      employeeId: orgOneEmployeeId,
    },
    {
      canRead: true,
      organizationId: "org-2",
    }
  );

  assert.equal(scopedToOrgTwo.assignments.length, 0);
  assert.equal(scopedToOrgTwo.currentAssignment, null);
  assert.notEqual(orgOneEmployeeId, orgTwoEmployeeId);
});
