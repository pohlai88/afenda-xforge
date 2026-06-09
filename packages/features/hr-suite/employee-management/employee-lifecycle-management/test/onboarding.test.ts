import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  activateEmployeeLifecycleOnboarding,
  completeEmployeeLifecycleOnboardingTask,
  getEmployeeLifecycleOnboardingStatus,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleOnboarding,
} from "../src/index.ts";

test("starts onboarding, tracks checklist completion, and activates the worker", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-onboarding-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  const started = startEmployeeLifecycleOnboarding(
    {
      profile: {
        employeeId: "emp-onboarding",
        companyId: "co-onboarding",
        tenantId: "tenant-onboarding",
        employmentType: "full-time",
        legalEntityCode: "LE-001",
        departmentId: "ENG",
        workLocationCode: "BKK",
        roleTitle: "Software Engineer",
      },
      startedAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "Employee converted to onboarding",
    },
    {
      companyId: "co-onboarding",
      tenantId: "tenant-onboarding",
    }
  );

  assert.equal(started.lifecycleStage, "onboarding");
  assert.equal(started.workflowStatus, "in_progress");
  assert.equal(started.tasks.length, 8);
  assert.deepEqual(
    started.tasks.map((task) => task.code),
    [
      "welcome_packet",
      "document_verification",
      "policy_acknowledgment",
      "employment_type_review",
      "legal_entity_setup",
      "department_orientation",
      "location_orientation",
      "role_enablement",
    ]
  );

  const afterDocumentCheck = completeEmployeeLifecycleOnboardingTask(
    {
      employeeId: "emp-onboarding",
      taskCode: "document_verification",
      completedAt: new Date("2026-06-02T00:00:00.000Z"),
      actorId: "hr-admin",
      documentReferenceId: "doc-100",
      policyAcknowledgmentId: "policy-200",
      notes: "Core documents are complete",
    },
    {
      companyId: "co-onboarding",
      tenantId: "tenant-onboarding",
    }
  );

  assert.equal(afterDocumentCheck.workflowStatus, "in_progress");
  assert.equal(afterDocumentCheck.tasks[1]?.status, "completed");
  assert.equal(afterDocumentCheck.tasks[1]?.documentReferenceId, "doc-100");
  assert.equal(
    afterDocumentCheck.tasks[1]?.policyAcknowledgmentId,
    "policy-200"
  );

  const remainingTaskCodes = started.tasks
    .map((task) => task.code)
    .filter((taskCode) => taskCode !== "document_verification");

  for (const taskCode of remainingTaskCodes) {
    completeEmployeeLifecycleOnboardingTask(
      {
        employeeId: "emp-onboarding",
        taskCode,
        completedAt: new Date("2026-06-03T00:00:00.000Z"),
        actorId: "hr-admin",
      },
      {
        companyId: "co-onboarding",
        tenantId: "tenant-onboarding",
      }
    );
  }

  const readyStatus = getEmployeeLifecycleOnboardingStatus("emp-onboarding", {
    companyId: "co-onboarding",
    tenantId: "tenant-onboarding",
  });

  assert.ok(readyStatus);
  assert.equal(readyStatus.workflowStatus, "ready_for_activation");
  assert.equal(readyStatus.isReadyForActivation, true);
  assert.equal(readyStatus.remainingRequiredTasks, 0);
  assert.equal(readyStatus.events.at(-1)?.event, "ready_for_activation");

  const activated = activateEmployeeLifecycleOnboarding(
    {
      employeeId: "emp-onboarding",
      activatedAt: new Date("2026-06-04T00:00:00.000Z"),
      actorId: "hr-admin",
      reason: "All onboarding tasks completed",
    },
    {
      companyId: "co-onboarding",
      tenantId: "tenant-onboarding",
    }
  );

  assert.equal(activated.lifecycleStage, "active");
  assert.equal(activated.workflowStatus, "activated");
  assert.equal(activated.isActivated, true);
  assert.equal(
    activated.activatedAt?.toISOString(),
    "2026-06-04T00:00:00.000Z"
  );

  const finalStatus = getEmployeeLifecycleOnboardingStatus("emp-onboarding", {
    companyId: "co-onboarding",
    tenantId: "tenant-onboarding",
  });

  assert.ok(finalStatus);
  assert.equal(finalStatus.lifecycleStage, "active");
  assert.equal(finalStatus.workflowStatus, "activated");
  assert.equal(finalStatus.isActivated, true);
  assert.equal(
    finalStatus.tasks.every((task) => task.status === "completed"),
    true
  );
});
