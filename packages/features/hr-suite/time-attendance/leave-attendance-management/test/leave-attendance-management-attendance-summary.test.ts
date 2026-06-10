import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { exportLamAttendanceSummary } from "../src/actions/attendance-summary.action.ts";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { requireLamReportsExportAccess } from "../src/execution.ts";
import {
  countInclusiveCalendarDaysInPeriod,
  projectAttendanceSummary,
} from "../src/projector/attendance-summary.ts";
import {
  getLamAttendanceSummaryForEmployee,
  listLamAttendanceSummaryRecords,
} from "../src/queries/attendance-summary.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import type { LamAttendanceStatus } from "../src/schema.ts";

let currentRepositoryPath = "";
let annualLeaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const reportsReadContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [leaveAttendanceManagementCapabilities.reportsRead],
} as const;

const reportsExportContext = {
  actorId: "reports-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  grantedCapabilities: [leaveAttendanceManagementCapabilities.reportsExport],
} as const;

const approveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  actorEmployeeId: "mgr-001",
  resolvedStepApproverEmployeeIds: ["mgr-001"],
  teamEmployeeIds: ["emp-001"],
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  ],
} as const;

const periodStart = new Date("2026-06-01");
const periodEnd = new Date("2026-06-30");

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

const seedAnnualLeave = async (): Promise<void> => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "AL-MY",
      title: "Annual Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 14,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: annualLeaveTypeId,
      hireDate: new Date("2020-01-15"),
      countryCode: "MY",
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

const upsertRecord = async (
  status: LamAttendanceStatus,
  attendanceDate: Date
): Promise<void> => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate,
      status,
    },
    writeContext
  );
  assert.equal(result.ok, true);
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-attendance-summary-${randomUUID()}.json`
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
    throw new Error("Failed to seed annual leave type");
  }
  annualLeaveTypeId = leaveType.targetId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("countInclusiveCalendarDaysInPeriod calculates overlapping leave days", () => {
  assert.equal(
    countInclusiveCalendarDaysInPeriod(
      new Date("2026-06-28"),
      new Date("2026-07-03"),
      periodStart,
      periodEnd
    ),
    3
  );
  assert.equal(
    countInclusiveCalendarDaysInPeriod(
      new Date("2026-05-01"),
      new Date("2026-05-05"),
      periodStart,
      periodEnd
    ),
    0
  );
});

test("HRM-LAM-025 attendance summary counts days worked, absent, late, and early-out", async () => {
  await upsertRecord("present", new Date("2026-06-02"));
  await upsertRecord("present", new Date("2026-06-03"));
  await upsertRecord("absent", new Date("2026-06-04"));
  await upsertRecord("late", new Date("2026-06-05"));
  await upsertRecord("early_out", new Date("2026-06-06"));
  await upsertRecord("half_day", new Date("2026-06-07"));
  await upsertRecord("missing_punch", new Date("2026-06-08"));
  await upsertRecord("rest_day", new Date("2026-06-09"));
  await upsertRecord("off_day", new Date("2026-06-10"));
  await upsertRecord("public_holiday", new Date("2026-06-11"));
  await upsertRecord("present", new Date("2026-07-01"));

  const summaries = await listLamAttendanceSummaryRecords(
    { periodStart, periodEnd },
    reportsReadContext
  );

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.daysWorked, 2);
  assert.equal(summaries[0]?.absentDays, 1);
  assert.equal(summaries[0]?.lateDays, 1);
  assert.equal(summaries[0]?.earlyOutDays, 1);
  assert.equal(summaries[0]?.halfDays, 1);
  assert.equal(summaries[0]?.missingPunchDays, 1);
  assert.equal(summaries[0]?.restDays, 1);
  assert.equal(summaries[0]?.offDays, 1);
  assert.equal(summaries[0]?.publicHolidayDays, 1);
  assert.equal(summaries[0]?.totalRecords, 10);
});

test("HRM-LAM-025 attendance summary includes approved leave taken days by type", async () => {
  await seedAnnualLeave();
  await upsertRecord("present", new Date("2026-06-02"));

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-12"),
      totalDays: 3,
      reason: "Annual leave",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    return;
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  const summary = await getLamAttendanceSummaryForEmployee(
    "emp-001",
    { periodStart, periodEnd },
    reportsReadContext
  );
  assert.ok(summary);
  assert.equal(summary.leaveTakenDays, 3);
  assert.equal(summary.leaveTakenByType[annualLeaveTypeId], 3);
  assert.equal(summary.daysWorked, 1);
});

test("HRM-LAM-025 non-approved leave is excluded from leaveTakenDays", async () => {
  await seedAnnualLeave();
  await upsertRecord("present", new Date("2026-06-02"));

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-11"),
      totalDays: 2,
      reason: "Pending leave",
    },
    writeContext
  );
  assert.equal(submit.ok, true);

  const summaries = await listLamAttendanceSummaryRecords(
    { periodStart, periodEnd, employeeId: "emp-001" },
    reportsReadContext
  );
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.leaveTakenDays, 0);
});

test("HRM-LAM-025 attendance summary filters by attendanceStatus and leaveTypeId", async () => {
  await seedAnnualLeave();
  await upsertRecord("present", new Date("2026-06-02"));
  await upsertRecord("absent", new Date("2026-06-03"));
  await upsertRecord("late", new Date("2026-06-04"));

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-12"),
      totalDays: 3,
      reason: "Annual leave",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Failed to submit leave application");
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  const absentOnly = await listLamAttendanceSummaryRecords(
    {
      periodStart,
      periodEnd,
      attendanceStatus: "absent",
    },
    reportsReadContext
  );
  assert.equal(absentOnly.length, 1);
  assert.equal(absentOnly[0]?.absentDays, 1);
  assert.equal(absentOnly[0]?.daysWorked, 0);
  assert.equal(absentOnly[0]?.totalRecords, 1);

  const leaveTypeFiltered = await listLamAttendanceSummaryRecords(
    {
      periodStart,
      periodEnd,
      leaveTypeId: annualLeaveTypeId,
    },
    reportsReadContext
  );
  assert.equal(leaveTypeFiltered.length, 1);
  assert.equal(leaveTypeFiltered[0]?.leaveTakenDays, 3);
});

test("AC-024 attendance summary list filters by employeeIds for orchestration-resolved org scope", async () => {
  await upsertRecord("present", new Date("2026-06-02"));
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceDate: new Date("2026-06-02"),
      status: "absent",
    },
    writeContext
  );

  const scoped = await listLamAttendanceSummaryRecords(
    {
      periodStart,
      periodEnd,
      employeeIds: ["emp-002"],
    },
    reportsReadContext
  );
  assert.equal(scoped.length, 1);
  assert.equal(scoped[0]?.employeeId, "emp-002");
  assert.equal(scoped[0]?.absentDays, 1);
});

test("listLamAttendanceSummaryRecords fails closed without reportsRead", async () => {
  await upsertRecord("present", new Date("2026-06-02"));

  assert.deepEqual(
    await listLamAttendanceSummaryRecords(
      { periodStart, periodEnd },
      {
        companyId: "company-001",
        tenantId: "tenant-001",
        canRead: false,
        grantedCapabilities: [
          leaveAttendanceManagementCapabilities.attendanceRead,
        ],
      }
    ),
    []
  );
});

test("exportLamAttendanceSummary requires reportsExport and emits reportExported audit", async () => {
  await upsertRecord("present", new Date("2026-06-02"));
  await upsertRecord("absent", new Date("2026-06-03"));

  const denied = requireLamReportsExportAccess(writeContext);
  assert.ok(denied);
  assert.equal(denied?.ok, false);

  const exported = await exportLamAttendanceSummary(
    {
      companyId: "company-001",
      periodStart,
      periodEnd,
      exportedBy: "reports-admin",
    },
    reportsExportContext
  );
  assert.equal(exported.ok, true);
  if (!exported.ok) {
    return;
  }

  assert.equal(exported.summaries.length, 1);
  assert.equal(exported.summaries[0]?.daysWorked, 1);
  assert.equal(exported.summaries[0]?.absentDays, 1);

  const state = await loadLamRepository(reportsReadContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.reportExported
  );
  assert.ok(audit);
  assert.equal(audit.entityType, "report_export");
  assert.equal(audit.metadata.reportKind, "attendance_summary");
});

test("HRM-LAM-029 exportLamAttendanceSummary preserves attendanceStatus and leaveTypeId in audit metadata", async () => {
  await seedAnnualLeave();
  await upsertRecord("present", new Date("2026-06-02"));
  await upsertRecord("absent", new Date("2026-06-03"));

  const exported = await exportLamAttendanceSummary(
    {
      companyId: "company-001",
      periodStart,
      periodEnd,
      attendanceStatus: "absent",
      exportedBy: "reports-admin",
    },
    reportsExportContext
  );
  assert.equal(exported.ok, true);
  if (!exported.ok) {
    throw new Error("Export failed");
  }

  assert.equal(exported.summaries.length, 1);
  assert.equal(exported.summaries[0]?.absentDays, 1);
  assert.equal(exported.summaries[0]?.daysWorked, 0);
  assert.equal(exported.batch.attendanceStatus, "absent");

  const state = await loadLamRepository(reportsReadContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.reportExported &&
      entry.metadata?.attendanceStatus === "absent"
  );
  assert.ok(audit);
});

test("projectAttendanceSummary produces stable summary id for employee and period", () => {
  const summary = projectAttendanceSummary({
    employeeId: "emp-001",
    companyId: "company-001",
    periodStart,
    periodEnd,
    attendanceRecords: [],
    leaveApplications: [],
  });

  assert.equal(
    summary.id,
    `emp-001:${periodStart.toISOString()}:${periodEnd.toISOString()}`
  );
  assert.equal(summary.leaveTakenDays, 0);
});
