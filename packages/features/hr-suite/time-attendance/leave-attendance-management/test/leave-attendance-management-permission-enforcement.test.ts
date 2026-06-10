import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  canAccessLamEmployeeRecord,
  canReadLamAuditTrail,
  canReadLamPayrollReferences,
  canReadLamReports,
  filterByEmployeeDataScope,
  resolveLamDataScope,
  resolveLamReadDataScope,
} from "../src/policy.ts";
import { listLamAttendanceExceptionsRecords } from "../src/queries/attendance-exceptions.query.ts";
import { listLamAttendanceRecordsRecords } from "../src/queries/attendance-records.query.ts";
import { listLamAttendanceSummaryRecords } from "../src/queries/attendance-summary.query.ts";
import { listLamAuditTrailRecords } from "../src/queries/audit.query.ts";
import { listLamLeaveApplicationsRecords } from "../src/queries/leave-applications.query.ts";
import { calculateLamLeaveEntitlement } from "../src/queries/leave-entitlement-calculation.query.ts";
import { listLamLeaveBalancesRecords } from "../src/queries/leave-balances.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  lamPersonaCapabilityPresets,
  lamPersonaRoleValues,
} from "../src/registry/persona-capabilities.ts";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";
let annualLeaveTypeId = "";

const periodStart = new Date("2026-06-01");
const periodEnd = new Date("2026-06-30");

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const employeeSelfContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  scopedEmployeeId: "emp-001",
  grantedCapabilities: lamPersonaCapabilityPresets.employee,
} as const;

const employeeOtherContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  scopedEmployeeId: "emp-002",
  grantedCapabilities: lamPersonaCapabilityPresets.employee,
} as const;

const managerTeamContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  teamEmployeeIds: ["emp-001", "emp-002"],
  grantedCapabilities: lamPersonaCapabilityPresets.manager,
} as const;

const payrollContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  grantedCapabilities: lamPersonaCapabilityPresets.payroll,
} as const;

const auditorContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  grantedCapabilities: lamPersonaCapabilityPresets.auditor,
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-permission-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
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
  assert.equal(leaveType.ok, true);
  if (!leaveType.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = leaveType.targetId;

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

  for (const employeeId of ["emp-001", "emp-002"] as const) {
    await applyLamLeaveEntitlementCalculation(
      {
        companyId: "company-001",
        employeeId,
        hireDate: new Date("2020-01-15"),
        countryCode: "MY",
        legalEntityCode: "MY-ENTITY",
        workLocationCode: "KL",
        employmentType: "permanent",
        grade: "G5",
        departmentId: employeeId === "emp-001" ? "dept-sales" : "dept-ops",
        leaveTypeId: annualLeaveTypeId,
        periodYear: 2026,
        asOfDate: new Date("2026-06-01"),
      },
      writeContext
    );
  }

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-02"),
      status: "present",
      clockInAt: new Date("2026-06-02T09:00:00.000Z"),
      clockOutAt: new Date("2026-06-02T18:00:00.000Z"),
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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-027 persona capability presets cover employee, manager, HR, payroll, and auditor", () => {
  for (const persona of lamPersonaRoleValues) {
    assert.ok(lamPersonaCapabilityPresets[persona].length > 0);
  }

  assert.ok(
    lamPersonaCapabilityPresets.payroll.includes(
      leaveAttendanceManagementCapabilities.payrollReferencesRead
    )
  );
  assert.ok(
    lamPersonaCapabilityPresets.auditor.includes(
      leaveAttendanceManagementCapabilities.auditRead
    )
  );
  assert.ok(
    lamPersonaCapabilityPresets.manager.includes(
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove
    )
  );
});

test("resolveLamDataScope enforces self, team, and company modes", () => {
  assert.deepEqual(resolveLamDataScope(employeeSelfContext), {
    mode: "self",
    employeeId: "emp-001",
  });
  assert.deepEqual(resolveLamDataScope(managerTeamContext), {
    mode: "team",
    employeeIds: ["emp-001", "emp-002"],
  });
  assert.deepEqual(resolveLamDataScope(writeContext), { mode: "company" });
  assert.deepEqual(resolveLamDataScope(payrollContext), { mode: "company" });
  assert.deepEqual(resolveLamDataScope({}), { mode: "denied" });
  assert.deepEqual(resolveLamDataScope(auditorContext), { mode: "denied" });
  assert.deepEqual(resolveLamReadDataScope(auditorContext), { mode: "company" });
});

test("resolveLamDataScope fails closed for capabilities without canRead or canWrite", () => {
  assert.deepEqual(
    resolveLamDataScope({
      companyId: "company-001",
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveApplicationsRead,
      ],
    }),
    { mode: "denied" }
  );
});

test("resolveLamDataScope grants company read when canRead is paired with read capabilities", () => {
  assert.deepEqual(
    resolveLamDataScope({
      companyId: "company-001",
      canRead: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceRead,
      ],
    }),
    { mode: "company" }
  );
});

test("HRM-LAM-027 sensitive read gates require explicit capabilities", () => {
  const genericReadContext = {
    companyId: "company-001",
    canRead: true,
  } as const;

  assert.equal(canReadLamAuditTrail(genericReadContext), false);
  assert.equal(canReadLamReports(genericReadContext), false);
  assert.equal(canReadLamPayrollReferences(genericReadContext), false);
  assert.equal(canReadLamAuditTrail(auditorContext), true);
  assert.equal(canReadLamReports(payrollContext), true);
  assert.equal(canReadLamPayrollReferences(payrollContext), true);
});

test("AC-023 employee self-scope cannot read another employee attendance records", async () => {
  const ownRecords = await listLamAttendanceRecordsRecords(
    {},
    employeeSelfContext
  );
  assert.equal(ownRecords.length, 1);
  assert.equal(ownRecords[0]?.employeeId, "emp-001");

  const denied = await listLamAttendanceRecordsRecords(
    { employeeId: "emp-002" },
    employeeSelfContext
  );
  assert.deepEqual(denied, []);

  const otherOwnRecords = await listLamAttendanceRecordsRecords(
    { employeeId: "emp-002" },
    employeeOtherContext
  );
  assert.equal(otherOwnRecords.length, 1);
  assert.equal(otherOwnRecords[0]?.employeeId, "emp-002");
});

test("AC-022 manager team-scope can read team attendance but not outside team", async () => {
  const teamRecords = await listLamAttendanceRecordsRecords(
    {},
    managerTeamContext
  );
  assert.equal(teamRecords.length, 2);

  assert.equal(canAccessLamEmployeeRecord(managerTeamContext, "emp-001"), true);
  assert.equal(
    canAccessLamEmployeeRecord(managerTeamContext, "emp-999"),
    false
  );
});

test("AC-023 resolveLamReadDataScope denies manager capabilities without team employee ids", () => {
  assert.deepEqual(
    resolveLamReadDataScope({
      companyId: "company-001",
      grantedCapabilities: lamPersonaCapabilityPresets.manager,
    }),
    { mode: "denied" }
  );

  assert.deepEqual(
    resolveLamDataScope({
      companyId: "company-001",
      grantedCapabilities: lamPersonaCapabilityPresets.manager,
    }),
    { mode: "denied" }
  );

  assert.deepEqual(resolveLamReadDataScope(managerTeamContext), {
    mode: "team",
    employeeIds: ["emp-001", "emp-002"],
  });

  assert.deepEqual(resolveLamDataScope(managerTeamContext), {
    mode: "team",
    employeeIds: ["emp-001", "emp-002"],
  });
});

test("AC-023 manager persona cannot upsert leave types without HR config write capability", async () => {
  const result = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MGR-DENIED",
      name: "Manager Denied Leave",
      kind: "annual",
      paid: true,
      requiresDocument: false,
      active: true,
    },
    {
      companyId: "company-001",
      grantedCapabilities: lamPersonaCapabilityPresets.manager,
    }
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Leave types write access denied/i);
  }
});

test("AC-022 manager team-scope can read team leave applications for leave calendar view", async () => {
  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Team member leave",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-03"),
      endDate: new Date("2026-07-04"),
      totalDays: 2,
      reason: "Other team member leave",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-999",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-05"),
      endDate: new Date("2026-07-06"),
      totalDays: 2,
      reason: "Outside team leave",
    },
    writeContext
  );

  const teamApplications = await listLamLeaveApplicationsRecords(
    {},
    managerTeamContext
  );
  assert.equal(teamApplications.length, 2);
  assert.deepEqual(teamApplications.map((entry) => entry.employeeId).sort(), [
    "emp-001",
    "emp-002",
  ]);

  const calendarWindow = await listLamLeaveApplicationsRecords(
    {
      startDateFrom: new Date("2026-07-01"),
      startDateTo: new Date("2026-07-02"),
    },
    managerTeamContext
  );
  assert.equal(calendarWindow.length, 1);
  assert.equal(calendarWindow[0]?.employeeId, "emp-001");

  const denied = await listLamLeaveApplicationsRecords(
    { employeeId: "emp-999" },
    managerTeamContext
  );
  assert.deepEqual(denied, []);
});

test("AC-022 manager team-scope reads team attendance exceptions only", async () => {
  const teamExceptions = await listLamAttendanceExceptionsRecords(
    {},
    managerTeamContext
  );
  assert.equal(teamExceptions.length, 1);
  assert.equal(teamExceptions[0]?.employeeId, "emp-002");
  assert.equal(teamExceptions[0]?.exceptionType, "absence");

  const denied = await listLamAttendanceExceptionsRecords(
    { employeeId: "emp-999" },
    managerTeamContext
  );
  assert.deepEqual(denied, []);
});

test("AC-023 payroll and auditor personas retain company-wide read without write", () => {
  assert.equal(canAccessLamEmployeeRecord(payrollContext, "emp-002"), true);
  assert.equal(canAccessLamEmployeeRecord(auditorContext, "emp-002"), true);

  const scoped = filterByEmployeeDataScope(
    [
      { employeeId: "emp-001" },
      { employeeId: "emp-002" },
      { employeeId: "emp-999" },
    ],
    payrollContext
  );
  assert.equal(scoped.length, 3);
});

test("AC-023 empty context resolves to denied scope and returns no records", async () => {
  assert.deepEqual(resolveLamReadDataScope({}), { mode: "denied" });

  const records = await listLamAttendanceRecordsRecords(
    {},
    { companyId: "company-001" }
  );
  assert.deepEqual(records, []);
});

test("AC-023 generic canRead does not grant audit trail access", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-20"),
      status: "present",
    },
    writeContext
  );

  assert.equal(
    (
      await listLamAuditTrailRecords(
        {},
        {
          companyId: "company-001",
          canRead: true,
          grantedCapabilities: [
            leaveAttendanceManagementCapabilities.attendanceRead,
          ],
        }
      )
    ).length,
    0
  );

  assert.equal(
    canReadLamAuditTrail({ companyId: "company-001", canRead: true }),
    false
  );
  assert.equal(canReadLamAuditTrail(auditorContext), true);
});

test("AC-023 payroll persona cannot submit leave applications", async () => {
  const result = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
    },
    payrollContext
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Write access denied/i);
  }
});

test("AC-023 auditor persona cannot upsert attendance records", async () => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-21"),
      status: "present",
    },
    auditorContext
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Attendance write access denied/i);
  }
});

test("AC-023 employee cannot submit leave for another employee", async () => {
  const result = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
    },
    {
      ...employeeSelfContext,
      canWrite: true,
    }
  );

  assert.equal(result.ok, false);
});

test("AC-006 employee submits own leave application online with persona write capability", async () => {
  const result = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Personal leave",
    },
    employeeSelfContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected employee self-service submit to succeed");
  }

  const applications = await listLamLeaveApplicationsRecords(
    {},
    employeeSelfContext
  );
  assert.equal(applications.length, 1);
  assert.equal(applications[0]?.employeeId, "emp-001");
  assert.equal(applications[0]?.status, "submitted");
  assert.ok(applications[0]?.submittedAt);
});

test("AC-021 employee self-scope lists only own leave applications", async () => {
  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Own leave",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-03"),
      endDate: new Date("2026-07-04"),
      totalDays: 2,
      reason: "Other employee leave",
    },
    writeContext
  );

  const ownApplications = await listLamLeaveApplicationsRecords(
    {},
    employeeSelfContext
  );
  assert.equal(ownApplications.length, 1);
  assert.equal(ownApplications[0]?.employeeId, "emp-001");

  const denied = await listLamLeaveApplicationsRecords(
    { employeeId: "emp-002" },
    employeeSelfContext
  );
  assert.deepEqual(denied, []);
});

test("AC-021 employee self-scope lists only own leave balances", async () => {
  const ownBalances = await listLamLeaveBalancesRecords(
    { periodYear: 2026 },
    employeeSelfContext
  );
  assert.equal(ownBalances.length, 1);
  assert.equal(ownBalances[0]?.employeeId, "emp-001");

  const denied = await listLamLeaveBalancesRecords(
    { employeeId: "emp-002", periodYear: 2026 },
    employeeSelfContext
  );
  assert.deepEqual(denied, []);
});

test("AC-021 employee self-scope lists only own attendance summary", async () => {
  const ownSummary = await listLamAttendanceSummaryRecords(
    { periodStart, periodEnd },
    employeeSelfContext
  );
  assert.equal(ownSummary.length, 1);
  assert.equal(ownSummary[0]?.employeeId, "emp-001");
  assert.equal(ownSummary[0]?.daysWorked, 1);
  assert.equal(ownSummary[0]?.absentDays, 0);

  const denied = await listLamAttendanceSummaryRecords(
    { employeeId: "emp-002", periodStart, periodEnd },
    employeeSelfContext
  );
  assert.deepEqual(denied, []);
});

test("AC-023 employee self-scope cannot calculate entitlement for another employee", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "AL-SCOPE-TEST",
      title: "Annual Leave Scope Test",
      scope: { countryCode: "MY" },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  const denied = await calculateLamLeaveEntitlement(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      hireDate: new Date("2020-01-15"),
      countryCode: "MY",
      grade: "G5",
      leaveTypeId: annualLeaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    { ...employeeSelfContext, canRead: true }
  );

  assert.deepEqual(denied, []);
});

test("AC-023 manager team-scope can calculate entitlement for team member only", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "AL-MGR-SCOPE",
      title: "Annual Leave Manager Scope",
      scope: { countryCode: "MY" },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  const teamResult = await calculateLamLeaveEntitlement(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      hireDate: new Date("2020-01-15"),
      countryCode: "MY",
      grade: "G5",
      leaveTypeId: annualLeaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    { ...managerTeamContext, canRead: true }
  );
  assert.equal(teamResult.length, 1);

  const denied = await calculateLamLeaveEntitlement(
    {
      companyId: "company-001",
      employeeId: "emp-999",
      hireDate: new Date("2020-01-15"),
      countryCode: "MY",
      grade: "G5",
      leaveTypeId: annualLeaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    { ...managerTeamContext, canRead: true }
  );
  assert.deepEqual(denied, []);

  const applyDenied = await applyLamLeaveEntitlementCalculation(
    {
      companyId: "company-001",
      employeeId: "emp-999",
      hireDate: new Date("2020-01-15"),
      countryCode: "MY",
      grade: "G5",
      leaveTypeId: annualLeaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    {
      companyId: "company-001",
      grantedCapabilities: lamPersonaCapabilityPresets.manager,
      teamEmployeeIds: ["emp-001"],
    }
  );
  assert.equal(applyDenied.ok, false);
});
