import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  archiveEmployeeLifecycleExit,
  createEmployeeLifecycleState,
  getEmployeeLifecycleExitStatus,
  listEmployeeLifecycleExitEntries,
  listEmployeeLifecycleExitStatuses,
  recordEmployeeLifecycleExitNotice,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleContract,
  startEmployeeLifecycleResignation,
  startEmployeeLifecycleRetirement,
  startEmployeeLifecycleTermination,
  triggerEmployeeLifecycleOffboarding,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

const repositoryScope = {
  companyId: "co-exit",
  tenantId: "tenant-exit",
} as const;

const buildState = (
  employeeId: string,
  stage: "active" | "confirmed" | "suspended"
): ReturnType<typeof createEmployeeLifecycleState> =>
  createEmployeeLifecycleState({
    employeeId,
    companyId: repositoryScope.companyId,
    tenantId: repositoryScope.tenantId,
    initialStage: stage,
    effectiveAt: new Date("2026-07-01T00:00:00.000Z"),
    recordedAt: new Date("2026-07-01T00:00:00.000Z"),
  });

test("tracks resignation, termination, retirement, and offboarding archival", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-exit-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(buildState("emp-resignation", "active"));
  upsertEmployeeLifecycleState(buildState("emp-termination", "confirmed"));
  upsertEmployeeLifecycleState(buildState("emp-retirement", "suspended"));

  const resignationStarted = startEmployeeLifecycleResignation(
    {
      employeeId: "emp-resignation",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      effectiveAt: new Date("2026-07-02T00:00:00.000Z"),
      recordedAt: new Date("2026-07-02T00:00:00.000Z"),
      noticeEndsAt: new Date("2026-07-15T00:00:00.000Z"),
      lastWorkingAt: new Date("2026-07-15T00:00:00.000Z"),
      approvalReference: "EXIT-APP-001",
      actorId: "hr-partner",
      reason: "Employee resignation submitted",
      metadata: {
        caseId: "EXIT-001",
      },
    },
    repositoryScope
  );

  assert.equal(resignationStarted.exitKind, "resignation");
  assert.equal(resignationStarted.exitStatus, "initiated");
  assert.equal(resignationStarted.lifecycleStage, "notice_period");
  assert.equal(resignationStarted.isNoticeActive, true);

  const resignationNotice = recordEmployeeLifecycleExitNotice(
    {
      employeeId: "emp-resignation",
      noticeReference: "NOTICE-001",
      noticeRecordedAt: new Date("2026-07-03T00:00:00.000Z"),
      noticeEndsAt: new Date("2026-07-15T00:00:00.000Z"),
      lastWorkingAt: new Date("2026-07-15T00:00:00.000Z"),
      approvalReference: "EXIT-APP-002",
      actorId: "hr-manager",
      reason: "Notice period confirmed",
      metadata: {
        channel: "written",
      },
    },
    repositoryScope
  );

  assert.equal(resignationNotice.exitStatus, "notice_recorded");
  assert.equal(
    resignationNotice.lastNoticeAt?.toISOString(),
    "2026-07-03T00:00:00.000Z"
  );

  const resignationOffboarding = triggerEmployeeLifecycleOffboarding(
    {
      employeeId: "emp-resignation",
      offboardingReference: "OFF-001",
      offboardingAt: new Date("2026-07-15T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Last working date reached",
      metadata: {
        handoff: "it-and-payroll",
      },
    },
    repositoryScope
  );

  assert.equal(resignationOffboarding.lifecycleStage, "offboarding");
  assert.equal(resignationOffboarding.isOffboardingTriggered, true);

  const resignationArchived = archiveEmployeeLifecycleExit(
    {
      employeeId: "emp-resignation",
      archiveReference: "ARCH-001",
      archivedAt: new Date("2026-07-16T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Exit complete",
      metadata: {
        archiveBucket: "separation",
      },
    },
    repositoryScope
  );

  assert.equal(resignationArchived.lifecycleStage, "archived");
  assert.equal(resignationArchived.finalStage, "separated");
  assert.equal(resignationArchived.isArchived, true);
  assert.equal(
    listEmployeeLifecycleExitEntries("emp-resignation", repositoryScope).length,
    4
  );

  assert.throws(
    () =>
      startEmployeeLifecycleContract(
        {
          employeeId: "emp-resignation",
          companyId: repositoryScope.companyId,
          tenantId: repositoryScope.tenantId,
          expiryAt: new Date("2027-07-01T00:00:00.000Z"),
          renewalReviewLeadDays: 30,
          renewalReminderLeadDays: 45,
          startedAt: new Date("2026-07-16T00:00:00.000Z"),
          recordedAt: new Date("2026-07-16T00:00:00.000Z"),
          actorId: "hr-admin",
          reason: "Post-exit contract update",
          metadata: {
            contractNumber: "CT-EXIT-001",
          },
        },
        repositoryScope
      ),
    /contract lifecycle updated/
  );

  const terminationStarted = startEmployeeLifecycleTermination(
    {
      employeeId: "emp-termination",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      effectiveAt: new Date("2026-07-02T00:00:00.000Z"),
      recordedAt: new Date("2026-07-02T00:00:00.000Z"),
      approvalReference: "EXIT-APP-003",
      actorId: "hr-director",
      reason: "Termination approved",
      metadata: {
        caseId: "EXIT-002",
      },
    },
    repositoryScope
  );

  assert.equal(terminationStarted.exitKind, "termination");
  assert.equal(terminationStarted.lifecycleStage, "notice_period");

  const terminationOffboarding = triggerEmployeeLifecycleOffboarding(
    {
      employeeId: "emp-termination",
      offboardingReference: "OFF-002",
      offboardingAt: new Date("2026-07-03T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Immediate handoff",
      metadata: {
        handoff: "security-and-it",
      },
    },
    repositoryScope
  );

  assert.equal(terminationOffboarding.lifecycleStage, "offboarding");

  const terminationArchived = archiveEmployeeLifecycleExit(
    {
      employeeId: "emp-termination",
      archiveReference: "ARCH-002",
      archivedAt: new Date("2026-07-04T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Termination archived",
      metadata: {
        archiveBucket: "separation",
      },
    },
    repositoryScope
  );

  assert.equal(terminationArchived.finalStage, "separated");
  assert.equal(terminationArchived.lifecycleStage, "archived");

  const retirementStarted = startEmployeeLifecycleRetirement(
    {
      employeeId: "emp-retirement",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      effectiveAt: new Date("2026-07-02T00:00:00.000Z"),
      recordedAt: new Date("2026-07-02T00:00:00.000Z"),
      approvalReference: "EXIT-APP-004",
      actorId: "hr-director",
      reason: "Retirement approved",
      metadata: {
        caseId: "EXIT-003",
      },
    },
    repositoryScope
  );

  assert.equal(retirementStarted.exitKind, "retirement");

  const retirementOffboarding = triggerEmployeeLifecycleOffboarding(
    {
      employeeId: "emp-retirement",
      offboardingReference: "OFF-003",
      offboardingAt: new Date("2026-07-03T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Retirement handoff",
      metadata: {
        handoff: "benefits-and-hr",
      },
    },
    repositoryScope
  );

  assert.equal(retirementOffboarding.lifecycleStage, "offboarding");

  const retirementArchived = archiveEmployeeLifecycleExit(
    {
      employeeId: "emp-retirement",
      archiveReference: "ARCH-003",
      archivedAt: new Date("2026-07-04T00:00:00.000Z"),
      actorId: "hr-ops",
      reason: "Retirement archived",
      metadata: {
        archiveBucket: "retirement",
      },
    },
    repositoryScope
  );

  assert.equal(retirementArchived.finalStage, "retired");
  assert.equal(retirementArchived.lifecycleStage, "archived");

  assert.equal(
    getEmployeeLifecycleExitStatus("emp-resignation", repositoryScope)
      ?.exitStatus,
    "archived"
  );
  assert.equal(
    getEmployeeLifecycleExitStatus("emp-termination", repositoryScope)
      ?.finalStage,
    "separated"
  );
  assert.equal(
    getEmployeeLifecycleExitStatus("emp-retirement", repositoryScope)
      ?.finalStage,
    "retired"
  );

  const exitStatuses = listEmployeeLifecycleExitStatuses(repositoryScope);
  assert.equal(exitStatuses.length, 3);
  assert.deepEqual(
    exitStatuses.map((status) => status.employeeId),
    ["emp-resignation", "emp-retirement", "emp-termination"]
  );
});
