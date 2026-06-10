import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as calculateEntitlementRoute } from "../app/api/hr/leave/leave-entitlements/calculate/route.ts";
import { POST as upsertLeaveTypeRoute } from "../app/api/hr/leave/leave-types/route.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

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

const readHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
  "x-lam-capabilities": "hr.lam.leave-entitlements.read",
} as const;

const scopedEmployeeHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
  "x-lam-scoped-employee-id": "emp-001",
  "x-lam-capabilities": "hr.lam.leave-entitlements.read",
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-entitlement-calc-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      paid: true,
      requiresDocument: false,
      active: true,
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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

const calculateBody = (employeeId: string) => ({
  companyId: "company-001",
  employeeId,
  hireDate: employeeProfile.hireDate.toISOString(),
  countryCode: employeeProfile.countryCode,
  legalEntityCode: employeeProfile.legalEntityCode,
  workLocationCode: employeeProfile.workLocationCode,
  employmentType: employeeProfile.employmentType,
  grade: employeeProfile.grade,
  departmentId: employeeProfile.departmentId,
  leaveTypeId,
  asOfDate: "2026-06-01",
  periodYear: 2026,
});

test("AC-023 entitlement calculate route returns 403 without read access", async () => {
  const response = await calculateEntitlementRoute(
    new Request("http://localhost/api/hr/leave/leave-entitlements/calculate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-company-id": "company-001",
        "x-tenant-id": "tenant-001",
      },
      body: JSON.stringify(calculateBody("emp-001")),
    })
  );
  assert.equal(response.status, 403);
});

test("AC-023 entitlement calculate route returns projection for authorized reader", async () => {
  const response = await calculateEntitlementRoute(
    new Request("http://localhost/api/hr/leave/leave-entitlements/calculate", {
      method: "POST",
      headers: readHeaders,
      body: JSON.stringify(calculateBody("emp-001")),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as Array<{ matched: boolean }>;
  assert.equal(payload.length, 1);
  assert.equal(payload[0]?.matched, true);
});

test("AC-023 scoped employee calculate route returns empty for another employeeId", async () => {
  const response = await calculateEntitlementRoute(
    new Request("http://localhost/api/hr/leave/leave-entitlements/calculate", {
      method: "POST",
      headers: scopedEmployeeHeaders,
      body: JSON.stringify(calculateBody("emp-002")),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as unknown[];
  assert.deepEqual(payload, []);
});

test("AC-023 leave-types route returns 400 for invalid JSON body", async () => {
  const response = await upsertLeaveTypeRoute(
    new Request("http://localhost/api/hr/leave/leave-types", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-company-id": "company-001",
        "x-tenant-id": "tenant-001",
        "x-can-write-lam": "true",
      },
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});
