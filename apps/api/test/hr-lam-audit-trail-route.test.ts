import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { leaveAttendanceManagementAuditEvents } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  applyLamLeaveEntitlementCalculation,
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
import { POST as upsertAttendanceRecordRoute } from "../app/api/hr/attendance/attendance-records/route.ts";
import { GET as getAuditTrailEventRoute } from "../app/api/hr/leave/audit-trail/[auditEventId]/route.ts";
import { GET as listAuditTrailRoute } from "../app/api/hr/leave/audit-trail/route.ts";
import { POST as approveLeaveApplicationRoute } from "../app/api/hr/leave/leave-applications/[applicationId]/approve/route.ts";
import { POST as adjustLeaveBalanceRoute } from "../app/api/hr/leave/leave-balances/adjust/route.ts";
import { POST as exportLeaveReportRoute } from "../app/api/hr/leave/leave-report/export/route.ts";
import { POST as exportPayrollReferencesRoute } from "../app/api/hr/leave/payroll-references/export/route.ts";

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

const auditorReadHeaders = {
  ...baseHeaders,
  "x-can-read-lam": "false",
  "x-lam-capabilities": "hr.lam.audit.read",
} as const;

const attendanceWriteHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "true",
  "x-actor-id": "hr-admin",
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
} as const;

const balanceWriteHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "true",
  "x-actor-id": "hr-admin",
  "x-lam-capabilities": "hr.lam.leave-balances.write",
} as const;

const payrollExportHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "false",
  "x-actor-id": "payroll-001",
  "x-lam-capabilities": "hr.lam.payroll-references.read",
} as const;

const reportsExportHeaders = {
  "content-type": "application/json",
  ...baseHeaders,
  "x-can-write-lam": "false",
  "x-actor-id": "reports-admin",
  "x-lam-capabilities": "hr.lam.reports.export",
} as const;

type AuditTrailRecord = {
  id: string;
  action: string;
  entityType: string;
};

const listAuditEvents = async (query = ""): Promise<AuditTrailRecord[]> => {
  const response = await listAuditTrailRoute(
    new Request(`http://localhost/api/hr/leave/audit-trail${query}`, {
      headers: auditorReadHeaders,
    })
  );
  assert.equal(response.status, 200);
  return (await response.json()) as AuditTrailRecord[];
};

const seedLeaveWorkflow = async (): Promise<void> => {
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
      code: "AL-AUDIT-HTTP",
      title: "Audit HTTP Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-audit-trail-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
  await seedLeaveWorkflow();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-025 HTTP attendance upsert creates audit event retrievable via audit-trail", async () => {
  const response = await upsertAttendanceRecordRoute(
    new Request("http://localhost/api/hr/attendance/attendance-records", {
      method: "POST",
      headers: attendanceWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceDate: "2026-06-10",
        status: "present",
        clockInAt: "2026-06-10T09:00:00.000Z",
        clockOutAt: "2026-06-10T18:00:00.000Z",
      }),
    })
  );
  assert.equal(response.status, 201);
  assert.equal(((await response.json()) as { ok: boolean }).ok, true);

  const action = leaveAttendanceManagementAuditEvents.attendanceRecordUpserted;
  const events = await listAuditEvents(
    `?action=${encodeURIComponent(action)}&entityType=attendance_record`
  );
  assert.ok(events.some((entry) => entry.action === action));
});

test("AC-025 HTTP leave approval creates audit event retrievable via audit-trail", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Annual leave for audit HTTP test",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Failed to submit leave application");
  }

  const response = await approveLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${submit.targetId}/approve`,
      {
        method: "POST",
        headers: approvalHeaders,
        body: JSON.stringify({ approvedBy: "mgr-001" }),
      }
    ),
    { params: Promise.resolve({ applicationId: submit.targetId }) }
  );
  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as { ok: boolean }).ok, true);

  const action = leaveAttendanceManagementAuditEvents.leaveApplicationApproved;
  const events = await listAuditEvents(
    `?action=${encodeURIComponent(action)}&entityId=${submit.targetId}`
  );
  assert.ok(events.some((entry) => entry.action === action));
});

test("AC-025 HTTP balance adjustment creates audit event retrievable via audit-trail", async () => {
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
        reason: "Audit HTTP adjustment",
        authorizedBy: "hr-director",
      }),
    })
  );
  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as { ok: boolean }).ok, true);

  const action = leaveAttendanceManagementAuditEvents.leaveBalanceUpdated;
  const events = await listAuditEvents(`?action=${encodeURIComponent(action)}`);
  assert.ok(events.some((entry) => entry.action === action));
});

test("AC-025 HTTP payroll export creates audit event retrievable via audit-trail", async () => {
  const attendanceSeed = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-15"),
      status: "absent",
    },
    writeContext
  );
  assert.equal(attendanceSeed.ok, true);

  const response = await exportPayrollReferencesRoute(
    new Request("http://localhost/api/hr/leave/payroll-references/export", {
      method: "POST",
      headers: payrollExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        payPeriodStart: "2026-06-01",
        payPeriodEnd: "2026-06-30",
        exportedBy: "payroll-001",
        deductionCategories: ["absence"],
      }),
    })
  );
  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as { ok: boolean }).ok, true);

  const action = leaveAttendanceManagementAuditEvents.payrollReferenceExported;
  const events = await listAuditEvents(`?action=${encodeURIComponent(action)}`);
  assert.ok(events.some((entry) => entry.action === action));
});

test("AC-025 HTTP leave report export creates reportExported audit event", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-06-16"),
      totalDays: 2,
      reason: "Leave report export audit seed",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Failed to submit leave application");
  }

  const approveResponse = await approveLeaveApplicationRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications/${submit.targetId}/approve`,
      {
        method: "POST",
        headers: approvalHeaders,
        body: JSON.stringify({ approvedBy: "mgr-001" }),
      }
    ),
    { params: Promise.resolve({ applicationId: submit.targetId }) }
  );
  assert.equal(approveResponse.status, 200);

  const response = await exportLeaveReportRoute(
    new Request("http://localhost/api/hr/leave/leave-report/export", {
      method: "POST",
      headers: reportsExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
      }),
    })
  );
  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as { ok: boolean }).ok, true);

  const action = leaveAttendanceManagementAuditEvents.reportExported;
  const events = await listAuditEvents(`?action=${encodeURIComponent(action)}`);
  assert.ok(events.some((entry) => entry.action === action));
});

test("AC-025 HTTP audit-trail detail route returns mutation event after HTTP write", async () => {
  const response = await upsertAttendanceRecordRoute(
    new Request("http://localhost/api/hr/attendance/attendance-records", {
      method: "POST",
      headers: attendanceWriteHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceDate: "2026-06-12",
        status: "late",
      }),
    })
  );
  assert.equal(response.status, 201);

  const action = leaveAttendanceManagementAuditEvents.attendanceRecordUpserted;
  const events = await listAuditEvents(`?action=${encodeURIComponent(action)}`);
  const auditEventId = events[0]?.id;
  assert.ok(auditEventId);

  const detailResponse = await getAuditTrailEventRoute(
    new Request(`http://localhost/api/hr/leave/audit-trail/${auditEventId}`, {
      headers: auditorReadHeaders,
    }),
    { params: Promise.resolve({ auditEventId }) }
  );
  assert.equal(detailResponse.status, 200);

  const detail = (await detailResponse.json()) as AuditTrailRecord;
  assert.equal(detail.id, auditEventId);
  assert.equal(detail.action, action);
});
