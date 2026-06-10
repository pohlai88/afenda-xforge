import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  adjustLamLeaveBalance,
  upsertLamLeaveEncashmentPolicy,
  upsertLamLeaveType,
  type LamMutationContext,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as processLeaveEncashmentRoute } from "../app/api/hr/leave/leave-encashment-requests/route.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";
let policyId = "";

const writeContext: LamMutationContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [
    permissionCatalog.hrLam.encashmentWrite,
    permissionCatalog.hrLam.leaveTypesWrite,
    permissionCatalog.hrLam.leaveBalancesWrite,
  ],
};

const encashmentWriteHeaders = {
  "content-type": "application/json",
  "x-actor-id": "hr-admin",
  "x-can-write-lam": "true",
  "x-company-id": "company-001",
  "x-lam-capabilities": permissionCatalog.hrLam.encashmentWrite,
  "x-tenant-id": "tenant-001",
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-leave-encashment-requests-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      code: "AL",
      companyId: "company-001",
      kind: "annual",
      name: "Annual Leave",
      paid: true,
    },
    writeContext
  );
  assert.equal(leaveType.ok, true);
  leaveTypeId = leaveType.targetId;

  const policy = await upsertLamLeaveEncashmentPolicy(
    {
      code: "ENC-STD",
      companyId: "company-001",
      effectiveFrom: new Date("2026-01-01"),
      encashmentRatePercent: 100,
      leaveTypeId,
      maxEncashableDays: 5,
      minRemainingBalanceDays: 1,
      title: "Standard encashment",
    },
    writeContext
  );
  assert.equal(policy.ok, true);
  policyId = policy.targetId;

  const balance = await adjustLamLeaveBalance(
    {
      adjustmentDays: 10,
      authorizedBy: "hr-admin",
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId,
      periodYear: 2026,
      reason: "Seed balance",
    },
    writeContext
  );
  assert.equal(balance.ok, true);
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("leave encashment requests POST processes encashment through HTTP boundary", async () => {
  const response = await processLeaveEncashmentRoute(
    new Request("http://localhost/api/hr/leave/leave-encashment-requests", {
      body: JSON.stringify({
        authorizedBy: "hr-manager",
        companyId: "company-001",
        employeeId: "emp-001",
        encashmentDays: 2,
        leaveTypeId,
        payPeriodEnd: "2026-06-30T00:00:00.000Z",
        payPeriodStart: "2026-06-01T00:00:00.000Z",
        periodYear: 2026,
        policyId,
        reason: "Mid-year encashment",
      }),
      headers: encashmentWriteHeaders,
      method: "POST",
    })
  );

  assert.equal(response.status, 201);
  const payload = (await response.json()) as { ok: boolean; targetId?: string };
  assert.equal(payload.ok, true);
  assert.ok(payload.targetId);
});

test("leave encashment requests POST denies without encashment write capability", async () => {
  const response = await processLeaveEncashmentRoute(
    new Request("http://localhost/api/hr/leave/leave-encashment-requests", {
      body: JSON.stringify({
        authorizedBy: "hr-manager",
        employeeId: "emp-001",
        encashmentDays: 2,
        leaveTypeId,
        payPeriodEnd: "2026-06-30T00:00:00.000Z",
        payPeriodStart: "2026-06-01T00:00:00.000Z",
        periodYear: 2026,
        policyId,
        reason: "Should fail",
      }),
      headers: {
        "content-type": "application/json",
        "x-can-write-lam": "false",
        "x-company-id": "company-001",
        "x-lam-capabilities": permissionCatalog.hrLam.leaveApplicationsRead,
        "x-tenant-id": "tenant-001",
      },
      method: "POST",
    })
  );

  assert.equal(response.status, 403);
  const payload = (await response.json()) as { ok: boolean; error?: string };
  assert.equal(payload.ok, false);
});

test("leave encashment requests POST returns 400 for invalid JSON body", async () => {
  const response = await processLeaveEncashmentRoute(
    new Request("http://localhost/api/hr/leave/leave-encashment-requests", {
      body: "{",
      headers: encashmentWriteHeaders,
      method: "POST",
    })
  );

  assert.equal(response.status, 400);
});
