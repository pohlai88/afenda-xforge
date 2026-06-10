import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  adjustLamLeaveBalance,
  applyLamLeaveEntitlementCalculation,
  listLamLeaveBalancesRecords,
  upsertLamLeaveCarryForwardRule,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as carryForwardRoute } from "../app/api/hr/leave/leave-balances/carry-forward/route.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: ["hr.lam.leave-balances.read"],
};

const employeeProfile = {
  companyId: "company-001",
  employeeId: "emp-001",
  hireDate: new Date("2020-01-15"),
  countryCode: "MY",
  legalEntityCode: "MY-ENTITY",
  workLocationCode: "KL",
  employmentType: "permanent",
  grade: "G5",
  departmentId: "dept-sales",
} as const;

const balanceWriteHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-actor-id": "hr-admin",
  "x-lam-capabilities": "hr.lam.leave-balances.write",
};

const deniedHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-carry-forward-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
    },
    writeContext
  );
  assert.equal(leaveType.ok, true);
  if (!leaveType.ok) {
    throw new Error("Failed to seed leave type");
  }
  leaveTypeId = leaveType.targetId;

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY",
      title: "Annual Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-MY-G5",
      title: "Carry Forward MY G5",
      scope: { countryCode: "MY", grade: "G5" },
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
    },
    writeContext
  );

  await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2025,
      adjustmentDays: -8,
      reason: "Simulate used leave",
      authorizedBy: "hr-admin",
    },
    writeContext
  );
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-016 carry-forward route persists policy-driven carry and forfeit through HTTP boundary", async () => {
  const response = await carryForwardRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/carry-forward", {
      method: "POST",
      headers: balanceWriteHeaders,
      body: JSON.stringify({
        ...employeeProfile,
        leaveTypeId,
        sourcePeriodYear: 2025,
        targetPeriodYear: 2026,
        asOfDate: "2026-01-01",
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    result: { carryForwardDays: number; forfeitDays: number };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.result.carryForwardDays, 5);
  assert.equal(payload.result.forfeitDays, 5);

  const sourceBalances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2025,
    },
    readContext
  );
  assert.equal(sourceBalances[0]?.forfeited, 5);
  assert.equal(sourceBalances[0]?.adjusted, -13);
  assert.equal(sourceBalances[0]?.remaining, 0);

  const targetBalances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(targetBalances[0]?.carriedForward, 5);
  assert.equal(targetBalances[0]?.remaining, 5);
});

test("AC-016 carry-forward route denies without balance write authorization", async () => {
  const response = await carryForwardRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/carry-forward", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        ...employeeProfile,
        leaveTypeId,
        sourcePeriodYear: 2025,
        targetPeriodYear: 2026,
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Leave balance write access denied/i);
});

test("AC-016 carry-forward route rejects invalid employeeId through HTTP boundary", async () => {
  const response = await carryForwardRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/carry-forward", {
      method: "POST",
      headers: balanceWriteHeaders,
      body: JSON.stringify({
        ...employeeProfile,
        employeeId: "",
        leaveTypeId,
        sourcePeriodYear: 2025,
        targetPeriodYear: 2026,
      }),
    })
  );
  assert.equal(response.status, 422);
});

test("carry-forward route returns 400 for invalid JSON body", async () => {
  const response = await carryForwardRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/carry-forward", {
      method: "POST",
      headers: balanceWriteHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});
