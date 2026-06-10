import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyLamLeaveEntitlementCalculation,
  getLamLeaveApplicationById,
  upsertLamLeaveApprovalRoute,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as submitCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/route.ts";
import { POST as approveCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/[correctionId]/approve/route.ts";
import { POST as upsertAttendanceRecordRoute } from "../app/api/hr/attendance/attendance-records/route.ts";
import { POST as approveLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/[applicationId]/approve/route.ts";
import { POST as overdueNotificationsRoute } from "../app/api/hr/leave/leave-applications/overdue-notifications/route.ts";
import { POST as submitLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/route.ts";

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

const baseHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
} as const;

const notificationHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "true",
  "x-actor-id": "emp-001",
  "x-lam-employee-user-id": "user-emp-001",
  "x-lam-approver-user-ids": "user-mgr-001",
} as const;

const approvalHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-read-lam": "true",
  "x-can-write-lam": "true",
  "x-lam-actor-employee-id": "mgr-001",
  "x-lam-resolved-step-approver-employee-ids": "mgr-001",
  "x-lam-team-employee-ids": "emp-001",
  "x-lam-capabilities": "hr.lam.leave-applications.approve",
  "x-lam-employee-user-id": "user-emp-001",
} as const;

const correctionWriteHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "false",
  "x-actor-id": "emp-001",
  "x-lam-scoped-employee-id": "emp-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.write",
  "x-lam-approver-user-ids": "user-mgr-001",
};

const correctionApproveHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "false",
  "x-actor-id": "mgr-001",
  "x-lam-actor-employee-id": "mgr-001",
  "x-lam-resolved-step-approver-employee-ids": "mgr-001",
  "x-lam-team-employee-ids": "emp-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.write",
  "x-lam-employee-user-id": "user-emp-001",
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-notifications-${randomUUID()}.json`
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
      code: "AL-NOTIFY-HTTP",
      title: "Notification HTTP Route",
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

const submitLeaveApplication = async (): Promise<string> => {
  const response = await submitLeaveApplicationRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      method: "POST",
      headers: notificationHeaders,
      body: JSON.stringify({
        ...employeeProfile,
        leaveTypeId,
        startDate: "2026-07-01",
        endDate: "2026-07-03",
        totalDays: 3,
        reason: "Notification HTTP test",
      }),
    })
  );
  assert.equal(response.status, 201);
  const payload = (await response.json()) as { ok: boolean; targetId: string };
  assert.equal(payload.ok, true);
  return payload.targetId;
};

test("AC-028 leave submit route succeeds with notification recipient headers", async () => {
  const applicationId = await submitLeaveApplication();
  assert.ok(applicationId.length > 0);
});

test("AC-028 leave approve route succeeds with employee notification header", async () => {
  const applicationId = await submitLeaveApplication();

  const response = await approveLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${applicationId}/approve`,
      {
        method: "POST",
        headers: approvalHeaders,
        body: JSON.stringify({ approvedBy: "mgr-001" }),
      }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as { ok: boolean };
  assert.equal(payload.ok, true);

  const application = await getLamLeaveApplicationById(applicationId, {
    companyId: "company-001",
    canRead: true,
    grantedCapabilities: ["hr.lam.leave-applications.read"],
  });
  assert.equal(application?.status, "approved");
});

test("AC-028 overdue-notifications route returns empty batch when queue is clear", async () => {
  const response = await overdueNotificationsRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications/overdue-notifications",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...baseHeaders,
          "x-can-write-lam": "true",
          "x-lam-actor-employee-id": "mgr-001",
          "x-lam-team-employee-ids": "emp-001",
          "x-lam-capabilities": "hr.lam.leave-applications.approve",
        },
        body: JSON.stringify({ companyId: "company-001" }),
      }
    )
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    intentCount: number;
    dispatchedCount: number;
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.intentCount, 0);
  assert.equal(payload.dispatchedCount, 0);
});

test("AC-028 overdue-notifications route returns 400 for invalid JSON body", async () => {
  const response = await overdueNotificationsRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications/overdue-notifications",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...baseHeaders,
        },
        body: "{",
      }
    )
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});

test("AC-028 attendance correction submit and approve routes succeed with notification headers", async () => {
  const recordResponse = await upsertAttendanceRecordRoute(
    new Request("http://localhost/api/hr/attendance/attendance-records", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "true",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceDate: "2026-06-10",
        status: "late",
        clockInAt: "2026-06-10T09:30:00.000Z",
        clockOutAt: "2026-06-10T18:00:00.000Z",
      }),
    })
  );
  assert.equal(recordResponse.status, 201);
  const recordPayload = (await recordResponse.json()) as {
    ok: boolean;
    targetId: string;
  };
  assert.equal(recordPayload.ok, true);

  const submitResponse = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: correctionWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceRecordId: recordPayload.targetId,
        exceptionType: "late_arrival",
        requestedStatus: "present",
        requestedClockInAt: "2026-06-10T09:00:00.000Z",
        requestedClockOutAt: "2026-06-10T18:00:00.000Z",
        reason: "Notification correction test",
      }),
    })
  );
  assert.equal(submitResponse.status, 201);
  const submitPayload = (await submitResponse.json()) as {
    ok: boolean;
    targetId: string;
  };
  assert.equal(submitPayload.ok, true);

  const approveResponse = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${submitPayload.targetId}/approve`,
      {
        method: "POST",
        headers: correctionApproveHeaders,
        body: JSON.stringify({ approvedBy: "mgr-001" }),
      }
    ),
    { params: Promise.resolve({ correctionId: submitPayload.targetId }) }
  );
  assert.equal(approveResponse.status, 200);
  const approvePayload = (await approveResponse.json()) as { ok: boolean };
  assert.equal(approvePayload.ok, true);
});
