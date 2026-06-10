import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import type { LamPolicyCapability } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  approveLamLeaveApplication,
  submitLamLeaveApplication,
  upsertLamAttendanceRecord,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { POST as upsertAttendanceRecordRoute } from "../app/api/hr/attendance/attendance-records/route.ts";
import { POST as exportAttendanceSummaryRoute } from "../app/api/hr/attendance/attendance-summary/export/route.ts";
import { GET as getAuditTrailEventRoute } from "../app/api/hr/leave/audit-trail/[auditEventId]/route.ts";
import { GET as listAuditTrailRoute } from "../app/api/hr/leave/audit-trail/route.ts";
import { POST as submitLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/route.ts";
import { POST as exportLeaveReportRoute } from "../app/api/hr/leave/leave-report/export/route.ts";
import { GET as listLeaveReportRoute } from "../app/api/hr/leave/leave-report/route.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";
let auditEventId = "";

const periodQuery = "periodStart=2026-06-01&periodEnd=2026-06-30";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const approveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  actorEmployeeId: "mgr-001",
  resolvedStepApproverEmployeeIds: ["mgr-001"],
  teamEmployeeIds: ["emp-001"],
  grantedCapabilities: [
    "hr.lam.leave-applications.approve",
  ] as LamPolicyCapability[],
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

const baseHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
} as const;

const auditorReadHeaders = {
  ...baseHeaders,
  "x-can-read-lam": "false",
  "x-lam-capabilities": "hr.lam.audit.read",
};

const reportsReadHeaders = {
  ...baseHeaders,
  "x-can-read-lam": "true",
  "x-lam-capabilities": "hr.lam.reports.read",
};

const seedAuditAndReportData = async (): Promise<void> => {
  const upsert = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-02"),
      status: "present",
    },
    writeContext
  );
  assert.equal(upsert.ok, true);

  const submitted = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-11"),
      totalDays: 2,
      reason: "Unpaid leave for report seed",
    },
    writeContext
  );
  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("Failed to seed leave application");
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submitted.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-unauthorized-access-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
  auditEventId = "";

  const unpaidType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "UNPAID",
      name: "Unpaid Leave",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    writeContext
  );
  assert.equal(unpaidType.ok, true);
  if (!unpaidType.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = unpaidType.targetId;

  await seedAuditAndReportData();

  const auditListResponse = await listAuditTrailRoute(
    new Request("http://localhost/api/hr/leave/audit-trail", {
      headers: auditorReadHeaders,
    })
  );
  assert.equal(auditListResponse.status, 200);
  const auditEvents = (await auditListResponse.json()) as Array<{ id: string }>;
  const firstAuditEventId = auditEvents[0]?.id;
  assert.ok(firstAuditEventId);
  auditEventId = firstAuditEventId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-023 audit trail list route returns events to auditor persona through HTTP boundary", async () => {
  const response = await listAuditTrailRoute(
    new Request("http://localhost/api/hr/leave/audit-trail", {
      headers: auditorReadHeaders,
    })
  );
  assert.equal(response.status, 200);

  const events = (await response.json()) as unknown[];
  assert.ok(events.length > 0);
});

test("AC-023 audit trail list route fails closed without audit read capability", async () => {
  const response = await listAuditTrailRoute(
    new Request("http://localhost/api/hr/leave/audit-trail", {
      headers: {
        ...baseHeaders,
        "x-can-read-lam": "true",
        "x-lam-capabilities": "hr.lam.attendance.read",
      },
    })
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("AC-023 audit trail list route fails closed when canWrite is granted without auditRead", async () => {
  const response = await listAuditTrailRoute(
    new Request("http://localhost/api/hr/leave/audit-trail", {
      headers: {
        ...baseHeaders,
        "x-can-write-lam": "true",
      },
    })
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("AC-023 audit trail detail route returns 404 without audit read capability", async () => {
  const response = await getAuditTrailEventRoute(
    new Request(`http://localhost/api/hr/leave/audit-trail/${auditEventId}`, {
      headers: {
        ...baseHeaders,
        "x-can-read-lam": "true",
      },
    }),
    { params: Promise.resolve({ auditEventId }) }
  );
  assert.equal(response.status, 404);
});

test("AC-023 audit trail detail route returns event to auditor through HTTP boundary", async () => {
  const response = await getAuditTrailEventRoute(
    new Request(`http://localhost/api/hr/leave/audit-trail/${auditEventId}`, {
      headers: auditorReadHeaders,
    }),
    { params: Promise.resolve({ auditEventId }) }
  );
  assert.equal(response.status, 200);

  const event = (await response.json()) as { id: string };
  assert.equal(event.id, auditEventId);
});

test("AC-023 leave report list route returns report entries to authorized reader through HTTP boundary", async () => {
  const response = await listLeaveReportRoute(
    new Request(`http://localhost/api/hr/leave/leave-report?${periodQuery}`, {
      headers: reportsReadHeaders,
    })
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as unknown[];
  assert.ok(entries.length > 0);
});

test("AC-023 leave report list route fails closed without reportsRead capability", async () => {
  const response = await listLeaveReportRoute(
    new Request(`http://localhost/api/hr/leave/leave-report?${periodQuery}`, {
      headers: {
        ...baseHeaders,
        "x-can-read-lam": "true",
        "x-lam-capabilities": "hr.lam.leave-applications.read",
      },
    })
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("AC-023 leave report export route denies without reportsExport capability", async () => {
  const response = await exportLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report/export", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "false",
        "x-lam-capabilities": "hr.lam.reports.read",
      },
      body: JSON.stringify({
        companyId: "company-001",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        exportedBy: "reports-001",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Reports export access denied/i);
});

test("AC-023 leave report export route denies with canWrite but no reportsExport capability", async () => {
  const response = await exportLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report/export", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "true",
        "x-actor-id": "hr-admin",
      },
      body: JSON.stringify({
        companyId: "company-001",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        exportedBy: "hr-admin",
      }),
    })
  );
  assert.equal(response.status, 403);
});

test("AC-023 attendance summary export route denies without reportsExport capability", async () => {
  const response = await exportAttendanceSummaryRoute(
    new Request(
      "http://localhost/api/hr/attendance/attendance-summary/export",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...baseHeaders,
          "x-can-write-lam": "false",
          "x-lam-capabilities": "hr.lam.reports.read",
        },
        body: JSON.stringify({
          companyId: "company-001",
          periodStart: "2026-06-01",
          periodEnd: "2026-06-30",
          exportedBy: "reports-001",
        }),
      }
    )
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Reports export access denied/i);
});

test("AC-023 employee submit route binds scoped employee and ignores tampered employeeId in body", async () => {
  const response = await submitLeaveApplicationRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "false",
        "x-lam-scoped-employee-id": "emp-001",
        "x-lam-capabilities":
          "hr.lam.leave-applications.write,hr.lam.leave-applications.read",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-002",
        leaveTypeId: unpaidLeaveTypeId,
        startDate: "2026-07-01",
        endDate: "2026-07-02",
        totalDays: 2,
        reason: "Cross-scope submit attempt",
      }),
    })
  );
  assert.equal(response.status, 201);

  const payload = (await response.json()) as {
    ok: boolean;
    application?: { employeeId: string };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.application?.employeeId, "emp-001");
});

test("AC-023 unauthorized caller cannot submit leave applications without write capability", async () => {
  const response = await submitLeaveApplicationRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "false",
        "x-lam-scoped-employee-id": "emp-001",
        "x-lam-capabilities": "hr.lam.leave-applications.read",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        leaveTypeId: unpaidLeaveTypeId,
        startDate: "2026-07-03",
        endDate: "2026-07-04",
        totalDays: 2,
        reason: "Unauthorized submit attempt",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Write access denied/i);
});

test("AC-023 payroll persona cannot upsert attendance records through HTTP boundary", async () => {
  const response = await upsertAttendanceRecordRoute(
    new Request("http://localhost/api/hr/attendance/attendance-records", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "false",
        "x-actor-id": "payroll-001",
        "x-lam-capabilities": "hr.lam.payroll-references.read",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceDate: "2026-06-20",
        status: "present",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Attendance write access denied/i);
});

test("AC-023 auditor persona cannot submit leave applications through HTTP boundary", async () => {
  const response = await submitLeaveApplicationRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...baseHeaders,
        "x-can-write-lam": "false",
        "x-actor-id": "auditor-001",
        "x-lam-capabilities": "hr.lam.audit.read",
      },
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        leaveTypeId: unpaidLeaveTypeId,
        startDate: "2026-07-01",
        endDate: "2026-07-02",
        totalDays: 2,
        reason: "Unauthorized submit attempt",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Write access denied/i);
});
