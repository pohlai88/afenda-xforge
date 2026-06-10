import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyLamLeaveEntitlementCalculation,
  approveLamLeaveApplication,
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
import { POST as amendLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/[applicationId]/amend/route.ts";
import { POST as cancelLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/[applicationId]/cancel/route.ts";

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

const writeHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-lam-capabilities": "hr.lam.leave-applications.write",
};

const approvalHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-lam-actor-employee-id": "mgr-001",
  "x-lam-resolved-step-approver-employee-ids": "mgr-001",
  "x-lam-team-employee-ids": "emp-001",
  "x-lam-capabilities": "hr.lam.leave-applications.approve",
};

const seedSingleStepRoute = async (): Promise<void> => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-API-LIFECYCLE",
      title: "API Lifecycle Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );
};

const submitApplication = async (): Promise<string> => {
  await seedSingleStepRoute();
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
  return submit.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-cancel-amend-${randomUUID()}.json`
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

const readBalance = async () => {
  const balances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(balances.length, 1);
  return balances[0];
};

test("AC-014 cancel route releases pending balance through HTTP boundary", async () => {
  const applicationId = await submitApplication();

  const response = await cancelLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${applicationId}/cancel`,
      {
        method: "POST",
        headers: writeHeaders,
        body: JSON.stringify({
          cancellationReason: "Travel plans changed",
        }),
      }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 200);

  const balance = await readBalance();
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 18);
});

test("AC-014 cancel route reverses used balance for approved application", async () => {
  const applicationId = await submitApplication();

  const approved = await approveLamLeaveApplication(
    { applicationId, approvedBy: "mgr-001" },
    {
      actorId: "mgr-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      grantedCapabilities: ["hr.lam.leave-applications.approve"],
      actorEmployeeId: "mgr-001",
      resolvedStepApproverEmployeeIds: ["mgr-001"],
      teamEmployeeIds: ["emp-001"],
    }
  );
  assert.equal(approved.ok, true);

  const response = await cancelLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${applicationId}/cancel`,
      {
        method: "POST",
        headers: approvalHeaders,
        body: JSON.stringify({
          cancellationReason: "Project rescheduled",
        }),
      }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 200);

  const balance = await readBalance();
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 18);
});

test("AC-014 amend route adjusts used balance through HTTP boundary", async () => {
  const applicationId = await submitApplication();

  const approved = await approveLamLeaveApplication(
    { applicationId, approvedBy: "mgr-001" },
    {
      actorId: "mgr-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      grantedCapabilities: ["hr.lam.leave-applications.approve"],
      actorEmployeeId: "mgr-001",
      resolvedStepApproverEmployeeIds: ["mgr-001"],
      teamEmployeeIds: ["emp-001"],
    }
  );
  assert.equal(approved.ok, true);

  const response = await amendLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${applicationId}/amend`,
      {
        method: "POST",
        headers: approvalHeaders,
        body: JSON.stringify({
          startDate: "2026-07-01",
          endDate: "2026-07-04",
          totalDays: 4,
          amendmentReason: "Extended stay",
          hireDate: employeeProfile.hireDate.toISOString(),
          countryCode: employeeProfile.countryCode,
          grade: employeeProfile.grade,
          departmentId: employeeProfile.departmentId,
        }),
      }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 200);

  const balance = await readBalance();
  assert.equal(balance?.used, 4);
  assert.equal(balance?.remaining, 14);
});

test("cancel and amend routes return 400 for invalid JSON body", async () => {
  const cancelResponse = await cancelLeaveApplicationRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications/app-001/cancel",
      {
        method: "POST",
        headers: writeHeaders,
        body: "{",
      }
    ),
    { params: Promise.resolve({ applicationId: "app-001" }) }
  );
  assert.equal(cancelResponse.status, 400);

  const amendResponse = await amendLeaveApplicationRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications/app-001/amend",
      {
        method: "POST",
        headers: approvalHeaders,
        body: "{",
      }
    ),
    { params: Promise.resolve({ applicationId: "app-001" }) }
  );
  assert.equal(amendResponse.status, 400);
});
