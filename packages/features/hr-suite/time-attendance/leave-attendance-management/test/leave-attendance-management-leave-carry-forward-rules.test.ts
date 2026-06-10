import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { processLamLeaveBalanceCarryForward } from "../src/actions/leave-balance-carry-forward.action.ts";
import { upsertLamLeaveCarryForwardRule } from "../src/actions/leave-carry-forward-rules.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  leaveAttendanceManagementAuditEvents,
  listLamLeaveCarryForwardRulesQuerySchema,
} from "../src/contracts/index.ts";
import {
  projectLeaveBalanceCarryForward,
  selectApplicableCarryForwardRule,
} from "../src/projector/carry-forward.ts";
import { listLamLeaveBalancesRecords } from "../src/queries/leave-balances.query.ts";
import {
  getLamLeaveCarryForwardRuleById,
  listLamLeaveCarryForwardRulesRecords,
} from "../src/queries/leave-carry-forward-rules.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamEmployeeEntitlementProfileSchema,
  lamLeaveBalanceSchema,
  lamLeaveCarryForwardRuleSchema,
} from "../src/schema.ts";

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
  ],
} as const;

const balanceWriteContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveBalancesWrite,
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
    `afenda-lam-carry-forward-rules-${randomUUID()}.json`
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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-019 upsertLamLeaveCarryForwardRule creates, updates, and lists scoped rules with audit trail", async () => {
  const created = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-STD",
      title: "Standard Carry Forward",
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2026-01-01"),
      scope: {
        countryCode: "MY",
        legalEntityCode: "ACME-MY",
        workLocationCode: "KL-HQ",
        employmentType: "permanent",
        grade: "G5",
        policyGroupId: "policy-group-001",
      },
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamLeaveCarryForwardRule(
    {
      id: created.targetId,
      companyId: "company-001",
      leaveTypeId,
      code: "CF-STD",
      title: "Standard Carry Forward (Revised)",
      maxCarryForwardDays: 7,
      forfeitUnused: false,
      effectiveFrom: new Date("2026-01-01"),
      scope: {
        countryCode: "MY",
        legalEntityCode: "ACME-MY",
        grade: "G5",
      },
    },
    writeContext
  );

  assert.equal(updated.ok, true);

  const listed = await listLamLeaveCarryForwardRulesRecords(
    {
      legalEntityCode: "ACME-MY",
      countryCode: "MY",
      grade: "G5",
    },
    readContext
  );

  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.maxCarryForwardDays, 7);
  assert.equal(listed[0]?.forfeitUnused, false);

  const fetched = await getLamLeaveCarryForwardRuleById(
    created.targetId,
    readContext
  );
  assert.equal(fetched?.title, "Standard Carry Forward (Revised)");

  const state = await loadLamRepository(writeContext);
  assert.equal(state.auditEvents.length, 3);
  assert.equal(
    state.auditEvents[1]?.action,
    leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleCreated
  );
  assert.equal(
    state.auditEvents[2]?.action,
    leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleUpdated
  );
});

test("upsertLamLeaveCarryForwardRule rejects duplicate codes and missing leave types", async () => {
  const first = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-MGR",
      title: "Manager Carry Forward",
      maxCarryForwardDays: 10,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const duplicate = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "cf-mgr",
      title: "Duplicate Code",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) {
    assert.match(duplicate.error, /already exists/i);
  }

  const missingLeaveType = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId: randomUUID(),
      code: "CF-NEW",
      title: "Missing Leave Type",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(missingLeaveType.ok, false);
  if (!missingLeaveType.ok) {
    assert.match(missingLeaveType.error, /Leave type/i);
  }
});

test("upsertLamLeaveCarryForwardRule validates effective date range and write access", async () => {
  const invalidDates = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-INVALID-DATES",
      title: "Invalid Dates",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2026-12-31"),
      effectiveTo: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(invalidDates.ok, false);
  if (!invalidDates.ok) {
    assert.match(invalidDates.error, /effectiveTo must be after effectiveFrom/);
  }

  const denied = await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-DENY",
      title: "Denied Rule",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2026-01-01"),
    },
    { ...writeContext, canWrite: false }
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.match(denied.error, /Write access denied/i);
  }
});

test("leave carry-forward rule queries fail closed without read access", async () => {
  await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-READ",
      title: "Read Guard",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(
    (await listLamLeaveCarryForwardRulesRecords({}, undefined)).length,
    0
  );
  assert.equal(
    await getLamLeaveCarryForwardRuleById("missing", {
      companyId: "company-001",
    }),
    null
  );
});

test("listLamLeaveCarryForwardRulesQuerySchema supports scope and effectiveOn filters", () => {
  const parsed = listLamLeaveCarryForwardRulesQuerySchema.parse({
    leaveTypeId,
    countryCode: "MY",
    legalEntityCode: "ACME-MY",
    workLocationCode: "KL-HQ",
    employmentType: "permanent",
    grade: "G5",
    policyGroupId: "policy-group-001",
    departmentId: "dept-hr",
    active: true,
    effectiveOn: new Date("2026-06-01"),
    page: 1,
    pageSize: 25,
  });

  assert.equal(parsed.legalEntityCode, "ACME-MY");
  assert.equal(parsed.effectiveOn?.toISOString(), "2026-06-01T00:00:00.000Z");

  const record = lamLeaveCarryForwardRuleSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    leaveTypeId,
    code: "CF-FILTER",
    title: "Filtered Rule",
    scope: {
      countryCode: "MY",
      legalEntityCode: "ACME-MY",
      grade: "G5",
    },
    maxCarryForwardDays: 5,
    forfeitUnused: true,
    effectiveFrom: new Date("2026-01-01"),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(record.scope?.legalEntityCode, "ACME-MY");
});

test("listLamLeaveCarryForwardRulesRecords filters by effectiveOn date", async () => {
  await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-PAST",
      title: "Past Rule",
      maxCarryForwardDays: 3,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      active: true,
    },
    writeContext
  );

  await upsertLamLeaveCarryForwardRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "CF-CURRENT",
      title: "Current Rule",
      maxCarryForwardDays: 5,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: null,
      active: true,
    },
    writeContext
  );

  const effectiveRules = await listLamLeaveCarryForwardRulesRecords(
    { effectiveOn: new Date("2026-06-01") },
    readContext
  );

  assert.ok(effectiveRules.some((entry) => entry.code === "CF-CURRENT"));
  assert.equal(
    effectiveRules.some((entry) => entry.code === "CF-PAST"),
    false
  );
});

test("AC-016 projector excludes inactive, expired, and scope-mismatched rules", () => {
  const employee = lamEmployeeEntitlementProfileSchema.parse(employeeProfile);
  const asOfDate = new Date("2026-01-01");

  const rules = [
    {
      id: "cf-inactive",
      companyId: "company-001",
      leaveTypeId,
      code: "CF-INACTIVE",
      title: "Inactive",
      scope: { countryCode: "MY" },
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cf-expired",
      companyId: "company-001",
      leaveTypeId,
      code: "CF-EXPIRED",
      title: "Expired",
      scope: { countryCode: "MY" },
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2025-06-30"),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cf-wrong-grade",
      companyId: "company-001",
      leaveTypeId,
      code: "CF-WRONG-GRADE",
      title: "Wrong Grade",
      scope: { countryCode: "MY", grade: "G7" },
      maxCarryForwardDays: 5,
      forfeitUnused: true,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as const;

  assert.equal(
    selectApplicableCarryForwardRule({
      asOfDate,
      employee,
      leaveTypeId,
      rules,
    }),
    null
  );

  const projection = projectLeaveBalanceCarryForward({
    asOfDate,
    employee,
    leaveTypeId,
    previousBalance: lamLeaveBalanceSchema.parse({
      id: randomUUID(),
      companyId: "company-001",
      employeeId: employee.employeeId,
      leaveTypeId,
      periodYear: 2025,
      openingBalance: 0,
      earned: 18,
      used: 0,
      pending: 0,
      adjusted: 0,
      forfeited: 0,
      carriedForward: 0,
      remaining: 18,
      updatedAt: new Date(),
    }),
    rules,
    sourcePeriodYear: 2025,
    targetPeriodYear: 2026,
  });

  assert.equal(projection.matched, false);
  assert.equal(projection.carryForwardDays, 0);
  assert.equal(projection.forfeitDays, 18);
});

test("AC-016 carry-forward skips target balance and audit when carryForwardDays is zero", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY-G5",
      title: "Annual Leave MY G5",
      scope: { countryCode: "MY", grade: "G5" },
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
      code: "CF-NO-CARRY",
      title: "No Carry Policy",
      scope: { countryCode: "MY", grade: "G5" },
      maxCarryForwardDays: 0,
      forfeitUnused: false,
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
    },
    writeContext
  );

  const beforeState = await loadLamRepository(readContext);
  const auditCountBefore = beforeState.auditEvents.length;

  const result = await processLamLeaveBalanceCarryForward(
    {
      ...employeeProfile,
      leaveTypeId,
      sourcePeriodYear: 2025,
      targetPeriodYear: 2026,
      asOfDate: new Date("2026-01-01"),
    },
    balanceWriteContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected carry-forward to succeed");
  }
  assert.equal(result.result.matched, true);
  assert.equal(result.result.carryForwardDays, 0);
  assert.equal(result.result.forfeitDays, 0);
  assert.equal(result.targetId, null);

  const targetBalances = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(targetBalances.length, 0);

  const afterState = await loadLamRepository(readContext);
  const targetAudits = afterState.auditEvents.filter(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.targetPeriodYear === 2026
  );
  assert.equal(targetAudits.length, 0);
  assert.equal(
    afterState.auditEvents.length,
    auditCountBefore,
    "No balance audit events when carryForwardDays is zero"
  );
});

test("AC-016 carry-forward with no matching rule forfeits source without creating target", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY-G5",
      title: "Annual Leave MY G5",
      scope: { countryCode: "MY", grade: "G5" },
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
      periodYear: 2025,
      asOfDate: new Date("2025-12-31"),
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
    balanceWriteContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected carry-forward to succeed");
  }
  assert.equal(result.result.matched, false);
  assert.equal(result.result.carryForwardDays, 0);
  assert.equal(result.result.forfeitDays, 18);
  assert.equal(result.targetId, null);

  const source = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2025,
    },
    readContext
  );
  assert.equal(source[0]?.forfeited, 18);
  assert.equal(source[0]?.remaining, 0);

  const target = await listLamLeaveBalancesRecords(
    {
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
    },
    readContext
  );
  assert.equal(target.length, 0);
});
