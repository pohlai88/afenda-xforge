import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { exportLamPayrollReferences } from "../src/actions/payroll-references.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { mapAttendanceStatusToDeductionCategory } from "../src/projector/attendance-payroll-references.ts";
import {
  getLamPayrollReferenceByApplicationId,
  listLamPayrollReferencesRecords,
} from "../src/queries/payroll-references.query.ts";
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

const payrollReadContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: false,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.payrollReferencesRead,
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

const payPeriodStart = new Date("2026-06-01");
const payPeriodEnd = new Date("2026-06-30");

const seedAnnualLeaveBalance = async (): Promise<void> => {
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

const submitAndApproveLeave = async (args: {
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
    throw new Error("Expected leave submit to succeed");
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

const upsertAttendance = async (
  status:
    | "absent"
    | "late"
    | "early_out"
    | "half_day"
    | "missing_punch"
    | "present",
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
    `lam-payroll-integration-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const annualType = await upsertLamLeaveType(
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
  assert.equal(annualType.ok, true);
  if (!annualType.ok) {
    throw new Error("Failed to seed annual leave type");
  }
  annualLeaveTypeId = annualType.targetId;

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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("mapAttendanceStatusToDeductionCategory maps payroll attendance categories", () => {
  assert.equal(mapAttendanceStatusToDeductionCategory("absent"), "absence");
  assert.equal(mapAttendanceStatusToDeductionCategory("late"), "lateness");
  assert.equal(
    mapAttendanceStatusToDeductionCategory("early_out"),
    "attendance_deduction"
  );
  assert.equal(
    mapAttendanceStatusToDeductionCategory("half_day"),
    "attendance_deduction"
  );
  assert.equal(
    mapAttendanceStatusToDeductionCategory("missing_punch"),
    "attendance_deduction"
  );
  assert.equal(mapAttendanceStatusToDeductionCategory("present"), null);
});

test("AC-020 lists approved leave, unpaid leave, absence, lateness, and attendance deductions", async () => {
  await seedAnnualLeaveBalance();

  const paidApplicationId = await submitAndApproveLeave({
    leaveTypeId: annualLeaveTypeId,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-11"),
    totalDays: 2,
    reason: "Annual leave",
  });

  const unpaidApplicationId = await submitAndApproveLeave({
    leaveTypeId: unpaidLeaveTypeId,
    startDate: new Date("2026-06-20"),
    endDate: new Date("2026-06-21"),
    totalDays: 2,
    reason: "Unpaid leave",
  });

  await upsertAttendance("absent", new Date("2026-06-05"));
  await upsertAttendance("late", new Date("2026-06-06"));
  await upsertAttendance("early_out", new Date("2026-06-07"));
  await upsertAttendance("present", new Date("2026-06-08"));

  const approvedLeave = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "approved_leave",
    },
    payrollReadContext
  );
  assert.equal(approvedLeave.length, 2);

  const unpaidLeave = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "unpaid_leave",
    },
    payrollReadContext
  );
  assert.equal(unpaidLeave.length, 1);
  assert.equal(unpaidLeave[0]?.leaveApplicationId, unpaidApplicationId);

  const absence = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "absence",
    },
    payrollReadContext
  );
  assert.equal(absence.length, 1);
  assert.equal(absence[0]?.deductionCategory, "absence");

  const lateness = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "lateness",
    },
    payrollReadContext
  );
  assert.equal(lateness.length, 1);
  assert.equal(lateness[0]?.deductionCategory, "lateness");

  const deductions = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "attendance_deduction",
    },
    payrollReadContext
  );
  assert.equal(deductions.length, 1);
  assert.equal(deductions[0]?.deductionCategory, "attendance_deduction");

  const allReferences = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "all",
    },
    payrollReadContext
  );
  assert.equal(allReferences.length, 6);

  const paidReference = await getLamPayrollReferenceByApplicationId(
    paidApplicationId,
    payrollReadContext
  );
  assert.ok(paidReference);
  assert.equal(paidReference.deductionCategory, "approved_leave");
  assert.equal(paidReference.paid, true);
});

test("AC-020 export emits payrollReferenceExported with leave and attendance record ids", async () => {
  await seedAnnualLeaveBalance();

  const paidApplicationId = await submitAndApproveLeave({
    leaveTypeId: annualLeaveTypeId,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-11"),
    totalDays: 2,
    reason: "Annual leave",
  });

  await upsertAttendance("absent", new Date("2026-06-05"));
  await upsertAttendance("late", new Date("2026-06-06"));

  const exported = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart,
      payPeriodEnd,
      exportedBy: "payroll-001",
      deductionCategories: [
        "approved_leave",
        "absence",
        "lateness",
        "attendance_deduction",
        "unpaid_leave",
      ],
    },
    payrollExportContext
  );

  assert.equal(exported.ok, true);
  if (!exported.ok) {
    return;
  }

  assert.equal(exported.references.length, 3);
  assert.deepEqual(exported.batch.deductionCategories, [
    "approved_leave",
    "absence",
    "lateness",
    "attendance_deduction",
    "unpaid_leave",
  ]);
  assert.ok(exported.batch.leaveApplicationIds.includes(paidApplicationId));
  assert.equal(exported.batch.attendanceRecordIds.length, 2);

  const state = await loadLamRepository(payrollReadContext);
  const exportAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.payrollReferenceExported
  );
  assert.ok(exportAudit);
  assert.equal(exportAudit.entityType, "report_export");
  assert.deepEqual(exportAudit.metadata.leaveApplicationIds, [
    paidApplicationId,
  ]);
  assert.equal(
    (exportAudit.metadata.attendanceRecordIds as string[] | undefined)?.length,
    2
  );
  assert.deepEqual(exportAudit.metadata.deductionCategories, [
    "approved_leave",
    "absence",
    "lateness",
    "attendance_deduction",
    "unpaid_leave",
  ]);

  const pending = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      exportStatus: "pending",
      deductionCategory: "all",
    },
    payrollReadContext
  );
  assert.equal(pending.length, 0);
});

test("AC-020 exportLamPayrollReferences supports attendance-only payroll categories", async () => {
  await upsertAttendance("absent", new Date("2026-06-05"));
  await upsertAttendance("late", new Date("2026-06-06"));

  const exported = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart,
      payPeriodEnd,
      deductionCategories: ["absence", "lateness"],
    },
    payrollExportContext
  );

  assert.equal(exported.ok, true);
  if (!exported.ok) {
    return;
  }

  assert.equal(exported.references.length, 2);
  assert.equal(exported.batch.leaveApplicationIds.length, 0);
  assert.equal(exported.batch.attendanceRecordIds.length, 2);
});

test("AC-020 lists half_day and missing_punch under attendance_deduction category", async () => {
  await upsertAttendance("half_day", new Date("2026-06-12"));
  await upsertAttendance("missing_punch", new Date("2026-06-13"));

  const deductions = await listLamPayrollReferencesRecords(
    {
      payPeriodStart,
      payPeriodEnd,
      deductionCategory: "attendance_deduction",
    },
    payrollReadContext
  );
  assert.equal(deductions.length, 2);
  assert.ok(
    deductions.every(
      (entry) => entry.deductionCategory === "attendance_deduction"
    )
  );
});
