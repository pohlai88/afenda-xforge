import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyLamLeaveEntitlementCalculation,
  listLamLeaveBalancesRecords,
  submitLamLeaveApplication,
  upsertLamLeaveApprovalRoute,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as approveLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/[applicationId]/approve/route.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "emp-001",
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

const approvalHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
  "x-can-write-lam": "true",
  "x-lam-actor-employee-id": "mgr-001",
  "x-lam-resolved-step-approver-employee-ids": "mgr-001",
  "x-lam-capabilities": "hr.lam.leave-applications.approve",
} as const;

const buildApproveRequest = (
  applicationId: string,
  body: Record<string, unknown> = { approvedBy: "mgr-001" }
): Request =>
  new Request(
    `http://localhost/api/hr/leave/leave-applications/${applicationId}/approve`,
    {
      method: "POST",
      headers: approvalHeaders,
      body: JSON.stringify(body),
    }
  );

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-approve-${randomUUID()}.json`
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

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-API-APPROVE",
      title: "API Approve Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
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

test("AC-013 approve route finalizes leave balance through HTTP boundary", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const response = await approveLeaveApplicationRoute(
    buildApproveRequest(submit.targetId),
    { params: Promise.resolve({ applicationId: submit.targetId }) }
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as { ok: boolean; targetId: string };
  assert.equal(payload.ok, true);
  assert.equal(payload.targetId, submit.targetId);

  const balances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.pending, 0);
  assert.equal(balances[0]?.used, 3);
  assert.equal(balances[0]?.remaining, 15);
});

test("approve route returns 400 for invalid JSON body", async () => {
  const response = await approveLeaveApplicationRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications/app-001/approve",
      {
        method: "POST",
        headers: approvalHeaders,
        body: "{",
      }
    ),
    { params: Promise.resolve({ applicationId: "app-001" }) }
  );

  assert.equal(response.status, 400);
  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});
