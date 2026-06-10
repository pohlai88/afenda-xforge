import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  getEmployeeLifecycleOnboardingStatus,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
} from "../../employee-lifecycle-management/src/index.ts";
import { upsertComplianceWorkerProfileInputSchema } from "../../compliance-regulatory-tracking/src/index.ts";
import { hrRecordsFeatureManifestSchema } from "../src/contracts/manifest.contract.ts";
import { hrRecordsFeatureScope } from "../src/feature-scope.ts";
import {
  buildHrEmployeeIntegrationChangeEvent,
  buildHrEmployeeIntegrationSnapshot,
  hrRecordsFeatureManifest,
  hrRecordsFeatureMetadata,
  hrRecordsIntegrationEventSchema,
  hrRecordsIntegrationEvents,
  hrRecordsRouteContract,
  hrRecordsRoutePaths,
} from "../src/index.ts";
import { hrRecordsActionRegistry } from "../src/registry/action-registry.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../src/repository.ts";
import { createHrEmployeeRecord, getHrEmployeeRecord } from "../src/server.ts";

let repositoryPath = "";
let lifecycleRepositoryPath = "";

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
    `afenda-employee-records-integration-${randomUUID()}.json`
  );
  lifecycleRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-lifecycle-integration-${randomUUID()}.json`
  );
  setHrEmployeeRecordsRepositoryPathForTesting(repositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
  setEmployeeLifecycleRepositoryPathForTesting(lifecycleRepositoryPath);
  resetEmployeeLifecycleRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(repositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository test artifacts.
  }

  try {
    rmSync(lifecycleRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository test artifacts.
  }
});

test("exports stable downstream integration contracts", () => {
  assert.equal(hrRecordsFeatureScope.feature, "employee-records-management");
  assert.equal(
    hrRecordsFeatureManifestSchema.parse(hrRecordsFeatureManifest).id,
    hrRecordsFeatureMetadata.id
  );
  assert.equal(hrRecordsRouteContract.routes.detail, "/hr/records/:employeeId");
  assert.equal(hrRecordsRouteContract.version, "v1");
  assert.equal(hrRecordsRoutePaths.records, "/hr/records");
  assert.equal(
    hrRecordsActionRegistry.update.capabilities.includes("hr.employees.write"),
    true
  );
  assert.equal(hrRecordsActionRegistry.update.risk, "sensitive");
  assert.equal(
    hrRecordsActionRegistry.archive.integrationEvent,
    hrRecordsIntegrationEvents.employeeIntegrationChanged
  );
});

test("builds downstream-safe integration snapshots and versioned change events", async () => {
  const manager = await createHrEmployeeRecord(
    {
      employeeNumber: "M700",
      legalName: "Integration Manager",
      currentDepartmentId: "dept-m",
      currentPositionId: "pos-m",
      workLocationCode: "HQ-1",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(manager.ok, true);

  const worker = await createHrEmployeeRecord(
    {
      employeeNumber: "E700",
      legalName: "Integration Worker",
      email: "worker@example.com",
      employmentStartDate: new Date("2026-01-02T00:00:00.000Z"),
      employmentType: "full-time",
      workerCategory: "employee",
      grade: "G8",
      level: "L3",
      legalEntityCode: "ENTITY-7",
      workLocationCode: "HQ-1",
      countryCode: "TH",
      contractStartDate: new Date("2026-01-01T00:00:00.000Z"),
      contractEndDate: new Date("2026-12-31T00:00:00.000Z"),
      currentDepartmentId: "dept-7",
      currentPositionId: "pos-7",
      managerEmployeeId: requireTargetId(manager),
      personalEmail: "worker.private@example.com",
      identityNumber: "ID-700",
      dateOfBirth: new Date("1992-02-02T00:00:00.000Z"),
      phoneNumber: "+66800000000",
      residentialAddress: "1 Integration Way",
      mailingAddress: "1 Integration Way",
      emergencyContactPhoneNumber: "+66900000000",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(worker.ok, true);
  const workerId = requireTargetId(worker);
  const record = getHrEmployeeRecord(workerId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(record);

  const snapshot = buildHrEmployeeIntegrationSnapshot(record, {
    organizationId: "org-1",
  });
  const sensitiveSnapshot = buildHrEmployeeIntegrationSnapshot(record, {
    canViewSensitive: true,
    organizationId: "org-1",
  });
  const changeEvent = buildHrEmployeeIntegrationChangeEvent(record, {
    organizationId: "org-1",
  });

  assert.equal(snapshot.reference.employeeId, workerId);
  assert.equal(snapshot.documentReferenceCoverage.status, "not-owned");
  assert.equal(snapshot.sensitive, undefined);
  assert.equal("email" in snapshot, false);
  assert.equal(sensitiveSnapshot.sensitive?.email, "worker@example.com");
  assert.equal(sensitiveSnapshot.sensitive?.identityNumber, "ID-700");
  assert.equal(changeEvent.eventVersion, 1);
  assert.equal(
    changeEvent.eventName,
    hrRecordsIntegrationEvents.employeeIntegrationChanged
  );
  assert.equal(
    changeEvent.snapshot.reference.displayName,
    "Integration Worker"
  );
  assert.equal(
    getEmployeeLifecycleOnboardingStatus(workerId, {
      companyId: "org-1",
    })?.workflowStatus,
    "in_progress"
  );

  assert.doesNotThrow(() =>
    upsertComplianceWorkerProfileInputSchema.parse({
      companyId: "org-1",
      employeeId: snapshot.reference.employeeId,
      employeeNumber: snapshot.reference.employeeNumber,
      displayName: snapshot.reference.displayName,
      legalEntityCode: snapshot.employment.legalEntityCode ?? undefined,
      countryCode: snapshot.employment.countryCode ?? undefined,
      workLocationCode: snapshot.assignment.workLocationCode ?? undefined,
      employmentType: snapshot.employment.employmentType ?? undefined,
      workerCategory: snapshot.employment.workerCategory ?? undefined,
      departmentId: snapshot.assignment.departmentId ?? undefined,
      hireDate: snapshot.employment.employmentStartDate
        ? new Date(snapshot.employment.employmentStartDate)
        : undefined,
      terminationDate: snapshot.employment.contractEndDate
        ? new Date(snapshot.employment.contractEndDate)
        : undefined,
      active: snapshot.reference.employmentStatus === "active",
    })
  );
  assert.doesNotThrow(() =>
    hrRecordsIntegrationEventSchema.parse(changeEvent.eventName)
  );
});
