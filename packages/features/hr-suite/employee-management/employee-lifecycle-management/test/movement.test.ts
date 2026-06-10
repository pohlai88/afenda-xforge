import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  upsertEmployeeLifecycleState,
} from "../src/repository.ts";
import { createEmployeeLifecycleState } from "../src/schema.ts";
import {
  getEmployeeLifecycleMovementStatus,
  listEmployeeLifecycleMovementEntries,
  listEmployeeLifecycleMovementStatuses,
  recordEmployeeLifecycleDemotion,
  recordEmployeeLifecycleDepartmentChange,
  recordEmployeeLifecycleJobChange,
  recordEmployeeLifecycleLocationChange,
  recordEmployeeLifecycleManagerChange,
  recordEmployeeLifecyclePromotion,
  recordEmployeeLifecycleReportingLineChange,
  recordEmployeeLifecycleTransfer,
} from "../src/server.ts";

const repositoryScope = {
  companyId: "co-movement",
  tenantId: "tenant-movement",
} as const;

const buildState = (
  employeeId: string,
  stage: "confirmed" | "active"
): ReturnType<typeof createEmployeeLifecycleState> =>
  createEmployeeLifecycleState({
    employeeId,
    companyId: repositoryScope.companyId,
    tenantId: repositoryScope.tenantId,
    initialStage: stage,
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });

const buildAssignment = (
  overrides: Partial<Record<string, string>> = {}
): Readonly<{
  jobTitle: string;
  jobCode: string;
  gradeCode: string;
  departmentId: string;
  workLocationCode: string;
  managerId: string;
  reportingLineId: string;
}> => ({
  jobTitle: overrides.jobTitle ?? "Developer",
  jobCode: overrides.jobCode ?? "DEV-01",
  gradeCode: overrides.gradeCode ?? "G5",
  departmentId: overrides.departmentId ?? "ENG",
  workLocationCode: overrides.workLocationCode ?? "BKK",
  managerId: overrides.managerId ?? "mgr-001",
  reportingLineId: overrides.reportingLineId ?? "rl-001",
});

test("records movement history for promotion, transfer, demotion, and org changes", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-movement-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(buildState("emp-movement", "confirmed"));
  upsertEmployeeLifecycleState(buildState("emp-org", "active"));

  const promotion = recordEmployeeLifecyclePromotion(
    {
      employeeId: "emp-movement",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: buildAssignment(),
      nextAssignment: buildAssignment({
        jobTitle: "Senior Developer",
        jobCode: "DEV-02",
        gradeCode: "G6",
      }),
      effectiveAt: new Date("2026-06-02T00:00:00.000Z"),
      recordedAt: new Date("2026-06-02T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Promotion approved",
      approvalReference: "mov-prom-001",
    },
    repositoryScope
  );

  assert.equal(promotion.lifecycleStage, "active");
  assert.equal(promotion.latestMovementKind, "promotion");
  assert.equal(promotion.currentAssignment?.jobTitle, "Senior Developer");
  assert.equal(promotion.movementCount, 1);

  const transfer = recordEmployeeLifecycleTransfer(
    {
      employeeId: "emp-movement",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: promotion.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Senior Developer",
        jobCode: "DEV-02",
        gradeCode: "G6",
        departmentId: "PLAT",
        workLocationCode: "SIN",
        managerId: "mgr-002",
        reportingLineId: "rl-002",
      }),
      effectiveAt: new Date("2026-06-03T00:00:00.000Z"),
      recordedAt: new Date("2026-06-03T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Team transfer",
      approvalReference: "mov-transfer-001",
    },
    repositoryScope
  );

  assert.equal(transfer.latestMovementKind, "transfer");
  assert.equal(transfer.currentAssignment?.departmentId, "PLAT");
  assert.equal(transfer.currentAssignment?.workLocationCode, "SIN");
  assert.equal(transfer.currentAssignment?.managerId, "mgr-002");

  const demotion = recordEmployeeLifecycleDemotion(
    {
      employeeId: "emp-movement",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: transfer.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Developer",
        jobCode: "DEV-01",
        gradeCode: "G5",
        departmentId: "PLAT",
        workLocationCode: "SIN",
        managerId: "mgr-002",
        reportingLineId: "rl-002",
      }),
      effectiveAt: new Date("2026-06-04T00:00:00.000Z"),
      recordedAt: new Date("2026-06-04T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Role adjustment",
      approvalReference: "mov-demote-001",
    },
    repositoryScope
  );

  assert.equal(demotion.latestMovementKind, "demotion");
  assert.equal(demotion.currentAssignment?.gradeCode, "G5");
  assert.equal(demotion.movementCount, 3);

  const orgChangeStart = buildAssignment({
    jobTitle: "Developer",
    jobCode: "DEV-01",
    gradeCode: "G5",
    departmentId: "ENG",
    workLocationCode: "BKK",
    managerId: "mgr-010",
    reportingLineId: "rl-010",
  });

  const jobChanged = recordEmployeeLifecycleJobChange(
    {
      employeeId: "emp-org",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: orgChangeStart,
      nextAssignment: buildAssignment({
        jobTitle: "Lead Developer",
        jobCode: "DEV-03",
        gradeCode: "G6",
        departmentId: "ENG",
        workLocationCode: "BKK",
        managerId: "mgr-010",
        reportingLineId: "rl-010",
      }),
      effectiveAt: new Date("2026-06-05T00:00:00.000Z"),
      recordedAt: new Date("2026-06-05T00:00:00.000Z"),
      actorId: "hr-partner",
      reason: "Job redesign",
      approvalReference: "mov-job-001",
    },
    repositoryScope
  );

  const departmentChanged = recordEmployeeLifecycleDepartmentChange(
    {
      employeeId: "emp-org",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: jobChanged.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Lead Developer",
        jobCode: "DEV-03",
        gradeCode: "G6",
        departmentId: "PLAT",
        workLocationCode: "BKK",
        managerId: "mgr-010",
        reportingLineId: "rl-010",
      }),
      effectiveAt: new Date("2026-06-06T00:00:00.000Z"),
      recordedAt: new Date("2026-06-06T00:00:00.000Z"),
      actorId: "hr-partner",
      reason: "Department restructure",
      approvalReference: "mov-dept-001",
    },
    repositoryScope
  );

  const locationChanged = recordEmployeeLifecycleLocationChange(
    {
      employeeId: "emp-org",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: departmentChanged.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Lead Developer",
        jobCode: "DEV-03",
        gradeCode: "G6",
        departmentId: "PLAT",
        workLocationCode: "SIN",
        managerId: "mgr-010",
        reportingLineId: "rl-010",
      }),
      effectiveAt: new Date("2026-06-07T00:00:00.000Z"),
      recordedAt: new Date("2026-06-07T00:00:00.000Z"),
      actorId: "hr-partner",
      reason: "Location reassignment",
      approvalReference: "mov-loc-001",
    },
    repositoryScope
  );

  const managerChanged = recordEmployeeLifecycleManagerChange(
    {
      employeeId: "emp-org",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: locationChanged.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Lead Developer",
        jobCode: "DEV-03",
        gradeCode: "G6",
        departmentId: "PLAT",
        workLocationCode: "SIN",
        managerId: "mgr-020",
        reportingLineId: "rl-010",
      }),
      effectiveAt: new Date("2026-06-08T00:00:00.000Z"),
      recordedAt: new Date("2026-06-08T00:00:00.000Z"),
      actorId: "hr-partner",
      reason: "Manager reassignment",
      approvalReference: "mov-mgr-001",
    },
    repositoryScope
  );

  const reportingLineChanged = recordEmployeeLifecycleReportingLineChange(
    {
      employeeId: "emp-org",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      previousAssignment: managerChanged.currentAssignment ?? null,
      nextAssignment: buildAssignment({
        jobTitle: "Lead Developer",
        jobCode: "DEV-03",
        gradeCode: "G6",
        departmentId: "PLAT",
        workLocationCode: "SIN",
        managerId: "mgr-020",
        reportingLineId: "rl-020",
      }),
      effectiveAt: new Date("2026-06-09T00:00:00.000Z"),
      recordedAt: new Date("2026-06-09T00:00:00.000Z"),
      actorId: "hr-partner",
      reason: "Reporting line update",
      approvalReference: "mov-rl-001",
    },
    repositoryScope
  );

  assert.equal(
    reportingLineChanged.currentAssignment?.reportingLineId,
    "rl-020"
  );
  assert.equal(reportingLineChanged.movementCount, 5);

  const movementStatus = getEmployeeLifecycleMovementStatus(
    "emp-movement",
    repositoryScope
  );
  assert.ok(movementStatus);
  assert.equal(movementStatus.movementCount, 3);
  assert.equal(
    listEmployeeLifecycleMovementEntries("emp-movement", repositoryScope)
      .length,
    3
  );

  const movementStatuses =
    listEmployeeLifecycleMovementStatuses(repositoryScope);
  assert.equal(movementStatuses.length, 2);
  assert.deepEqual(movementStatuses.map((status) => status.employeeId).sort(), [
    "emp-movement",
    "emp-org",
  ]);
});
