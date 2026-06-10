import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { exportLamLeaveReport } from "../src/actions/leave-report.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  filterLeaveApplicationsForReport,
  projectLeaveReportEntry,
} from "../src/projector/leave-report.ts";
import {
  getLamLeaveReportForEmployee,
  listLamLeaveReportRecords,
} from "../src/queries/leave-report.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import type { LamLeaveApplication } from "../src/schema.ts";

let currentRepositoryPath = "";
let annualLeaveTypeId = "";
let sickLeaveTypeId = "";
let unpaidLeaveTypeId = "";

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

const sampleApplication = (
  overrides: Partial<LamLeaveApplication> = {}
): LamLeaveApplication => ({
  id: "app-sample",
  companyId: "company-001",
  employeeId: "emp-001",
  leaveTypeId: annualLeaveTypeId,
  startDate: new Date("2026-06-10"),
  endDate: new Date("2026-06-12"),
  totalDays: 3,
  reason: "Annual leave",
  status: "approved",
  approvalRouteId: null,
  currentStepOrder: null,
  approvedBy: "mgr-001",
  approvedAt: new Date("2026-06-05"),
  rejectionReason: null,
  returnedReason: null,
  cancellationReason: null,
  cancelledAt: null,
  submittedAt: new Date("2026-06-04"),
  createdAt: new Date("2026-06-04"),
  updatedAt: new Date("2026-06-05"),
  ...overrides,
});

const seedLeaveTypes = async (): Promise<void> => {
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

  const sick = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "SL",
      name: "Sick Leave",
      kind: "medical",
      paid: true,
      requiresDocument: true,
      active: true,
    },
    writeContext
  );
  assert.equal(sick.ok, true);
  if (!sick.ok) {
    throw new Error("Failed to seed medical leave type");
  }
  sickLeaveTypeId = sick.targetId;

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

const submitAndApprove = async (args: {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
}): Promise<string> => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: args.leaveTypeId,
      startDate: args.startDate,
      endDate: args.endDate,
      totalDays: args.totalDays,
      reason: args.reason,
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

  return submit.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-leave-report-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
  await seedLeaveTypes();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-029 leave report projector aggregates days and status counts by employee", () => {
  const applications = [
    sampleApplication({
      id: "app-1",
      leaveTypeId: annualLeaveTypeId,
      status: "approved",
    }),
    sampleApplication({
      id: "app-2",
      leaveTypeId: sickLeaveTypeId,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      totalDays: 2,
      status: "pending_approval",
    }),
  ];

  const filtered = filterLeaveApplicationsForReport(applications, {
    periodStart,
    periodEnd,
  });
  assert.equal(filtered.length, 2);

  const entry = projectLeaveReportEntry({
    employeeId: "emp-001",
    companyId: "company-001",
    periodStart,
    periodEnd,
    applications: filtered,
  });

  assert.equal(entry.totalApplications, 2);
  assert.equal(entry.totalDays, 5);
  assert.equal(entry.daysByType[annualLeaveTypeId], 3);
  assert.equal(entry.daysByType[sickLeaveTypeId], 2);
  assert.equal(entry.applicationsByStatus.approved, 1);
  assert.equal(entry.applicationsByStatus.pending_approval, 1);
});

test("HRM-LAM-029 leave report list filters by leave type, status, and period", async () => {
  await submitAndApprove({
    leaveTypeId: annualLeaveTypeId,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-12"),
    totalDays: 3,
    reason: "Annual leave",
  });

  const submitPending = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      totalDays: 2,
      reason: "Unpaid leave pending",
    },
    writeContext
  );
  assert.equal(submitPending.ok, true);

  const approvedOnly = await listLamLeaveReportRecords(
    {
      periodStart,
      periodEnd,
      status: "approved",
    },
    reportsReadContext
  );
  assert.equal(approvedOnly.length, 1);
  assert.equal(approvedOnly[0]?.totalApplications, 1);
  assert.equal(approvedOnly[0]?.totalDays, 3);

  const unpaidOnly = await listLamLeaveReportRecords(
    {
      periodStart,
      periodEnd,
      leaveTypeId: unpaidLeaveTypeId,
    },
    reportsReadContext
  );
  assert.equal(unpaidOnly.length, 1);
  assert.equal(unpaidOnly[0]?.totalApplications, 1);
  assert.equal(unpaidOnly[0]?.applicationsByStatus.submitted, 1);
});

test("HRM-LAM-029 getLamLeaveReportForEmployee returns employee-scoped entry", async () => {
  await submitAndApprove({
    leaveTypeId: annualLeaveTypeId,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-12"),
    totalDays: 3,
    reason: "Annual leave",
  });

  const entry = await getLamLeaveReportForEmployee(
    "emp-001",
    { periodStart, periodEnd },
    reportsReadContext
  );

  assert.ok(entry);
  assert.equal(entry.employeeId, "emp-001");
  assert.equal(entry.totalDays, 3);
});

test("HRM-LAM-029 listLamLeaveReportRecords fails closed without reportsRead", async () => {
  const entries = await listLamLeaveReportRecords(
    { periodStart, periodEnd },
    { companyId: "company-001", canRead: false }
  );
  assert.deepEqual(entries, []);
});

test("HRM-LAM-029 exportLamLeaveReport requires reportsExport and emits reportExported audit", async () => {
  await submitAndApprove({
    leaveTypeId: annualLeaveTypeId,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-12"),
    totalDays: 3,
    reason: "Annual leave",
  });

  const denied = await exportLamLeaveReport(
    { periodStart, periodEnd },
    writeContext
  );
  assert.equal(denied.ok, false);

  const exported = await exportLamLeaveReport(
    { periodStart, periodEnd },
    reportsExportContext
  );
  assert.equal(exported.ok, true);
  if (!exported.ok) {
    throw new Error("Export failed");
  }

  assert.equal(exported.entries.length, 1);
  assert.equal(exported.batch.entryCount, 1);

  const state = await loadLamRepository(reportsExportContext);
  const auditEvent = state.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.reportExported
  );
  assert.ok(auditEvent);
  assert.equal(auditEvent.metadata?.reportKind, "leave_report");
});
