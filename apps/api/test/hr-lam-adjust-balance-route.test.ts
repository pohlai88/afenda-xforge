import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyLamLeaveEntitlementCalculation,
  listLamLeaveBalancesRecords,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as adjustLeaveBalanceRoute } from "../app/api/hr/leave/leave-balances/adjust/route.ts";

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
    `api-lam-adjust-balance-${randomUUID()}.json`
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

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
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

test("AC-015 adjust route persists manual balance adjustment through HTTP boundary", async () => {
  const response = await adjustLeaveBalanceRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/adjust", {
      method: "POST",
      headers: balanceWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: employeeProfile.employeeId,
        leaveTypeId,
        periodYear: 2026,
        adjustmentDays: 2,
        reason: "Payroll reconciliation correction",
        authorizedBy: "hr-director",
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as { ok: boolean; targetId: string };
  assert.equal(payload.ok, true);

  const balances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.adjusted, 2);
  assert.equal(balances[0]?.remaining, 20);
});

test("AC-015 adjust route denies without balance write authorization", async () => {
  const response = await adjustLeaveBalanceRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/adjust", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: employeeProfile.employeeId,
        leaveTypeId,
        periodYear: 2026,
        adjustmentDays: 1,
        reason: "Unauthorized",
        authorizedBy: "unknown",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Leave balance write access denied/i);
});

test("AC-015 adjust route rejects missing reason through HTTP boundary", async () => {
  const response = await adjustLeaveBalanceRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/adjust", {
      method: "POST",
      headers: balanceWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: employeeProfile.employeeId,
        leaveTypeId,
        periodYear: 2026,
        adjustmentDays: 1,
        reason: "   ",
        authorizedBy: "hr-director",
      }),
    })
  );
  assert.equal(response.status, 422);
});

test("adjust route returns 400 for invalid JSON body", async () => {
  const response = await adjustLeaveBalanceRoute(
    new Request("http://localhost/api/hr/leave/leave-balances/adjust", {
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
