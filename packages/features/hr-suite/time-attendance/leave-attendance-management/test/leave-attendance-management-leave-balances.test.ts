import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { adjustLamLeaveBalance } from "../src/actions/leave-balance-adjustment.action.ts";
import { processLamLeaveBalanceCarryForward } from "../src/actions/leave-balance-carry-forward.action.ts";
import { upsertLamLeaveCarryForwardRule } from "../src/actions/leave-carry-forward-rules.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  projectLeaveBalanceCarryForward,
  selectApplicableCarryForwardRule,
} from "../src/projector/carry-forward.ts";
import {
  getLamLeaveBalanceById,
  listLamLeaveBalancesRecords,
} from "../src/queries/leave-balances.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamEmployeeEntitlementProfileSchema,
  lamLeaveBalanceSchema,
} from "../src/schema.ts";
import {
  computeRemainingBalance,
  lamLeaveBalanceFieldLabels,
} from "../src/shared/balance.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
    leaveAttendanceManagementCapabilities.leaveEntitlementsRead,
  ],
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

const employeeProfile = {
  companyId: "company-001",
  employeeId: "emp-001",
  hireDate: new Date("2020-01-15"),
  countryCode: "MY",
  legalEntityCode: "MY-ENTITY",
  workLocationCode: "KL",
  employmentType: "permanent",
  grade: "G5",
  policyGroupId: "pg-default",
  departmentId: "dept-hr",
} as const;

const submitProfile = { ...employeeProfile } as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-balances-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

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
      code: "AL-MY-G5",
      title: "Annual Leave MY G5",
      scope: {
        countryCode: "MY",
        grade: "G5",
      },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-MY-G5",
      title: "Carry Forward MY G5",
      scope: { countryCode: "MY", grade: "G5" },
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      active: true,
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

test("HRM-LAM-006 leave balance schema maintains all ledger fields", () => {
  const balance = lamLeaveBalanceSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    employeeId: "emp-001",
    leaveTypeId: "lt-1",
    periodYear: 2026,
    openingBalance: 0,
    earned: 18,
    used: 4,
    pending: 2,
    adjusted: 1,
    forfeited: 1,
    carriedForward: 3,
    remaining: computeRemainingBalance({
      openingBalance: 0,
      earned: 18,
      used: 4,
      pending: 2,
      adjusted: 1,
      forfeited: 1,
      carriedForward: 3,
    }),
    updatedAt: new Date(),
  });

  assert.equal(balance.remaining, 15);
});

test("HRM-LAM-006 listLamLeaveBalancesRecords returns ledger with all balance fields", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  const balances = await listLamLeaveBalancesRecords(
    { employeeId: employeeProfile.employeeId, periodYear: 2026 },
    readContext
  );

  assert.equal(balances.length, 1);
  const balance = balances[0];
  assert.equal(balance?.earned, 18);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.adjusted, 0);
  assert.equal(balance?.forfeited, 0);
  assert.equal(balance?.carriedForward, 0);
  assert.equal(balance?.remaining, 18);
});

test("AC-005 lamLeaveBalanceFieldLabels exposes all seven ledger components", () => {
  assert.equal(lamLeaveBalanceFieldLabels.earned, "Earned");
  assert.equal(lamLeaveBalanceFieldLabels.used, "Used");
  assert.equal(lamLeaveBalanceFieldLabels.pending, "Pending");
  assert.equal(lamLeaveBalanceFieldLabels.adjusted, "Adjusted");
  assert.equal(lamLeaveBalanceFieldLabels.carriedForward, "Carried Forward");
  assert.equal(lamLeaveBalanceFieldLabels.forfeited, "Forfeited");
  assert.equal(lamLeaveBalanceFieldLabels.remaining, "Remaining");
});

test("AC-005 end-to-end ledger shows earned, used, pending, adjusted, and remaining", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  const submitted = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Annual leave",
    },
    writeContext
  );
  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("Expected submit to succeed");
  }

  let balance = (
    await listLamLeaveBalancesRecords(
      { employeeId: employeeProfile.employeeId, periodYear: 2026 },
      readContext
    )
  )[0];
  assert.equal(balance?.earned, 18);
  assert.equal(balance?.pending, 3);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 15);

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submitted.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Goodwill adjustment",
      authorizedBy: "hr-director",
    },
    writeContext
  );

  balance = await getLamLeaveBalanceById(balance?.id ?? "", readContext);
  assert.ok(balance);
  assert.equal(balance.earned, 18);
  assert.equal(balance.used, 3);
  assert.equal(balance.pending, 0);
  assert.equal(balance.adjusted, 1);
  assert.equal(balance.forfeited, 0);
  assert.equal(balance.carriedForward, 0);
  assert.equal(balance.remaining, 16);
});

test("AC-015 manual leave balance adjustment requires authorization and reason", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const result = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 2,
      reason: "Correction for payroll reconciliation",
      authorizedBy: "hr-director",
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected adjustment to succeed");
  }

  const balance = await getLamLeaveBalanceById(result.targetId, readContext);
  assert.equal(balance?.adjusted, 2);
  assert.equal(balance?.remaining, 20);

  const state = await loadLamRepository(readContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.entityId === result.targetId
  );
  assert.ok(audit);
  assert.equal(audit?.entityType, "leave_adjustment");
  assert.equal(audit?.reason, "Correction for payroll reconciliation");
  assert.equal(audit?.metadata.authorizedBy, "hr-director");
  assert.equal(audit?.metadata.reason, "Correction for payroll reconciliation");
  assert.equal(audit?.metadata.adjustmentDays, 2);
  assert.equal(audit?.after?.adjusted, 2);
});

test("AC-015 adjust rejects missing reason and authorization", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const missingReason = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "   ",
      authorizedBy: "hr-director",
    },
    writeContext
  );
  assert.equal(missingReason.ok, false);
  assert.match(missingReason.error ?? "", /adjustment reason is required/i);

  const missingAuthorization = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Valid reason",
      authorizedBy: "   ",
    },
    writeContext
  );
  assert.equal(missingAuthorization.ok, false);
  assert.match(
    missingAuthorization.error ?? "",
    /adjustment authorization is required/i
  );

  const zeroAdjustment = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 0,
      reason: "Valid reason",
      authorizedBy: "hr-director",
    },
    writeContext
  );
  assert.equal(zeroAdjustment.ok, false);
  assert.match(zeroAdjustment.error ?? "", /adjustmentDays must be non-zero/i);
});

test("AC-015 adjust succeeds with leaveBalancesWrite capability only", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const result = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Capability-only adjustment",
      authorizedBy: "payroll-lead",
    },
    {
      actorId: "payroll-lead",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
      ],
    }
  );
  assert.equal(result.ok, true);
});

test("AC-015 adjust fails closed without balance write access", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const before = await listLamLeaveBalancesRecords({}, readContext);
  assert.equal(before.length, 1);
  const beforeAdjusted = before[0]?.adjusted;

  const result = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Unauthorized attempt",
      authorizedBy: "unknown",
    },
    { companyId: "company-001", canWrite: false }
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected adjust to fail without write access");
  }
  assert.equal(result.error, "Leave balance write access denied");

  const after = await listLamLeaveBalancesRecords({}, readContext);
  assert.equal(after[0]?.adjusted, beforeAdjusted);

  const state = await loadLamRepository(readContext);
  const balanceAudit = state.auditEvents.filter(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.reason === "Unauthorized attempt"
  );
  assert.equal(balanceAudit.length, 0);
});

test("AC-015 adjust fails closed for undefined context", async () => {
  const result = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "No context",
      authorizedBy: "unknown",
    },
    undefined
  );
  assert.equal(result.ok, false);
});

test("AC-015 adjust respects employee mutation scope", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const result = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 1,
      reason: "Cross-employee adjustment attempt",
      authorizedBy: "emp-001",
    },
    {
      actorId: "emp-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      scopedEmployeeId: "emp-001",
      canWrite: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
      ],
    }
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error(
      "Expected scoped employee adjust for another employee to fail"
    );
  }
  assert.match(result.error ?? "", /scope|not permitted|does not match/i);
});

test("AC-016 projector applies maxCarryForwardDays and forfeitUnused policy", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const previousBalance = lamLeaveBalanceSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    employeeId: employee.employeeId,
    leaveTypeId,
    periodYear: 2025,
    openingBalance: 0,
    earned: 18,
    used: 8,
    pending: 0,
    adjusted: 0,
    forfeited: 0,
    carriedForward: 0,
    remaining: 10,
    updatedAt: new Date(),
  });

  const result = projectLeaveBalanceCarryForward({
    asOfDate: new Date("2026-01-01"),
    employee,
    leaveTypeId,
    previousBalance,
    rules: [
      {
        id: "cf-1",
        companyId: "company-001",
        leaveTypeId,
        code: "CF-MY-G5",
        title: "Carry Forward MY G5",
        scope: { countryCode: "MY", grade: "G5" },
        maxCarryForwardDays: 5,
        forfeitUnused: true,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    sourcePeriodYear: 2025,
    targetPeriodYear: 2026,
  });

  assert.equal(result.matched, true);
  assert.equal(result.unusedDays, 10);
  assert.equal(result.carryForwardDays, 5);
  assert.equal(result.forfeitDays, 5);
});

test("AC-016 projector honors forfeitUnused=false and selects most specific rule", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const previousBalance = lamLeaveBalanceSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    employeeId: employee.employeeId,
    leaveTypeId,
    periodYear: 2025,
    openingBalance: 0,
    earned: 18,
    used: 8,
    pending: 0,
    adjusted: 0,
    forfeited: 0,
    carriedForward: 0,
    remaining: 10,
    updatedAt: new Date(),
  });

  const rules = [
    {
      id: "cf-broad",
      companyId: "company-001",
      leaveTypeId,
      code: "CF-MY",
      title: "Carry Forward MY",
      scope: { countryCode: "MY" },
      maxCarryForwardDays: 3,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cf-narrow",
      companyId: "company-001",
      leaveTypeId,
      code: "CF-MY-G5",
      title: "Carry Forward MY G5",
      scope: { countryCode: "MY", grade: "G5" },
      maxCarryForwardDays: 5,
      forfeitUnused: false,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as const;

  const selected = selectApplicableCarryForwardRule({
    asOfDate: new Date("2026-01-01"),
    employee,
    leaveTypeId,
    rules,
  });
  assert.equal(selected?.id, "cf-narrow");

  const result = projectLeaveBalanceCarryForward({
    asOfDate: new Date("2026-01-01"),
    employee,
    leaveTypeId,
    previousBalance,
    rules,
    sourcePeriodYear: 2025,
    targetPeriodYear: 2026,
  });

  assert.equal(result.matched, true);
  assert.equal(result.carryForwardRuleId, "cf-narrow");
  assert.equal(result.carryForwardDays, 5);
  assert.equal(result.forfeitDays, 0);
});

test("AC-016 processLamLeaveBalanceCarryForward persists carry-forward and forfeiture", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
    },
    writeContext
  );

  await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2025,
      adjustmentDays: -8,
      reason: "Simulate used leave for year-end test",
      authorizedBy: "hr-admin",
    },
    writeContext
  );

  const carryForward = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
      asOfDate: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(carryForward.ok, true);
  if (!carryForward.ok) {
    throw new Error("Expected carry-forward to succeed");
  }

  assert.equal(carryForward.result.carryForwardDays, 5);
  assert.equal(carryForward.result.forfeitDays, 5);

  const balances = await listLamLeaveBalancesRecords(
    { employeeId: employeeProfile.employeeId },
    readContext
  );

  const source = balances.find((entry) => entry.periodYear === 2025);
  const target = balances.find((entry) => entry.periodYear === 2026);

  assert.equal(source?.earned, 18);
  assert.equal(source?.adjusted, -13);
  assert.equal(source?.forfeited, 5);
  assert.equal(source?.remaining, 0);
  assert.equal(target?.carriedForward, 5);
  assert.equal(target?.remaining, 5);

  const state = await loadLamRepository(readContext);
  const sourceAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.periodYear === 2025 &&
      entry.metadata.forfeitDays === 5
  );
  assert.ok(sourceAudit);
  const targetAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.targetPeriodYear === 2026 &&
      entry.metadata.carryForwardDays === 5
  );
  assert.ok(targetAudit);
});

test("AC-016 carry-forward fails closed without balance write access", async () => {
  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
    },
    { companyId: "company-001", canWrite: false }
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected carry-forward to fail without write access");
  }
  assert.equal(result.error, "Leave balance write access denied");
});

test("AC-016 carry-forward fails closed for undefined context", async () => {
  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
    },
    undefined
  );
  assert.equal(result.ok, false);
});

test("AC-016 carry-forward succeeds with leaveBalancesWrite capability only", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
    },
    writeContext
  );

  await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2025,
      adjustmentDays: -8,
      reason: "Simulate used leave",
      authorizedBy: "hr-admin",
    },
    writeContext
  );

  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
      asOfDate: new Date("2026-01-01"),
    },
    {
      actorId: "payroll-lead",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
      ],
    }
  );
  assert.equal(result.ok, true);
});

test("AC-016 carry-forward rejects non-balance write capability without canWrite", async () => {
  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
    },
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
      ],
    }
  );
  assert.equal(result.ok, false);
  assert.equal(result.error, "Leave balance write access denied");
});

test("AC-016 carry-forward respects employee mutation scope", async () => {
  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      employeeId: "emp-002",
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
    },
    {
      actorId: "emp-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      scopedEmployeeId: "emp-001",
      canWrite: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
      ],
    }
  );
  assert.equal(result.ok, false);
  assert.equal(
    result.error,
    "Employee data scope access denied for leave and attendance"
  );
});

test("leave balance queries fail closed without read access", async () => {
  assert.equal(
    (await listLamLeaveBalancesRecords({}, { companyId: "company-001" }))
      .length,
    0
  );
  assert.equal(await getLamLeaveBalanceById("missing", readContext), null);
});

test("processLamLeaveBalanceCarryForward writes audit events for source forfeiture and target carry-forward", async () => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
    },
    writeContext
  );

  await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
      asOfDate: new Date("2026-01-01"),
    },
    writeContext
  );

  const state = await loadLamRepository(readContext);
  const balanceUpdates = state.auditEvents.filter(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.leaveBalanceUpdated
  );

  assert.ok(balanceUpdates.length >= 2);
});
