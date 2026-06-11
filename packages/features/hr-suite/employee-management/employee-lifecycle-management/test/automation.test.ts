import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  listOffboardingCaseRecords,
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../../offboarding-exit-management/src/index.ts";
import {
  createEmployeeLifecycleState,
  evaluateEmployeeLifecycleAutomation,
  getEmployeeLifecycleOnboardingStatus,
  listEmployeeLifecycleOffboardingHandoffs,
  listEnqueuedEmployeeLifecycleNotificationIntents,
  recordEmployeeLifecycleGradeChange,
  resetEmployeeLifecycleRepositoryForTesting,
  runEmployeeLifecycleAutomation,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleContract,
  startEmployeeLifecycleProbation,
  startEmployeeLifecycleResignation,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

let lifecycleRepositoryPath = "";
let offboardingRepositoryPath = "";

beforeEach(async () => {
  lifecycleRepositoryPath = join(
    tmpdir(),
    `employee-lifecycle-automation-${randomUUID()}.json`
  );
  offboardingRepositoryPath = resolve(
    tmpdir(),
    `employee-offboarding-automation-${randomUUID()}.json`
  );
  setEmployeeLifecycleRepositoryPathForTesting(lifecycleRepositoryPath);
  resetEmployeeLifecycleRepositoryForTesting();
  setOffboardingRepositoryPathForTesting(offboardingRepositoryPath);
  await resetOffboardingRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(lifecycleRepositoryPath, { force: true });
  } catch {
    /* noop */
  }

  try {
    rmSync(offboardingRepositoryPath, { force: true });
  } catch {
    /* noop */
  }
});

test("auto-starts onboarding once for a bootstrap employee profile", async () => {
  const result = await runEmployeeLifecycleAutomation({
    source: "employee-records-test",
    employeeProfile: {
      employeeId: "emp-bootstrap",
      companyId: "co-bootstrap",
      tenantId: "tenant-bootstrap",
      employmentType: "full-time",
      legalEntityCode: "LE-BOOT",
      departmentId: "ENG",
      workLocationCode: "BKK",
      roleTitle: "Engineer",
    },
  });

  assert.equal(
    result.actions.some((action) => action.kind === "onboarding_auto_start"),
    true
  );
  assert.equal(
    getEmployeeLifecycleOnboardingStatus("emp-bootstrap", {
      companyId: "co-bootstrap",
      tenantId: "tenant-bootstrap",
    })?.workflowStatus,
    "in_progress"
  );

  const secondPass = await runEmployeeLifecycleAutomation({
    source: "employee-records-test",
    employeeProfile: {
      employeeId: "emp-bootstrap",
      companyId: "co-bootstrap",
      tenantId: "tenant-bootstrap",
      employmentType: "full-time",
      legalEntityCode: "LE-BOOT",
      departmentId: "ENG",
      workLocationCode: "BKK",
      roleTitle: "Engineer",
    },
  });

  assert.equal(
    secondPass.actions.some(
      (action) => action.kind === "onboarding_auto_start"
    ),
    false
  );
});

test("evaluates due automation deterministically and avoids duplicate notifications", async () => {
  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-due",
      companyId: "co-due",
      tenantId: "tenant-due",
      initialStage: "onboarding",
      effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
    })
  );

  startEmployeeLifecycleProbation(
    {
      employeeId: "emp-due",
      companyId: "co-due",
      tenantId: "tenant-due",
      reviewDueAt: new Date("2026-06-02T00:00:00.000Z"),
      startedAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
      actorId: "hr-admin",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );

  startEmployeeLifecycleContract(
    {
      employeeId: "emp-due",
      companyId: "co-due",
      tenantId: "tenant-due",
      expiryAt: new Date("2026-06-05T00:00:00.000Z"),
      renewalReviewLeadDays: 2,
      renewalReminderLeadDays: 3,
      startedAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
      actorId: "hr-admin",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );

  const reminderEvaluated = evaluateEmployeeLifecycleAutomation(
    {
      employeeId: "emp-due",
      now: new Date("2026-06-02T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );

  assert.deepEqual(reminderEvaluated.map((action) => action.kind).sort(), [
    "contract_reminder_due",
    "probation_review_due",
  ]);

  const reviewEvaluated = evaluateEmployeeLifecycleAutomation(
    {
      employeeId: "emp-due",
      now: new Date("2026-06-04T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );

  assert.deepEqual(reviewEvaluated.map((action) => action.kind).sort(), [
    "contract_review_due",
    "probation_review_due",
  ]);

  await runEmployeeLifecycleAutomation(
    {
      employeeId: "emp-due",
      now: new Date("2026-06-02T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );
  await runEmployeeLifecycleAutomation(
    {
      employeeId: "emp-due",
      now: new Date("2026-06-04T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );
  await runEmployeeLifecycleAutomation(
    {
      employeeId: "emp-due",
      now: new Date("2026-06-04T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-due",
      tenantId: "tenant-due",
    }
  );

  const notifications = listEnqueuedEmployeeLifecycleNotificationIntents({
    companyId: "co-due",
    tenantId: "tenant-due",
  }).filter((intent) => intent.employeeId === "emp-due");

  assert.equal(notifications.length >= 3, true);
  assert.equal(
    new Set(notifications.map((intent) => intent.dedupeKey)).size,
    notifications.length
  );
});

test("records an offboarding handoff once and opens the offboarding case", async () => {
  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-exit-auto",
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
      initialStage: "active",
      effectiveAt: new Date("2026-07-01T00:00:00.000Z"),
      recordedAt: new Date("2026-07-01T00:00:00.000Z"),
    })
  );

  startEmployeeLifecycleResignation(
    {
      employeeId: "emp-exit-auto",
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
      effectiveAt: new Date("2026-07-02T00:00:00.000Z"),
      recordedAt: new Date("2026-07-02T00:00:00.000Z"),
      noticeEndsAt: new Date("2026-07-10T00:00:00.000Z"),
      lastWorkingAt: new Date("2026-07-10T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Resignation submitted",
    },
    {
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }
  );

  const firstRun = await runEmployeeLifecycleAutomation(
    {
      employeeId: "emp-exit-auto",
      now: new Date("2026-07-03T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }
  );

  assert.equal(firstRun.handoffs.length, 1);
  assert.equal(firstRun.handoffs[0]?.status, "linked");
  assert.equal(
    listEmployeeLifecycleOffboardingHandoffs({
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }).length,
    1
  );

  const cases = await listOffboardingCaseRecords(
    {
      companyId: "co-exit-auto",
      employeeId: "emp-exit-auto",
    },
    {
      canRead: true,
      canViewSensitive: true,
      canWrite: true,
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }
  );
  assert.equal(cases.length, 1);

  const secondRun = await runEmployeeLifecycleAutomation(
    {
      employeeId: "emp-exit-auto",
      now: new Date("2026-07-03T00:00:00.000Z"),
      source: "test",
    },
    {
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }
  );

  assert.equal(secondRun.handoffs.length, 0);
  assert.equal(
    listEmployeeLifecycleOffboardingHandoffs({
      companyId: "co-exit-auto",
      tenantId: "tenant-exit-auto",
    }).length,
    1
  );
});

test("records grade change as a first-class movement kind", () => {
  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-grade",
      companyId: "co-grade",
      tenantId: "tenant-grade",
      initialStage: "active",
      effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
    })
  );

  const movement = recordEmployeeLifecycleGradeChange(
    {
      employeeId: "emp-grade",
      companyId: "co-grade",
      tenantId: "tenant-grade",
      previousAssignment: {
        jobTitle: "Engineer",
        jobCode: "ENG-1",
        gradeCode: "G5",
        departmentId: "ENG",
        workLocationCode: "BKK",
        managerId: "mgr-1",
        reportingLineId: "rl-1",
      },
      nextAssignment: {
        jobTitle: "Engineer",
        jobCode: "ENG-1",
        gradeCode: "G6",
        departmentId: "ENG",
        workLocationCode: "BKK",
        managerId: "mgr-1",
        reportingLineId: "rl-1",
      },
      effectiveAt: new Date("2026-06-03T00:00:00.000Z"),
      recordedAt: new Date("2026-06-03T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Annual grade uplift",
      approvalReference: "GRADE-001",
    },
    {
      companyId: "co-grade",
      tenantId: "tenant-grade",
    }
  );

  assert.equal(movement.latestMovementKind, "grade_change");
  assert.equal(movement.currentAssignment?.gradeCode, "G6");
});
