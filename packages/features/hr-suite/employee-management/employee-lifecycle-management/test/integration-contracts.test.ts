import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  buildEmployeeLifecycleComplianceWorkerStatus,
  buildEmployeeLifecycleIamRevocationTrigger,
  buildEmployeeLifecycleIntegrationChangeEvent,
  buildEmployeeLifecycleIntegrationSnapshot,
  buildEmployeeLifecycleLeaveAttendanceClearance,
  buildEmployeeLifecyclePayrollSettlementReadiness,
  buildEmployeeLifecycleTaskAttentionSnapshot,
  createEmployeeLifecycleState,
  employeeLifecycleIntegrationChangeEventSchema,
  employeeLifecycleIntegrationEvents,
  employeeLifecycleIntegrationSnapshotSchema,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleOnboarding,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

test("builds stable integration snapshots and downstream-safe contracts", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-integration-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(
    createEmployeeLifecycleState({
      employeeId: "emp-int",
      companyId: "co-int",
      tenantId: "tenant-int",
      initialStage: "preboarding",
      effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
      recordedAt: new Date("2026-06-01T00:00:00.000Z"),
    })
  );

  startEmployeeLifecycleOnboarding(
    {
      profile: {
        employeeId: "emp-int",
        companyId: "co-int",
        tenantId: "tenant-int",
        employmentType: "full-time",
        legalEntityCode: "LE-INT",
        departmentId: "ENG",
        workLocationCode: "BKK",
        roleTitle: "Engineer",
      },
      startedAt: new Date("2026-06-02T00:00:00.000Z"),
      recordedAt: new Date("2026-06-02T00:00:00.000Z"),
      actorId: "hr-admin",
    },
    {
      companyId: "co-int",
      tenantId: "tenant-int",
    }
  );

  const snapshot = buildEmployeeLifecycleIntegrationSnapshot(
    "emp-int",
    {
      companyId: "co-int",
      tenantId: "tenant-int",
    },
    {
      canRead: true,
      canViewSensitive: false,
      companyId: "co-int",
      tenantId: "tenant-int",
    }
  );
  const taskAttention = buildEmployeeLifecycleTaskAttentionSnapshot(
    "emp-int",
    {
      companyId: "co-int",
      tenantId: "tenant-int",
    },
    {
      canRead: true,
      companyId: "co-int",
      tenantId: "tenant-int",
    }
  );
  const changeEvent = buildEmployeeLifecycleIntegrationChangeEvent(
    "emp-int",
    {
      companyId: "co-int",
      tenantId: "tenant-int",
    },
    {
      canRead: true,
      companyId: "co-int",
      tenantId: "tenant-int",
    }
  );

  assert.ok(snapshot);
  assert.ok(taskAttention);
  assert.ok(changeEvent);
  assert.equal(snapshot?.snapshotVersion, 1);
  assert.equal(changeEvent?.eventName, employeeLifecycleIntegrationEvents.changed);
  assert.equal(changeEvent?.eventVersion, 1);
  assert.doesNotThrow(() => employeeLifecycleIntegrationSnapshotSchema.parse(snapshot));
  assert.doesNotThrow(() =>
    employeeLifecycleIntegrationChangeEventSchema.parse(changeEvent)
  );

  assert.doesNotThrow(() =>
    buildEmployeeLifecyclePayrollSettlementReadiness("emp-int", {
      companyId: "co-int",
      tenantId: "tenant-int",
    })
  );
  assert.doesNotThrow(() =>
    buildEmployeeLifecycleLeaveAttendanceClearance("emp-int", {
      companyId: "co-int",
      tenantId: "tenant-int",
    })
  );
  assert.doesNotThrow(() =>
    buildEmployeeLifecycleIamRevocationTrigger("emp-int", {
      companyId: "co-int",
      tenantId: "tenant-int",
    })
  );
  assert.doesNotThrow(() =>
    buildEmployeeLifecycleComplianceWorkerStatus("emp-int", {
      companyId: "co-int",
      tenantId: "tenant-int",
    })
  );
});
