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
import {
  getHrEmployeeRecord,
  listHrEmployeeRecords,
} from "../src/hr.workforce.records.queries.ts";
import { loadHrRecordsOverviewSnapshot } from "../src/hr.workforce.records-overview.shared.ts";
import { listHrEmployeeAssignments } from "../src/queries/assignments.query.ts";
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
    `afenda-employee-records-temporal-${randomUUID()}.json`
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

test("closes prior assignment intervals and resolves current state by as-of", () => {
  const managerOne = createHrEmployeeRecordAction(
    {
      employeeNumber: "M300",
      legalName: "Manager One",
      currentDepartmentId: "dept-m1",
      currentPositionId: "pos-m1",
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  const managerTwo = createHrEmployeeRecordAction(
    {
      employeeNumber: "M301",
      legalName: "Manager Two",
      currentDepartmentId: "dept-m2",
      currentPositionId: "pos-m2",
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  const worker = createHrEmployeeRecordAction(
    {
      employeeNumber: "T300",
      legalName: "Temporal Worker",
      currentDepartmentId: "dept-a",
      currentPositionId: "pos-a",
      managerEmployeeId: requireTargetId(managerOne),
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(managerOne.ok, true);
  assert.equal(managerTwo.ok, true);
  assert.equal(worker.ok, true);

  const workerId = requireTargetId(worker);
  const repositoryState = loadHrEmployeeRecordsRepository();
  const workerRecord = repositoryState.records.find(
    (record) => record.id === workerId
  );

  assert.ok(workerRecord);
  const initialAssignment = workerRecord?.assignmentHistory.find(
    (entry) => entry.source === "create"
  );

  assert.ok(initialAssignment);
  const nextEffectiveFrom = new Date(
    (initialAssignment?.effectiveFrom.getTime() ?? 0) + 60 * 60 * 1000
  );

  const reassigned = recordHrEmployeeAssignmentAction(
    {
      employeeId: workerId,
      currentDepartmentId: "dept-b",
      currentPositionId: "pos-b",
      managerEmployeeId: requireTargetId(managerTwo),
      workLocationCode: "HQ-2",
      assignmentEffectiveFrom: nextEffectiveFrom,
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(reassigned.ok, true);

  const updatedState = loadHrEmployeeRecordsRepository();
  const updatedWorker = updatedState.records.find(
    (record) => record.id === workerId
  );

  assert.ok(updatedWorker);
  const closedAssignment = updatedWorker?.assignmentHistory.find(
    (entry) => entry.source === "create"
  );

  assert.equal(
    closedAssignment?.effectiveTo?.toISOString(),
    nextEffectiveFrom.toISOString()
  );

  const currentAssignments = listHrEmployeeAssignments(
    {
      current: true,
      managerEmployeeId: requireTargetId(managerTwo),
      asOf: new Date(nextEffectiveFrom.getTime() + 1000),
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(currentAssignments.totalCount, 1);
  assert.equal(currentAssignments.currentAssignment, undefined);
  assert.equal(
    currentAssignments.assignments.some((assignment) => assignment.isCurrent),
    true
  );

  const workerCurrentAsOf = listHrEmployeeAssignments(
    {
      employeeId: workerId,
      current: true,
      asOf: new Date(nextEffectiveFrom.getTime() - 1000),
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(workerCurrentAsOf.currentAssignment?.departmentId, "dept-a");
  assert.equal(workerCurrentAsOf.assignments[0]?.departmentId, "dept-a");

  const workerCurrentNow = listHrEmployeeAssignments(
    {
      employeeId: workerId,
      current: true,
      asOf: new Date(nextEffectiveFrom.getTime() + 1000),
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(workerCurrentNow.currentAssignment?.departmentId, "dept-b");
  assert.equal(workerCurrentNow.assignments[0]?.departmentId, "dept-b");

  const historicalMatches = listHrEmployeeAssignments(
    {
      managerEmployeeId: requireTargetId(managerOne),
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(historicalMatches.totalCount >= 1, true);

  const currentMismatch = listHrEmployeeAssignments(
    {
      current: true,
      managerEmployeeId: requireTargetId(managerOne),
      asOf: new Date(nextEffectiveFrom.getTime() + 1000),
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(currentMismatch.totalCount, 0);
});

test("validates manager references and derives incomplete coverage", () => {
  const manager = createHrEmployeeRecordAction(
    {
      employeeNumber: "M400",
      legalName: "Coverage Manager",
      currentDepartmentId: "dept-c",
      currentPositionId: "pos-c",
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(manager.ok, true);
  const managerId = requireTargetId(manager);

  const invalidManager = createHrEmployeeRecordAction(
    {
      employeeNumber: "T400",
      legalName: "Invalid Manager Worker",
      managerEmployeeId: "missing-manager",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(invalidManager.ok, false);
  assert.match(invalidManager.error, /same organization/i);

  const completeWorker = createHrEmployeeRecordAction(
    {
      employeeNumber: "T401",
      legalName: "Complete Worker",
      currentDepartmentId: "dept-d",
      currentPositionId: "pos-d",
      managerEmployeeId: managerId,
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(completeWorker.ok, true);

  const incompleteWorker = createHrEmployeeRecordAction(
    {
      employeeNumber: "T402",
      legalName: "Incomplete Worker",
      currentDepartmentId: "dept-e",
      currentPositionId: "pos-e",
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(incompleteWorker.ok, true);

  const overview = loadHrRecordsOverviewSnapshot("org-1");
  assert.equal(overview.incompleteCount >= 1, true);

  const incompleteRecords = listHrEmployeeRecords(
    {
      incompleteSearch: "managerEmployeeId",
    },
    {
      canRead: true,
      organizationId: "org-1",
    }
  );

  assert.equal(
    incompleteRecords.some((record) => record.employeeNumber === "T402"),
    true
  );

  const completeRecord = getHrEmployeeRecord(requireTargetId(completeWorker), {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(completeRecord);
});
