import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  calculateLamLeaveEntitlementInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../src/contracts/index.ts";
import {
  computeTenureMonths,
  matchesEntitlementRuleScope,
  matchesEntitlementRuleTenure,
  projectLeaveEntitlementCalculation,
  selectApplicableEntitlementRule,
} from "../src/projector/entitlement.ts";
import { calculateLamLeaveEntitlement } from "../src/queries/leave-entitlement-calculation.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamAccrualRuleSchema,
  lamEmployeeEntitlementProfileSchema,
  lamEntitlementCalculationResultSchema,
} from "../src/schema.ts";
import { lamEntitlementScopeFieldLabels } from "../src/shared/entitlement-scope.ts";

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
    leaveAttendanceManagementCapabilities.leaveEntitlementsRead,
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
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

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-entitlement-calc-${randomUUID()}.json`
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

  const rule = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY-G5",
      title: "Annual Leave MY G5",
      scope: {
        countryCode: "MY",
        legalEntityCode: "MY-ENTITY",
        workLocationCode: "KL",
        employmentType: "permanent",
        grade: "G5",
        policyGroupId: "pg-default",
        departmentId: "dept-hr",
      },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      tenureMonthsMin: 12,
      tenureMonthsMax: 120,
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );
  assert.equal(rule.ok, true);
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-005 accrual rule schema supports annual, monthly, and hire-date prorata modes", () => {
  assert.equal(lamAccrualRuleSchema.parse("annual_grant"), "annual_grant");
  assert.equal(
    lamAccrualRuleSchema.parse("monthly_accrual"),
    "monthly_accrual"
  );
  assert.equal(
    lamAccrualRuleSchema.parse("hire_date_prorata"),
    "hire_date_prorata"
  );
});

test("HRM-LAM-005 projector matches employee profile to configured entitlement rule", () => {
  const state = {
    rules: [
      {
        id: "rule-broad",
        companyId: "company-001",
        leaveTypeId: "lt-1",
        code: "BROAD",
        title: "Broad",
        scope: { countryCode: "MY" },
        entitlementDays: 12,
        accrualRule: "annual_grant" as const,
        tenureMonthsMin: null,
        tenureMonthsMax: null,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "rule-specific",
        companyId: "company-001",
        leaveTypeId: "lt-1",
        code: "SPECIFIC",
        title: "Specific",
        scope: {
          countryCode: "MY",
          legalEntityCode: "MY-ENTITY",
          grade: "G5",
        },
        entitlementDays: 18,
        accrualRule: "annual_grant" as const,
        tenureMonthsMin: null,
        tenureMonthsMax: null,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const matched = selectApplicableEntitlementRule({
    asOfDate: new Date("2026-06-01"),
    employee,
    leaveTypeId: "lt-1",
    rules: state.rules,
  });

  assert.equal(matched?.id, "rule-specific");
  assert.equal(matched?.entitlementDays, 18);
});

test("HRM-LAM-005 projector calculates annual grant entitlement days", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const result = projectLeaveEntitlementCalculation({
    asOfDate: new Date("2026-06-01"),
    employee,
    leaveTypeId,
    periodYear: 2026,
    rules: [
      {
        id: "rule-1",
        companyId: "company-001",
        leaveTypeId,
        code: "AL-MY-G5",
        title: "Annual Leave MY G5",
        scope: employeeProfile,
        entitlementDays: 18,
        accrualRule: "annual_grant",
        tenureMonthsMin: 12,
        tenureMonthsMax: null,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  lamEntitlementCalculationResultSchema.parse(result);
  assert.equal(result.matched, true);
  assert.equal(result.earnedDays, 18);
  assert.equal(result.entitlementDays, 18);
  assert.equal(
    result.tenureMonths,
    computeTenureMonths(employee.hireDate, result.asOfDate)
  );
});

test("HRM-LAM-005 projector applies monthly accrual rule", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const asOfDate = new Date("2026-06-15");
  const result = projectLeaveEntitlementCalculation({
    asOfDate,
    employee,
    leaveTypeId,
    periodYear: 2026,
    rules: [
      {
        id: "rule-monthly",
        companyId: "company-001",
        leaveTypeId,
        code: "AL-MONTHLY",
        title: "Monthly Accrual",
        scope: { countryCode: "MY" },
        entitlementDays: 12,
        accrualRule: "monthly_accrual",
        tenureMonthsMin: null,
        tenureMonthsMax: null,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  assert.equal(result.matched, true);
  assert.equal(result.earnedDays, 6);
});

test("HRM-LAM-005 calculate query returns entitlement projection from repository rules", async () => {
  const calculations = await calculateLamLeaveEntitlement(
    calculateLamLeaveEntitlementInputSchema.parse({
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      legalEntityCode: employeeProfile.legalEntityCode,
      workLocationCode: employeeProfile.workLocationCode,
      employmentType: employeeProfile.employmentType,
      grade: employeeProfile.grade,
      policyGroupId: employeeProfile.policyGroupId,
      departmentId: employeeProfile.departmentId,
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    }),
    readContext
  );

  assert.equal(calculations.length, 1);
  assert.equal(calculations[0]?.matched, true);
  assert.equal(calculations[0]?.earnedDays, 18);
});

test("HRM-LAM-005 apply action persists earned leave balance and audit event", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      legalEntityCode: employeeProfile.legalEntityCode,
      workLocationCode: employeeProfile.workLocationCode,
      employmentType: employeeProfile.employmentType,
      grade: employeeProfile.grade,
      policyGroupId: employeeProfile.policyGroupId,
      departmentId: employeeProfile.departmentId,
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected apply to succeed");
  }

  assert.equal(result.calculations.length, 1);
  assert.equal(result.calculations[0]?.earnedDays, 18);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );

  assert.ok(balance);
  assert.equal(balance?.earned, 18);
  assert.equal(balance?.remaining, 18);

  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveEntitlementCalculated
  );
  assert.ok(audit);
  assert.equal(audit?.entityType, "leave_balance");
});

test("HRM-LAM-005 apply action fails closed without write access", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      leaveTypeId,
    },
    { companyId: "company-001", canWrite: false }
  );

  assert.equal(result.ok, false);
});

test("HRM-LAM-005 apply returns null targetId when no entitlement rule matches", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      countryCode: "SG",
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected apply to succeed with no matches");
  }
  assert.equal(result.targetId, null);
  assert.equal(result.calculations[0]?.matched, false);
});

test("HRM-LAM-005 calculate query fails closed without read access", async () => {
  const calculations = await calculateLamLeaveEntitlement(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      leaveTypeId,
    },
    { companyId: "company-001", canRead: false }
  );

  assert.equal(calculations.length, 0);
});

test("HRM-LAM-005 projector applies hire-date prorata with day-accurate month fraction", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse({
    ...employeeProfile,
    hireDate: new Date("2026-01-16"),
  });
  const result = projectLeaveEntitlementCalculation({
    asOfDate: new Date("2026-12-31"),
    employee,
    leaveTypeId,
    periodYear: 2026,
    rules: [
      {
        id: "rule-prorata",
        companyId: "company-001",
        leaveTypeId,
        code: "AL-PRORATA",
        title: "Prorata",
        scope: { countryCode: "MY" },
        entitlementDays: 12,
        accrualRule: "hire_date_prorata",
        tenureMonthsMin: null,
        tenureMonthsMax: null,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  assert.equal(result.matched, true);
  assert.equal(result.earnedDays, 11.52);
});

test("AC-004 entitlement scope field labels map employee category to employmentType", () => {
  assert.equal(
    lamEntitlementScopeFieldLabels.employmentType,
    "Employee Category"
  );
  assert.equal(lamEntitlementScopeFieldLabels.grade, "Grade");
  assert.equal(lamEntitlementScopeFieldLabels.countryCode, "Country");
  assert.equal(lamEntitlementScopeFieldLabels.legalEntityCode, "Legal Entity");
  assert.equal(lamEntitlementScopeFieldLabels.workLocationCode, "Location");
});

test("AC-004 matchesEntitlementRuleScope rejects each mismatched dimension", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const fullScope = {
    countryCode: "MY",
    legalEntityCode: "MY-ENTITY",
    workLocationCode: "KL",
    employmentType: "permanent",
    grade: "G5",
  };

  assert.equal(matchesEntitlementRuleScope(employee, fullScope), true);
  assert.equal(
    matchesEntitlementRuleScope(employee, {
      ...fullScope,
      employmentType: "contract",
    }),
    false
  );
  assert.equal(
    matchesEntitlementRuleScope(employee, { ...fullScope, grade: "G6" }),
    false
  );
  assert.equal(
    matchesEntitlementRuleScope(employee, {
      ...fullScope,
      workLocationCode: "JB",
    }),
    false
  );
  assert.equal(
    matchesEntitlementRuleScope(employee, {
      ...fullScope,
      legalEntityCode: "SG-ENTITY",
    }),
    false
  );
  assert.equal(
    matchesEntitlementRuleScope(employee, { ...fullScope, countryCode: "SG" }),
    false
  );
});

test("AC-004 matchesEntitlementRuleTenure rejects tenure below minimum", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse({
    ...employeeProfile,
    hireDate: new Date("2026-01-15"),
  });
  const rule = {
    id: "rule-tenure",
    companyId: "company-001",
    leaveTypeId,
    code: "AL-TENURE",
    title: "Tenure Bound",
    scope: { countryCode: "MY" },
    entitlementDays: 18,
    accrualRule: "annual_grant" as const,
    tenureMonthsMin: 12,
    tenureMonthsMax: null,
    effectiveFrom: new Date("2024-01-01"),
    effectiveTo: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const asOfDate = new Date("2026-06-01");
  assert.ok(computeTenureMonths(employee.hireDate, asOfDate) < 12);
  assert.equal(matchesEntitlementRuleTenure(employee, rule, asOfDate), false);
});

test("AC-004 calculate rejects entitlement when employee grade does not match rule scope", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      grade: "G6",
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.equal(result.calculations[0]?.matched, false);
});

test("AC-004 calculate rejects entitlement when employee category does not match rule scope", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      employmentType: "contract",
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.equal(result.calculations[0]?.matched, false);
});

test("AC-004 calculate rejects entitlement when employee location does not match rule scope", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      workLocationCode: "JB",
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.equal(result.calculations[0]?.matched, false);
});

test("AC-004 calculate rejects entitlement when legal entity does not match rule scope", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      legalEntityCode: "SG-ENTITY",
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.equal(result.calculations[0]?.matched, false);
});

test("AC-004 calculate rejects entitlement when tenure is below rule minimum", async () => {
  const result = await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      hireDate: new Date("2026-01-15"),
      leaveTypeId,
      asOfDate: new Date("2026-06-01"),
      periodYear: 2026,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  assert.equal(result.calculations[0]?.matched, false);
});
