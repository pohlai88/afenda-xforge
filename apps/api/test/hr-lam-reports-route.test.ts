import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import type { LamPolicyCapability } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  applyLamLeaveEntitlementCalculation,
  approveLamLeaveApplication,
  submitLamLeaveApplication,
  upsertLamAttendanceRecord,
  upsertLamLeaveApprovalRoute,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as listAttendanceSummaryRoute } from "../app/api/hr/attendance/attendance-summary/route.ts";
import { POST as exportAttendanceSummaryRoute } from "../app/api/hr/attendance/attendance-summary/export/route.ts";
import { GET as listLeaveReportRoute } from "../app/api/hr/leave/leave-report/route.ts";
import { POST as exportLeaveReportRoute } from "../app/api/hr/leave/leave-report/export/route.ts";

let currentRepositoryPath = "";
let annualLeaveTypeId = "";
let unpaidLeaveTypeId = "";

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

const reportsReadHeaders = {
  ...baseHeaders,
  "x-can-read-lam": "true",
  "x-lam-capabilities": "hr.lam.reports.read",
} as const;

const reportsExportHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "false",
  "x-actor-id": "reports-admin",
  "x-lam-capabilities": "hr.lam.reports.export",
} as const;

const seedReportData = async (): Promise<void> => {
  const annual = await upsertLamLeaveType(
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
  assert.equal(annual.ok, true);
  if (!annual.ok) {
    throw new Error("Failed to seed annual leave type");
  }
  annualLeaveTypeId = annual.targetId;

  const unpaid = await upsertLamLeaveType(
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
  assert.equal(unpaid.ok, true);
  if (!unpaid.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = unpaid.targetId;

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "AL-MY-REPORTS",
      title: "Annual Leave MY Reports",
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
      leaveTypeId: annualLeaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-REPORTS-HTTP",
      title: "Reports HTTP Route",
      leaveTypeId: annualLeaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "UNPAID-REPORTS-HTTP",
      title: "Unpaid Reports HTTP Route",
      leaveTypeId: unpaidLeaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-02"),
      status: "present",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceDate: new Date("2026-06-02"),
      status: "absent",
    },
    writeContext
  );

  const submitApproved = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-12"),
      totalDays: 3,
      reason: "Approved annual leave",
    },
    writeContext
  );
  assert.equal(submitApproved.ok, true);
  if (!submitApproved.ok) {
    throw new Error("Failed to submit approved leave");
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submitApproved.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true, approved.ok ? undefined : approved.error);

  const submitPending = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      totalDays: 2,
      reason: "Pending unpaid leave",
    },
    writeContext
  );
  assert.equal(submitPending.ok, true);
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-reports-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
  await seedReportData();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-024 leave report GET filters by status through HTTP boundary", async () => {
  const response = await listLeaveReportRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-report?${periodQuery}&status=approved`,
      { headers: reportsReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as Array<{
    employeeId: string;
    totalApplications: number;
  }>;
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.employeeId, "emp-001");
  assert.equal(entries[0]?.totalApplications, 1);
});

test("AC-024 leave report GET filters by leaveTypeId through HTTP boundary", async () => {
  const response = await listLeaveReportRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-report?${periodQuery}&leaveTypeId=${unpaidLeaveTypeId}`,
      { headers: reportsReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as Array<{ totalApplications: number }>;
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.totalApplications, 1);
});

test("AC-024 leave report GET filters by repeated employeeIds query params", async () => {
  const response = await listLeaveReportRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-report?${periodQuery}&employeeIds=emp-001&employeeIds=emp-999`,
      { headers: reportsReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as Array<{ employeeId: string }>;
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.employeeId, "emp-001");
});

test("AC-024 leave report GET returns 400 for missing period query params", async () => {
  const response = await listLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report", {
      headers: reportsReadHeaders,
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid query parameters/i);
});

test("AC-024 leave report export returns 200 with batch payload through HTTP boundary", async () => {
  const response = await exportLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report/export", {
      method: "POST",
      headers: reportsExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        status: "approved",
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    entries: unknown[];
    batch: { entryCount: number };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.entries.length, 1);
  assert.equal(payload.batch.entryCount, 1);
});

test("AC-024 leave report export returns 400 for invalid JSON body", async () => {
  const response = await exportLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report/export", {
      method: "POST",
      headers: reportsExportHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});

test("AC-024 attendance summary GET filters by attendanceStatus through HTTP boundary", async () => {
  const response = await listAttendanceSummaryRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-summary?${periodQuery}&attendanceStatus=absent`,
      { headers: reportsReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as Array<{
    employeeId: string;
    absentDays: number;
  }>;
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.employeeId, "emp-002");
  assert.equal(entries[0]?.absentDays, 1);
});

test("AC-024 attendance summary GET filters by repeated employeeIds query params", async () => {
  const response = await listAttendanceSummaryRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-summary?${periodQuery}&employeeIds=emp-001&employeeIds=emp-999`,
      { headers: reportsReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const entries = (await response.json()) as Array<{ employeeId: string }>;
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.employeeId, "emp-001");
});

test("AC-024 attendance summary export returns 200 through HTTP boundary", async () => {
  const response = await exportAttendanceSummaryRoute(
    new Request("http://localhost/api/hr/attendance/attendance-summary/export", {
      method: "POST",
      headers: reportsExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        attendanceStatus: "present",
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    summaries: unknown[];
    batch: { summaryCount: number };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.summaries.length, 1);
  assert.equal(payload.batch.summaryCount, 1);
});

test("AC-024 attendance summary GET returns 400 for missing period query params", async () => {
  const response = await listAttendanceSummaryRoute(
    new Request("http://localhost/api/hr/attendance/attendance-summary", {
      headers: reportsReadHeaders,
    })
  );
  assert.equal(response.status, 400);
});
