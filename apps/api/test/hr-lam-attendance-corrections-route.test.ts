import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import type { LamPolicyCapability } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  getLamAttendanceRecordById,
  upsertLamAttendanceRecord,
  upsertLamLeaveApprovalRoute,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as upsertAttendanceSettingsRoute } from "../app/api/hr/attendance/attendance-settings/route.ts";
import { POST as approveCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/[correctionId]/approve/route.ts";
import { POST as rejectCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/[correctionId]/reject/route.ts";
import { GET as getCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/[correctionId]/route.ts";
import { POST as submitCorrectionRoute } from "../app/api/hr/attendance/attendance-corrections/route.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const correctionWriteHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
  "x-actor-id": "emp-001",
  "x-lam-scoped-employee-id": "emp-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.write",
};

const correctionReadHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "false",
  "x-lam-scoped-employee-id": "emp-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.read",
};

const correctionApproveHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
  "x-actor-id": "mgr-001",
  "x-lam-actor-employee-id": "mgr-001",
  "x-lam-resolved-step-approver-employee-ids": "mgr-001",
  "x-lam-team-employee-ids": "emp-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.write",
};

const hrCorrectionApproveHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
  "x-actor-id": "hr-001",
  "x-lam-actor-employee-id": "hr-001",
  "x-lam-resolved-step-approver-employee-ids": "hr-001",
  "x-lam-capabilities": "hr.lam.attendance-corrections.write",
};

const adminWriteHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-actor-id": "hr-admin",
} as const;

const deniedHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
};

const seedLateRecord = async (): Promise<string> => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "late",
      clockInAt: new Date("2026-06-10T09:30:00.000Z"),
      clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    },
    writeContext
  );
  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Failed to seed late attendance record");
  }
  return result.targetId;
};

const submitCorrectionThroughHttp = async (
  attendanceRecordId: string,
  extraBody: Record<string, unknown> = {}
): Promise<string> => {
  const response = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: correctionWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceRecordId,
        exceptionType: "late_arrival",
        requestedStatus: "present",
        requestedClockInAt: "2026-06-10T09:05:00.000Z",
        requestedClockOutAt: "2026-06-10T18:00:00.000Z",
        reason: "Supervisor verified on-time arrival",
        ...extraBody,
      }),
    })
  );
  assert.equal(response.status, 201);

  const payload = (await response.json()) as { ok: boolean; targetId: string };
  assert.equal(payload.ok, true);
  return payload.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-attendance-corrections-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-019 correction submit route persists request through HTTP boundary", async () => {
  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId);

  const response = await getCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}`,
      { headers: correctionReadHeaders }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(response.status, 200);

  const correction = (await response.json()) as {
    status: string;
    exceptionType: string;
  };
  assert.equal(correction.status, "submitted");
  assert.equal(correction.exceptionType, "late_arrival");
});

test("AC-019 correction approve route applies attendance update through HTTP boundary", async () => {
  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId);

  const response = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/approve`,
      {
        method: "POST",
        headers: correctionApproveHeaders,
        body: JSON.stringify({
          companyId: "company-001",
          approvedBy: "mgr-001",
        }),
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as { ok: boolean };
  assert.equal(payload.ok, true);

  const record = await getLamAttendanceRecordById(recordId, {
    companyId: "company-001",
    tenantId: "tenant-001",
    grantedCapabilities: ["hr.lam.attendance.read"] as LamPolicyCapability[],
    canRead: true,
  });
  assert.equal(record?.status, "present");
});

test("AC-019 correction submit route denies without correction write capability", async () => {
  const recordId = await seedLateRecord();

  const response = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceRecordId: recordId,
        exceptionType: "late_arrival",
        requestedStatus: "present",
        reason: "Unauthorized submit",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Attendance correction write access denied/i);
});

test("AC-019 correction reject route stores rejection reason without changing attendance record", async () => {
  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId);

  const response = await rejectCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/reject`,
      {
        method: "POST",
        headers: correctionApproveHeaders,
        body: JSON.stringify({
          companyId: "company-001",
          rejectedBy: "mgr-001",
          rejectionReason: "Insufficient evidence",
        }),
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as { ok: boolean };
  assert.equal(payload.ok, true);

  const detailResponse = await getCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}`,
      { headers: correctionReadHeaders }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(detailResponse.status, 200);

  const correction = (await detailResponse.json()) as {
    status: string;
    rejectionReason: string;
  };
  assert.equal(correction.status, "rejected");
  assert.equal(correction.rejectionReason, "Insufficient evidence");

  const record = await getLamAttendanceRecordById(recordId, {
    companyId: "company-001",
    tenantId: "tenant-001",
    grantedCapabilities: [
      "hr.lam.attendance.read",
    ] as LamPolicyCapability[],
    canRead: true,
  });
  assert.equal(record?.status, "late");
});

test("AC-019 correction approve route denies without correction write capability", async () => {
  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId);

  const response = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/approve`,
      {
        method: "POST",
        headers: deniedHeaders,
        body: JSON.stringify({
          companyId: "company-001",
          approvedBy: "mgr-001",
        }),
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(
    payload.error,
    /Approval access denied for attendance corrections/i
  );
});

test("correction submit route returns 400 for invalid JSON body", async () => {
  const response = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: correctionWriteHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});

test("correction approve route returns 400 for invalid JSON body", async () => {
  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId);

  const response = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/approve`,
      {
        method: "POST",
        headers: correctionApproveHeaders,
        body: "{",
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(response.status, 400);
});

test("AC-019 correction multi-step approve route applies attendance update after final step", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "ATT-CORR-HTTP",
      title: "Attendance Correction Route",
      scope: { grade: "G5" },
      steps: [
        { order: 1, kind: "direct_manager", label: "Manager" },
        { order: 2, kind: "hr_officer", label: "HR" },
      ],
      active: true,
    },
    writeContext
  );

  const recordId = await seedLateRecord();
  const correctionId = await submitCorrectionThroughHttp(recordId, {
    grade: "G5",
    requestedClockInAt: "2026-06-10T09:00:00.000Z",
  });

  const pendingResponse = await getCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}`,
      { headers: correctionReadHeaders }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(pendingResponse.status, 200);
  const pending = (await pendingResponse.json()) as {
    status: string;
    currentStepOrder: number;
  };
  assert.equal(pending.status, "pending_approval");
  assert.equal(pending.currentStepOrder, 1);

  const firstApprove = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/approve`,
      {
        method: "POST",
        headers: correctionApproveHeaders,
        body: JSON.stringify({
          companyId: "company-001",
          approvedBy: "mgr-001",
        }),
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(firstApprove.status, 200);

  const recordAfterFirstStep = await getLamAttendanceRecordById(recordId, {
    companyId: "company-001",
    tenantId: "tenant-001",
    grantedCapabilities: ["hr.lam.attendance.read"] as LamPolicyCapability[],
    canRead: true,
  });
  assert.equal(recordAfterFirstStep?.status, "late");

  const finalApprove = await approveCorrectionRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-corrections/${correctionId}/approve`,
      {
        method: "POST",
        headers: hrCorrectionApproveHeaders,
        body: JSON.stringify({
          companyId: "company-001",
          approvedBy: "hr-001",
        }),
      }
    ),
    { params: Promise.resolve({ correctionId }) }
  );
  assert.equal(finalApprove.status, 200);

  const record = await getLamAttendanceRecordById(recordId, {
    companyId: "company-001",
    tenantId: "tenant-001",
    grantedCapabilities: ["hr.lam.attendance.read"] as LamPolicyCapability[],
    canRead: true,
  });
  assert.equal(record?.status, "present");
  assert.equal(
    record?.clockInAt?.toISOString(),
    new Date("2026-06-10T09:00:00.000Z").toISOString()
  );
});

test("AC-019 correction submit route rejects when company corrections are disabled", async () => {
  const settingsResponse = await upsertAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      method: "POST",
      headers: adminWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        attendanceCorrectionsEnabled: false,
      }),
    })
  );
  assert.equal(settingsResponse.status, 200);

  const recordId = await seedLateRecord();
  const response = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: correctionWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceRecordId: recordId,
        exceptionType: "late_arrival",
        requestedStatus: "present",
        reason: "Should be blocked",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /disabled for this company/i);
});

test("AC-019 correction submit route rejects when orchestration header disables corrections", async () => {
  const recordId = await seedLateRecord();
  const response = await submitCorrectionRoute(
    new Request("http://localhost/api/hr/attendance/attendance-corrections", {
      method: "POST",
      headers: {
        ...correctionWriteHeaders,
        "x-lam-attendance-corrections-enabled": "false",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceRecordId: recordId,
        exceptionType: "late_arrival",
        requestedStatus: "present",
        reason: "Should be blocked by header",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /disabled for this company/i);
});
