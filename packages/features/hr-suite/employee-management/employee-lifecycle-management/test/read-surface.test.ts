import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createEmployeeLifecycleState,
  getEmployeeLifecycleOverviewEntry,
  getEmployeeLifecycleOverviewSnapshot,
  listEmployeeLifecycleAuditTrailEntries,
  listEmployeeLifecycleHistoryEntries,
  listEmployeeLifecycleStageSummaries,
  listEmployeeLifecycleTaskEntries,
  recordEmployeeLifecycleExitNotice,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleResignation,
  transitionEmployeeLifecycleState,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

const repositoryScope = {
  companyId: "co-surface",
  tenantId: "tenant-surface",
} as const;

test("projects overview, history, tasks, and audit trail read models", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-surface-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-overview",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      initialStage: "active",
      effectiveAt: new Date("2026-07-01T00:00:00.000Z"),
      recordedAt: new Date("2026-07-01T00:00:00.000Z"),
    })
  );

  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-exit",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      initialStage: "active",
      effectiveAt: new Date("2026-07-01T00:00:00.000Z"),
      recordedAt: new Date("2026-07-01T00:00:00.000Z"),
    })
  );

  const transitionedState = transitionEmployeeLifecycleState(
    {
      employeeId: "emp-overview",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      toStage: "suspended",
      effectiveAt: new Date("2026-07-02T00:00:00.000Z"),
      recordedAt: new Date("2026-07-02T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Investigatory hold",
      metadata: {
        caseId: "CASE-001",
      },
    },
    repositoryScope
  );

  assert.equal(transitionedState.currentStage, "suspended");

  const exitRecord = startEmployeeLifecycleResignation(
    {
      employeeId: "emp-exit",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      effectiveAt: new Date("2026-07-03T00:00:00.000Z"),
      recordedAt: new Date("2026-07-03T00:00:00.000Z"),
      noticeEndsAt: new Date("2026-07-17T00:00:00.000Z"),
      lastWorkingAt: new Date("2026-07-17T00:00:00.000Z"),
      approvalReference: "EXIT-APP-100",
      actorId: "hr-partner",
      reason: "Employee resignation submitted",
      metadata: {
        source: "letter",
      },
    },
    repositoryScope
  );

  recordEmployeeLifecycleExitNotice(
    {
      employeeId: "emp-exit",
      noticeReference: "NOTICE-100",
      noticeRecordedAt: new Date("2026-07-04T00:00:00.000Z"),
      noticeEndsAt: new Date("2026-07-17T00:00:00.000Z"),
      lastWorkingAt: new Date("2026-07-17T00:00:00.000Z"),
      approvalReference: "EXIT-APP-101",
      actorId: "hr-manager",
      reason: "Notice period confirmed",
      metadata: {
        channel: "written",
      },
    },
    repositoryScope
  );

  const overviewSnapshot = getEmployeeLifecycleOverviewSnapshot(
    repositoryScope,
    {
      canRead: true,
      canViewSensitive: false,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }
  );

  assert.equal(overviewSnapshot.totalEmployees, 2);
  assert.equal(
    getEmployeeLifecycleOverviewEntry("emp-exit", repositoryScope, {
      canRead: true,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    })?.lifecycleStage,
    "notice_period"
  );
  assert.ok(
    listEmployeeLifecycleStageSummaries(repositoryScope, {
      canRead: true,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }).length > 0
  );

  const redactedHistory = listEmployeeLifecycleHistoryEntries(
    "emp-exit",
    repositoryScope,
    {
      canRead: true,
      canViewSensitive: false,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }
  );
  const visibleHistory = listEmployeeLifecycleHistoryEntries(
    "emp-exit",
    repositoryScope,
    {
      canRead: true,
      canViewSensitive: true,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }
  );

  assert.equal(redactedHistory.at(-1)?.actorId, null);
  assert.equal(visibleHistory.at(-1)?.actorId, "hr-manager");
  assert.ok(
    listEmployeeLifecycleAuditTrailEntries("emp-exit", repositoryScope, {
      canRead: true,
      canViewSensitive: true,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }).length >= visibleHistory.length
  );

  const exitTasks = listEmployeeLifecycleTaskEntries(
    "emp-exit",
    repositoryScope,
    {
      canRead: true,
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
    }
  );

  assert.equal(exitTasks.at(0)?.source, "exit");
  assert.equal(
    exitTasks.some((task) => task.title.includes("Exit notice")),
    true
  );
  assert.equal(exitRecord.exitStatus, "notice_recorded");
});
