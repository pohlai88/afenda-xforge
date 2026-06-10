import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createOffboardingExitManagement,
  getOffboardingCaseById,
  listOffboardingCases,
  offboardingCaseRecordSchema,
  offboardingExitManagementFeatureId,
  offboardingExitManagementManifest,
  offboardingExitManagementMetadata,
  offboardingExitManagementRoutePaths,
  openOffboardingCaseInputSchema,
  updateOffboardingCase,
} from "../src/index.ts";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-offboarding-public-api-${randomUUID()}.json`
  );
  setOffboardingRepositoryPathForTesting(currentRepositoryPath);
  await resetOffboardingRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("publishes stable offboarding metadata and manifest foundation", () => {
  assert.equal(
    offboardingExitManagementMetadata.id,
    offboardingExitManagementFeatureId
  );
  assert.equal(
    offboardingExitManagementManifest.packageName,
    "@repo/features-employee-management-offboarding-exit-management"
  );
  assert.equal(offboardingExitManagementManifest.version, 1);
  assert.equal(offboardingExitManagementManifest.schemaVersion, 1);
});

test("builds stable route paths for the offboarding workspace", () => {
  assert.equal(
    offboardingExitManagementRoutePaths.offboarding,
    "/hr/offboarding"
  );
  assert.equal(
    offboardingExitManagementRoutePaths.detail("case-123"),
    "/hr/offboarding/case-123"
  );
  assert.equal(
    offboardingExitManagementRoutePaths.checklist("case-123"),
    "/hr/offboarding/case-123/checklist"
  );
});

test("supports the public case contract through compatibility actions", async () => {
  const parsedInput = openOffboardingCaseInputSchema.parse({
    caseTitle: "Resignation - Engineering Manager",
    employeeId: "emp-123",
    lifecycleTrigger: {
      sourceFeatureId:
        "hr-suite.employee-management.employee-lifecycle-management",
      sourceLifecycleEventId: "lifecycle-event-123",
      exitType: "resignation",
      triggeredAt: new Date("2026-06-10T00:00:00.000Z"),
      lastWorkingDate: new Date("2026-06-30T00:00:00.000Z"),
      effectiveSeparationDate: new Date("2026-07-01T00:00:00.000Z"),
    },
    reasonSummary: "Voluntary resignation with standard notice.",
  });

  const context = {
    actorId: "actor-1",
    canRead: true,
    canWrite: true,
    companyId: "company-1",
    tenantId: "tenant-1",
  } as const;

  const createdRecord = await createOffboardingExitManagement(
    parsedInput,
    context
  );

  assert.equal(createdRecord.caseTitle, parsedInput.caseTitle);
  assert.equal(createdRecord.status, "draft");
  assert.equal(createdRecord.exitType, "resignation");
  assert.doesNotThrow(() => offboardingCaseRecordSchema.parse(createdRecord));
  assert.equal(
    createdRecord.lastWorkingDate?.toISOString(),
    "2026-06-30T00:00:00.000Z"
  );

  const updatedRecord = await updateOffboardingCase(
    {
      id: createdRecord.id,
      status: "active",
      reasonSummary: "Knowledge transfer is in progress.",
    },
    context
  );

  assert.equal(updatedRecord.status, "active");
  assert.equal(
    (await getOffboardingCaseById(createdRecord.id, context))?.reasonSummary,
    "Knowledge transfer is in progress."
  );

  const listedRecords = await listOffboardingCases(
    {
      employeeId: "emp-123",
      search: "Engineering Manager",
    },
    context
  );

  assert.ok(listedRecords.some((record) => record.id === createdRecord.id));
});
