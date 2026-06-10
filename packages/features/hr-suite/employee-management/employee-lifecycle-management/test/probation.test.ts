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
  approveEmployeeLifecycleProbationConfirmation,
  extendEmployeeLifecycleProbation,
  getEmployeeLifecycleProbationStatus,
  listEmployeeLifecycleProbationReviews,
  listEmployeeLifecycleProbationStatuses,
  recordEmployeeLifecycleProbationReview,
  startEmployeeLifecycleProbation,
} from "../src/server.ts";

const repositoryScope = {
  companyId: "co-probation",
  tenantId: "tenant-probation",
} as const;

const createOnboardingSeedState = (
  employeeId: string
): ReturnType<typeof createEmployeeLifecycleState> =>
  createEmployeeLifecycleState({
    employeeId,
    companyId: repositoryScope.companyId,
    tenantId: repositoryScope.tenantId,
    initialStage: "onboarding",
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });

test("tracks probation reviews, extensions, and confirmation approval", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-probation-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(createOnboardingSeedState("emp-probation"));
  upsertEmployeeLifecycleState(createOnboardingSeedState("emp-extension"));
  upsertEmployeeLifecycleState(createOnboardingSeedState("emp-adverse"));

  const started = startEmployeeLifecycleProbation(
    {
      employeeId: "emp-probation",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      reviewDueAt: new Date("2026-06-12T00:00:00.000Z"),
      scheduledEndAt: new Date("2026-06-18T00:00:00.000Z"),
      startedAt: new Date("2026-06-05T00:00:00.000Z"),
      recordedAt: new Date("2026-06-05T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Onboarding complete",
      metadata: {
        source: "hire-flow",
      },
    },
    repositoryScope
  );

  assert.equal(started.lifecycleStage, "probation");
  assert.equal(started.workflowStatus, "scheduled");
  assert.equal(started.isReviewDue, false);
  assert.equal(started.reviewHistory.length, 0);
  assert.equal(started.events[0]?.event, "started");
  assert.equal(started.events[1]?.event, "review_scheduled");

  const reviewed = recordEmployeeLifecycleProbationReview(
    {
      employeeId: "emp-probation",
      outcome: "confirm",
      reviewedAt: new Date("2026-06-12T00:00:00.000Z"),
      actorId: "line-manager",
      reason: "Employee met probation criteria",
      approvalReference: "prob-review-001",
      notes: "Ready for confirmation approval",
    },
    repositoryScope
  );

  assert.equal(reviewed.workflowStatus, "confirmation_pending");
  assert.equal(reviewed.lastReviewOutcome, "confirm");
  assert.equal(reviewed.reviewHistory.length, 1);
  assert.equal(reviewed.reviewHistory[0]?.outcome, "confirm");
  assert.equal(reviewed.events.at(-1)?.event, "review_recorded");

  startEmployeeLifecycleProbation(
    {
      employeeId: "emp-extension",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      reviewDueAt: new Date("2026-06-12T00:00:00.000Z"),
      scheduledEndAt: new Date("2026-06-18T00:00:00.000Z"),
      startedAt: new Date("2026-06-05T00:00:00.000Z"),
      recordedAt: new Date("2026-06-05T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Onboarding complete",
    },
    repositoryScope
  );

  const approved = approveEmployeeLifecycleProbationConfirmation(
    {
      employeeId: "emp-probation",
      approvedAt: new Date("2026-06-14T00:00:00.000Z"),
      actorId: "hr-director",
      approvalReference: "prob-confirm-001",
      reason: "Approved after review",
    },
    repositoryScope
  );

  assert.equal(approved.workflowStatus, "confirmed");
  assert.equal(approved.confirmationApprovalReference, "prob-confirm-001");
  assert.equal(
    approved.confirmationApprovedAt?.toISOString(),
    "2026-06-14T00:00:00.000Z"
  );
  assert.equal(approved.events.at(-1)?.event, "confirmation_approved");

  const extended = extendEmployeeLifecycleProbation(
    {
      employeeId: "emp-extension",
      nextReviewDueAt: new Date("2026-06-25T00:00:00.000Z"),
      scheduledEndAt: new Date("2026-06-29T00:00:00.000Z"),
      extendedAt: new Date("2026-06-14T00:00:00.000Z"),
      actorId: "hr-manager",
      reason: "Additional observation period required",
      approvalReference: "prob-extend-001",
      notes: "Performance is acceptable but needs more time",
    },
    repositoryScope
  );

  assert.equal(extended.workflowStatus, "extended");
  assert.equal(extended.extensionCount, 1);
  assert.equal(extended.reviewDueAt.toISOString(), "2026-06-25T00:00:00.000Z");
  assert.equal(extended.reviewHistory[0]?.outcome, "extend");
  assert.equal(extended.events.at(-1)?.event, "extended");

  startEmployeeLifecycleProbation(
    {
      employeeId: "emp-adverse",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      reviewDueAt: new Date("2026-06-12T00:00:00.000Z"),
      scheduledEndAt: new Date("2026-06-18T00:00:00.000Z"),
      startedAt: new Date("2026-06-05T00:00:00.000Z"),
      recordedAt: new Date("2026-06-05T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Onboarding complete",
    },
    repositoryScope
  );

  const adverse = recordEmployeeLifecycleProbationReview(
    {
      employeeId: "emp-adverse",
      outcome: "termination_recommended",
      reviewedAt: new Date("2026-06-13T00:00:00.000Z"),
      actorId: "hr-manager",
      reason: "Performance concerns persisted",
      approvalReference: "prob-term-001",
      notes: "Documented concerns recorded for case review",
    },
    repositoryScope
  );

  assert.equal(adverse.workflowStatus, "termination_recommended");
  assert.equal(adverse.lastReviewOutcome, "termination_recommended");
  assert.equal(adverse.events.at(-1)?.event, "termination_recommended");

  const confirmationStatus = getEmployeeLifecycleProbationStatus(
    "emp-probation",
    repositoryScope
  );
  assert.ok(confirmationStatus);
  assert.equal(confirmationStatus.workflowStatus, "confirmed");
  assert.equal(
    listEmployeeLifecycleProbationReviews("emp-probation", repositoryScope)
      .length,
    1
  );

  const probationStatuses =
    listEmployeeLifecycleProbationStatuses(repositoryScope);
  assert.equal(probationStatuses.length, 3);
  assert.deepEqual(
    probationStatuses.map((status) => status.employeeId).sort(),
    ["emp-adverse", "emp-extension", "emp-probation"]
  );
});
