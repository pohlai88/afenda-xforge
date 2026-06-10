import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  approveLamAttendanceCorrection,
  rejectLamAttendanceCorrection,
  submitLamAttendanceCorrection,
} from "../src/actions/attendance-corrections.action.ts";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { upsertLamCompanyAttendanceSettings } from "../src/actions/company-attendance-settings.action.ts";
import {
  approveLamLeaveApplication,
  rejectLamLeaveApplication,
} from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveApprovalRoute } from "../src/actions/leave-approval-routes.action.ts";
import { adjustLamLeaveBalance } from "../src/actions/leave-balance-adjustment.action.ts";
import { upsertLamLeaveBlackoutPeriod } from "../src/actions/leave-blackout-periods.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { recordLamNotificationEnqueued } from "../src/actions/notifications.action.ts";
import { exportLamPayrollReferences } from "../src/actions/payroll-references.action.ts";
import {
  hrTimeAttendanceLamAuditActions,
  leaveAttendanceManagementAuditEvents,
  leaveAttendanceManagementHighRiskAuditEvents,
} from "../src/contracts/index.ts";
import { buildLamLeaveApplicationNotificationIntent } from "../src/projector/notifications.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";
let annualLeaveTypeId = "";
let unpaidLeaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const correctionWriteContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ],
} as const;

const correctionApproveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ],
  actorEmployeeId: "mgr-001",
  resolvedStepApproverEmployeeIds: ["mgr-001"],
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

const rejectContext = {
  ...approveContext,
  actorId: "mgr-001",
} as const;

const balanceAdjustContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveBalancesWrite,
  ],
} as const;

const payrollExportContext = {
  actorId: "payroll-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.payrollReferencesRead,
  ],
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

const hasAuditAction = (
  actions: readonly string[],
  expected: string
): boolean => actions.includes(expected);

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
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-audit-emission-${randomUUID()}.json`
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

test("AC-025 audit catalog and action map reference only registered event strings", () => {
  const catalog = Object.values(leaveAttendanceManagementAuditEvents);
  assert.equal(new Set(catalog).size, catalog.length);
  assert.equal(catalog.length, 40);

  for (const event of leaveAttendanceManagementHighRiskAuditEvents) {
    assert.ok(catalog.includes(event));
  }

  const actionMapValues = Object.values(
    hrTimeAttendanceLamAuditActions
  ).flatMap((group) => Object.values(group));
  for (const action of actionMapValues) {
    assert.ok(catalog.includes(action));
  }
});

test("AC-025 attendance upsert and correction lifecycle emit audit events", async () => {
  const record = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "missing_punch",
    },
    writeContext
  );
  assert.equal(record.ok, true);
  if (!record.ok) {
    throw new Error("Failed to seed attendance record");
  }

  const submitted = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: record.targetId,
      exceptionType: "missing_punch",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-10T09:00:00.000Z"),
      requestedClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      reason: "Forgot to punch",
    },
    correctionWriteContext
  );
  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("Failed to submit correction");
  }

  const approved = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitted.targetId,
      approvedBy: "mgr-001",
    },
    correctionApproveContext
  );
  assert.equal(approved.ok, true);

  const recordTwo = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-11"),
      status: "late",
      clockInAt: new Date("2026-06-11T09:30:00.000Z"),
      clockOutAt: new Date("2026-06-11T18:00:00.000Z"),
    },
    writeContext
  );
  assert.equal(recordTwo.ok, true);
  if (!recordTwo.ok) {
    throw new Error("Failed to seed second attendance record");
  }

  const submittedTwo = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordTwo.targetId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Traffic delay",
    },
    correctionWriteContext
  );
  assert.equal(submittedTwo.ok, true);
  if (!submittedTwo.ok) {
    throw new Error("Failed to submit second correction");
  }

  const rejected = await rejectLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submittedTwo.targetId,
      rejectionReason: "Insufficient evidence",
    },
    correctionApproveContext
  );
  assert.equal(rejected.ok, true);

  const state = await loadLamRepository(writeContext);
  const actions = state.auditEvents.map((entry) => entry.action);

  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionSubmitted
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.attendanceCorrectionRejected
    )
  );
});

test("AC-025 leave rejection and balance adjustment emit audit events", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Personal leave",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Failed to submit leave application");
  }

  const rejected = await rejectLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submit.targetId,
      rejectedBy: "mgr-001",
      rejectionReason: "Peak period blackout",
    },
    rejectContext
  );
  assert.equal(rejected.ok, true);

  const adjusted = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: annualLeaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Manual reconciliation",
      authorizedBy: "hr-director",
    },
    balanceAdjustContext
  );
  assert.equal(adjusted.ok, true);

  const state = await loadLamRepository(writeContext);
  const actions = state.auditEvents.map((entry) => entry.action);

  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveApplicationRejected
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveBalanceUpdated
    )
  );
});

test("AC-025 configuration updates and payroll export emit audit events", async () => {
  const blackout = await upsertLamLeaveBlackoutPeriod(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "PEAK-2026",
      title: "Peak Season",
      startDate: new Date("2026-12-01"),
      endDate: new Date("2026-12-31"),
      reason: "Year-end peak operations",
      active: true,
    },
    writeContext
  );
  assert.equal(blackout.ok, true);

  const settings = await upsertLamCompanyAttendanceSettings(
    {
      companyId: "company-001",
      attendanceCorrectionsEnabled: false,
    },
    writeContext
  );
  assert.equal(settings.ok, true);

  const route = await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-AUDIT",
      title: "Annual Leave Route",
      leaveTypeId: annualLeaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );
  assert.equal(route.ok, true);
  if (!route.ok) {
    throw new Error("Failed to create approval route");
  }

  const routeUpdated = await upsertLamLeaveApprovalRoute(
    {
      id: route.targetId,
      companyId: "company-001",
      code: "AL-AUDIT",
      title: "Annual Leave Route Updated",
      leaveTypeId: annualLeaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );
  assert.equal(routeUpdated.ok, true);

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      totalDays: 2,
      reason: "Payroll export seed",
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Failed to submit leave for payroll export");
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

  const exported = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart: new Date("2026-06-01"),
      payPeriodEnd: new Date("2026-06-30"),
    },
    payrollExportContext
  );
  assert.equal(exported.ok, true);

  const intent = buildLamLeaveApplicationNotificationIntent({
    application: {
      id: submit.targetId,
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      totalDays: 2,
      reason: "Payroll export seed",
      status: "approved",
      approvalRouteId: null,
      currentStepOrder: null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      returnedReason: null,
      cancellationReason: null,
      cancelledAt: null,
      submittedAt: new Date("2026-06-01"),
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    kind: "submitted",
    leaveTypeName: "Unpaid Leave",
  });

  const notification = await recordLamNotificationEnqueued(
    {
      companyId: "company-001",
      intent,
      recipientUserIds: ["user-mgr-001"],
      notificationId: "notif-audit-001",
    },
    writeContext
  );
  assert.equal(notification.ok, true);

  const state = await loadLamRepository(writeContext);
  const actions = state.auditEvents.map((entry) => entry.action);

  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveBlackoutPeriodUpserted
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.companyAttendanceSettingsUpdated
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveApprovalRouteCreated
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.leaveApprovalRouteUpdated
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.payrollReferenceExported
    )
  );
  assert.ok(
    hasAuditAction(
      actions,
      leaveAttendanceManagementAuditEvents.notificationEnqueued
    )
  );
});
