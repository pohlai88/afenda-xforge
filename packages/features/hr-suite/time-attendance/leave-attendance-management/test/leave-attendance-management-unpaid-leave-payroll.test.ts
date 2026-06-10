import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { cancelLamLeaveApplication } from "../src/actions/leave-application-lifecycle.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { exportLamPayrollReferences } from "../src/actions/payroll-references.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  isUnpaidLeaveType,
  shouldReserveLeaveBalance,
} from "../src/projector/unpaid-leave-payroll-references.ts";
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
import { lamLeaveTypeSchema } from "../src/schema.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";

const writeContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const approveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
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

const submitUnpaidLeave = async (): Promise<string> => {
  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Personal unpaid leave",
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.ok(result.targetId);

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: result.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  return result.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-unpaid-payroll-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

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

  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  const leaveType = state.leaveTypes.find((entry) => entry.code === "UNPAID");
  assert.ok(leaveType);
  unpaidLeaveTypeId = leaveType.id;
});

afterEach(() => {
  if (currentRepositoryPath) {
    rmSync(currentRepositoryPath, { force: true });
  }
});

test("unpaid leave type bypasses balance reservation policy helpers", () => {
  const unpaidType = lamLeaveTypeSchema.parse({
    id: "lt-unpaid",
    companyId: "company-001",
    code: "UNPAID",
    name: "Unpaid Leave",
    kind: "unpaid",
    paid: false,
    requiresDocument: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(isUnpaidLeaveType(unpaidType), true);
  assert.equal(shouldReserveLeaveBalance(unpaidType), false);
});

test("HRM-LAM-020 submit unpaid leave succeeds without leave balance", async () => {
  const applicationId = await submitUnpaidLeave();
  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });

  assert.equal(state.leaveBalances.length, 0);
  assert.equal(
    state.leaveApplications.find((entry) => entry.id === applicationId)?.status,
    "approved"
  );

  const submitAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted &&
      entry.entityId === applicationId
  );
  assert.ok(submitAudit);
  assert.equal(submitAudit.metadata.isUnpaidLeave, true);
});

test("AC-017 approved unpaid leave is listed for payroll deduction reference", async () => {
  const applicationId = await submitUnpaidLeave();
  const references = await listLamPayrollReferencesRecords(
    {
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      deductionCategory: "unpaid_leave",
    },
    payrollReadContext
  );

  assert.equal(references.length, 1);
  assert.equal(references[0]?.leaveApplicationId, applicationId);
  assert.equal(references[0]?.deductionCategory, "unpaid_leave");
  assert.equal(references[0]?.totalDays, 3);
  assert.match(
    references[0]?.sourceReference ?? "",
    /^lam:unpaid-leave:company-001:/
  );

  const byId = await getLamPayrollReferenceByApplicationId(
    applicationId,
    payrollReadContext
  );
  assert.ok(byId);
  assert.match(byId.sourceReference, /^lam:unpaid-leave:company-001:/);
});

test("AC-017 exportLamPayrollReferences emits payrollReferenceExported audit", async () => {
  const applicationId = await submitUnpaidLeave();

  const exported = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      exportedBy: "payroll-001",
      deductionCategories: ["unpaid_leave"],
    },
    payrollExportContext
  );

  assert.equal(exported.ok, true);
  if (!exported.ok) {
    return;
  }

  assert.equal(exported.references.length, 1);
  assert.equal(exported.references[0]?.leaveApplicationId, applicationId);
  assert.ok(exported.batch.exportedAt);

  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  const exportAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.payrollReferenceExported
  );
  assert.ok(exportAudit);
  assert.equal(exportAudit.entityType, "report_export");
  assert.deepEqual(exportAudit.metadata.leaveApplicationIds, [applicationId]);

  const pending = await listLamPayrollReferencesRecords(
    {
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      exportStatus: "pending",
      deductionCategory: "unpaid_leave",
    },
    payrollReadContext
  );
  assert.equal(pending.length, 0);

  const exportedList = await listLamPayrollReferencesRecords(
    {
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      exportStatus: "exported",
      deductionCategory: "unpaid_leave",
    },
    payrollReadContext
  );
  assert.equal(exportedList.length, 1);
});

test("AC-017 cancelled unpaid leave is excluded from payroll references", async () => {
  const applicationId = await submitUnpaidLeave();

  const cancelled = await cancelLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId,
      cancellationReason: "Plans changed",
      cancelledBy: "emp-001",
    },
    approveContext
  );
  assert.equal(cancelled.ok, true);

  const references = await listLamPayrollReferencesRecords(
    {
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      deductionCategory: "unpaid_leave",
    },
    payrollReadContext
  );
  assert.equal(references.length, 0);
});

test("AC-017 payroll reference queries fail closed without payrollReferencesRead", async () => {
  const references = await listLamPayrollReferencesRecords(
    {},
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canRead: false,
    }
  );
  assert.deepEqual(references, []);

  const deniedExport = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
    },
    writeContext
  );
  assert.equal(deniedExport.ok, false);
  if (!deniedExport.ok) {
    assert.equal(deniedExport.error, "Payroll reference read access denied");
  }
});

test("AC-017 payroll export rejects generic write access without payroll capability", async () => {
  await submitUnpaidLeave();

  const deniedExport = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      deductionCategories: ["unpaid_leave"],
    },
    {
      actorId: "hr-admin",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
      ],
    }
  );
  assert.equal(deniedExport.ok, false);
  if (!deniedExport.ok) {
    assert.equal(deniedExport.error, "Payroll reference read access denied");
  }
});

test("AC-017 payroll export respects employee mutation scope", async () => {
  await submitUnpaidLeave();

  const deniedExport = await exportLamPayrollReferences(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      payPeriodStart: new Date("2026-07-01"),
      payPeriodEnd: new Date("2026-07-31"),
      deductionCategories: ["unpaid_leave"],
    },
    {
      actorId: "emp-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      scopedEmployeeId: "emp-001",
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.payrollReferencesRead,
      ],
    }
  );
  assert.equal(deniedExport.ok, false);
  if (!deniedExport.ok) {
    assert.equal(
      deniedExport.error,
      "Employee data scope access denied for leave and attendance"
    );
  }
});
