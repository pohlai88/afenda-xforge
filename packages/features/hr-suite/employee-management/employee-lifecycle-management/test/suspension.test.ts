import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createEmployeeLifecycleState,
  getEmployeeLifecycleSuspensionStatus,
  listEmployeeLifecycleSuspensionEntries,
  listEmployeeLifecycleSuspensionStatuses,
  releaseEmployeeLifecycleSuspension,
  resetEmployeeLifecycleRepositoryForTesting,
  resolveEmployeeLifecycleHold,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleContract,
  startEmployeeLifecycleHold,
  startEmployeeLifecycleSuspension,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

const repositoryScope = {
  companyId: "co-suspension",
  tenantId: "tenant-suspension",
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * DAY_MS);

const buildState = (
  employeeId: string,
  stage: "active" | "confirmed"
): ReturnType<typeof createEmployeeLifecycleState> =>
  createEmployeeLifecycleState({
    employeeId,
    companyId: repositoryScope.companyId,
    tenantId: repositoryScope.tenantId,
    initialStage: stage,
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });

test("tracks suspension, hold, release, and resolution workflows", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-suspension-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(buildState("emp-release", "active"));
  upsertEmployeeLifecycleState(buildState("emp-resolve", "confirmed"));
  upsertEmployeeLifecycleState(buildState("emp-blocked", "active"));

  const releasedSuspension = startEmployeeLifecycleSuspension(
    {
      employeeId: "emp-release",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      suspensionKind: "suspension",
      effectiveAt: new Date("2026-06-02T00:00:00.000Z"),
      recordedAt: new Date("2026-06-02T00:00:00.000Z"),
      authorizationReference: "AUTH-001",
      approvalReference: "APP-001",
      actorId: "hr-security",
      reason: "Active investigation",
      metadata: {
        caseId: "CASE-001",
      },
    },
    repositoryScope
  );

  assert.equal(releasedSuspension.lifecycleStage, "suspended");
  assert.equal(releasedSuspension.suspensionKind, "suspension");
  assert.equal(releasedSuspension.suspensionStatus, "active");
  assert.equal(releasedSuspension.isRestricted, true);
  assert.equal(releasedSuspension.entries.length, 1);
  assert.equal(releasedSuspension.events[0]?.event, "started");

  const heldSuspension = startEmployeeLifecycleHold(
    {
      employeeId: "emp-resolve",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      effectiveAt: new Date("2026-06-03T00:00:00.000Z"),
      recordedAt: new Date("2026-06-03T00:00:00.000Z"),
      authorizationReference: "AUTH-002",
      approvalReference: "APP-002",
      actorId: "hr-partner",
      reason: "Temporary restriction",
      metadata: {
        caseId: "CASE-002",
      },
    },
    repositoryScope
  );

  assert.equal(heldSuspension.lifecycleStage, "suspended");
  assert.equal(heldSuspension.suspensionKind, "hold");
  assert.equal(heldSuspension.isRestricted, true);

  const blockedSuspension = startEmployeeLifecycleSuspension(
    {
      employeeId: "emp-blocked",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      suspensionKind: "suspension",
      effectiveAt: new Date("2026-06-04T00:00:00.000Z"),
      recordedAt: new Date("2026-06-04T00:00:00.000Z"),
      authorizationReference: "AUTH-003",
      approvalReference: "APP-003",
      actorId: "hr-security",
      reason: "Access restriction",
      metadata: {
        caseId: "CASE-003",
      },
    },
    repositoryScope
  );

  assert.equal(blockedSuspension.lifecycleStage, "suspended");
  assert.throws(
    () =>
      startEmployeeLifecycleContract(
        {
          employeeId: "emp-blocked",
          companyId: repositoryScope.companyId,
          tenantId: repositoryScope.tenantId,
          expiryAt: daysFromNow(90),
          renewalReviewLeadDays: 30,
          renewalReminderLeadDays: 45,
          startedAt: new Date("2026-06-04T00:00:00.000Z"),
          recordedAt: new Date("2026-06-04T00:00:00.000Z"),
          actorId: "hr-admin",
          reason: "Initial fixed-term contract",
          metadata: {
            contractNumber: "CT-BLOCKED",
          },
        },
        repositoryScope
      ),
    /suspended/
  );

  const released = releaseEmployeeLifecycleSuspension(
    {
      employeeId: "emp-release",
      suspensionKind: "suspension",
      closedAt: new Date("2026-06-05T00:00:00.000Z"),
      resolutionReference: "RES-001",
      resolutionEvidenceReference: "EVID-001",
      approvalReference: "APP-004",
      actorId: "hr-director",
      reason: "Investigation closed without action",
      metadata: {
        resolution: "released",
      },
    },
    repositoryScope
  );

  assert.equal(released.lifecycleStage, "active");
  assert.equal(released.suspensionStatus, "released");
  assert.equal(released.isRestricted, false);
  assert.equal(
    released.lastReleasedAt?.toISOString(),
    "2026-06-05T00:00:00.000Z"
  );
  assert.equal(
    listEmployeeLifecycleSuspensionEntries("emp-release", repositoryScope).at(
      -1
    )?.status,
    "released"
  );

  const resolved = resolveEmployeeLifecycleHold(
    {
      employeeId: "emp-resolve",
      closedAt: new Date("2026-06-06T00:00:00.000Z"),
      resolutionReference: "RES-002",
      resolutionEvidenceReference: "EVID-002",
      approvalReference: "APP-005",
      actorId: "hr-director",
      reason: "Restriction resolved after review",
      metadata: {
        resolution: "resolved",
      },
    },
    repositoryScope
  );

  assert.equal(resolved.lifecycleStage, "active");
  assert.equal(resolved.suspensionStatus, "resolved");
  assert.equal(resolved.isRestricted, false);
  assert.equal(
    resolved.lastResolvedAt?.toISOString(),
    "2026-06-06T00:00:00.000Z"
  );

  assert.equal(
    getEmployeeLifecycleSuspensionStatus("emp-release", repositoryScope)
      ?.suspensionStatus,
    "released"
  );
  assert.equal(
    getEmployeeLifecycleSuspensionStatus("emp-resolve", repositoryScope)
      ?.suspensionStatus,
    "resolved"
  );
  assert.equal(
    getEmployeeLifecycleSuspensionStatus("emp-blocked", repositoryScope)
      ?.suspensionStatus,
    "active"
  );

  const suspensionStatuses =
    listEmployeeLifecycleSuspensionStatuses(repositoryScope);

  assert.equal(suspensionStatuses.length, 3);
  assert.deepEqual(
    suspensionStatuses.map((status) => status.employeeId),
    ["emp-release", "emp-resolve", "emp-blocked"]
  );
});
