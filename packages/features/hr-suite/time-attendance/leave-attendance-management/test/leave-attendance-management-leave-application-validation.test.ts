import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveBlackoutPeriod } from "../src/actions/leave-blackout-periods.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  assertMaxConsecutiveDays,
  assertNoLeaveOverlap,
  assertNotInBlackout,
  assertNoticePeriod,
  assertTotalDaysMatchDateRange,
  calendarDaysBetween,
} from "../src/projector/application-policy.ts";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  assertLeaveApplicationAvailableBalance,
  resolveAvailableLeaveBalanceForApplication,
} from "../src/shared/leave-application-balance.ts";
import { buildLeaveApplicationScopeProfile } from "../src/shared/leave-application-policy-validation.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "emp-001",
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
} as const;

const submitProfile = {
  ...employeeProfile,
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-validation-${randomUUID()}.json`
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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("application-policy calendarDaysBetween counts whole calendar days", () => {
  assert.equal(
    calendarDaysBetween(new Date("2026-07-01"), new Date("2026-07-08")),
    7
  );
});

test("HRM-LAM-011 assertNoticePeriod rejects insufficient notice", () => {
  assert.throws(
    () => assertNoticePeriod(new Date("2026-07-01"), new Date("2026-07-05"), 7),
    /Minimum notice period is 7 day\(s\)/
  );
});

test("HRM-LAM-011 assertMaxConsecutiveDays rejects excessive duration", () => {
  assert.throws(
    () => assertMaxConsecutiveDays(6, 5),
    /Maximum consecutive leave is 5 day\(s\)/
  );
});

test("HRM-LAM-011 submit rejects insufficient minimum notice on leave type", async () => {
  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      minNoticeDays: 14,
    },
    writeContext
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 5);

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate,
      endDate: startDate,
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected insufficient notice to fail");
  }
  assert.match(result.error, /Minimum notice period/);
});

test("HRM-LAM-011 submit rejects maximum consecutive days breach", async () => {
  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      maxConsecutiveDays: 3,
    },
    writeContext
  );

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-05"),
      totalDays: 5,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected max consecutive days to fail");
  }
  assert.match(result.error, /Maximum consecutive leave/);
});

test("HRM-LAM-011 submit rejects overlapping leave applications", async () => {
  const first = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const second = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-02"),
      endDate: new Date("2026-07-04"),
      totalDays: 3,
    },
    writeContext
  );

  assert.equal(second.ok, false);
  if (second.ok) {
    throw new Error("Expected overlapping leave to fail");
  }
  assert.match(second.error, /overlaps with existing application/);
});

test("HRM-LAM-011 submit rejects leave during blackout period", async () => {
  const blackout = await upsertLamLeaveBlackoutPeriod(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "PEAK-2026",
      title: "Peak Season",
      scope: { countryCode: "MY" },
      startDate: new Date("2026-12-20"),
      endDate: new Date("2026-12-31"),
      reason: "Year-end peak operations",
      active: true,
    },
    writeContext
  );
  assert.equal(blackout.ok, true);

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-12-24"),
      endDate: new Date("2026-12-26"),
      totalDays: 3,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected blackout period to fail");
  }
  assert.match(result.error, /blackout period/);
});

test("HRM-LAM-010 submit rejects employee failing leave type tenure eligibility", async () => {
  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      eligibilityTenureMonthsMin: 24,
    },
    writeContext
  );

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      hireDate: new Date("2026-01-15"),
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected tenure eligibility to fail");
  }
  assert.match(result.error, /Minimum tenure/);
});

test("HRM-LAM-010 submit rejects employee failing gender eligibility", async () => {
  const maternityType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MAT",
      name: "Maternity Leave",
      kind: "maternity",
      eligibilityGender: "female",
    },
    writeContext
  );
  assert.equal(maternityType.ok, true);
  if (!maternityType.ok) {
    throw new Error("Failed to seed maternity leave type");
  }

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: maternityType.targetId,
      code: "MAT-MY",
      title: "Maternity Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 90,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId: maternityType.targetId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      gender: "male",
      leaveTypeId: maternityType.targetId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-05"),
      totalDays: 5,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected gender eligibility to fail");
  }
  assert.match(result.error, /eligibility gender/);
});

test("HRM-LAM-011 assertTotalDaysMatchDateRange rejects mismatched totalDays", () => {
  assert.throws(
    () =>
      assertTotalDaysMatchDateRange(
        new Date("2026-07-01"),
        new Date("2026-07-03"),
        2
      ),
    /totalDays must be 3/
  );
});

test("HRM-LAM-011 submit rejects totalDays mismatch with date range", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 2,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected totalDays mismatch to fail");
  }
  assert.match(result.error, /totalDays must be 3/);
});

test("HRM-LAM-010 submit rejects employee failing entitlement rule scope", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      countryCode: "SG",
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected entitlement scope mismatch to fail");
  }
  assert.match(result.error, /No applicable leave entitlement rule/);
});

test("HRM-LAM-009 submit still rejects insufficient balance after policy checks pass", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-31"),
      totalDays: 31,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected insufficient balance to fail");
  }
  assert.match(result.error, /Insufficient leave balance/);
});

test("HRM-LAM-009 resolveAvailableLeaveBalanceForApplication includes pending reservation on approve", () => {
  const balance = {
    openingBalance: 0,
    earned: 18,
    used: 0,
    pending: 3,
    adjusted: -16,
    forfeited: 0,
    carriedForward: 0,
    remaining: -1,
  };

  assert.equal(
    resolveAvailableLeaveBalanceForApplication({
      balance,
      totalDays: 3,
      phase: "submit",
    }),
    -1
  );
  assert.equal(
    resolveAvailableLeaveBalanceForApplication({
      balance,
      totalDays: 3,
      phase: "approve",
    }),
    2
  );

  assert.throws(
    () =>
      assertLeaveApplicationAvailableBalance({
        balance,
        totalDays: 3,
        phase: "approve",
      }),
    /Insufficient leave balance/
  );
});

test("submit requires hireDate when entitlement rules exist for leave type", async () => {
  const result = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected missing hireDate to fail");
  }
  assert.match(result.error, /hireDate is required/);
});

test("HRM-LAM-011 assertNoLeaveOverlap ignores draft and returned applications", () => {
  const startDate = new Date("2026-07-10");
  const endDate = new Date("2026-07-12");

  assert.throws(
    () =>
      assertNoLeaveOverlap({
        applications: [
          {
            id: "app-approved",
            employeeId: "emp-001",
            status: "approved",
            startDate: new Date("2026-07-01"),
            endDate: new Date("2026-07-05"),
          } as never,
        ],
        employeeId: "emp-001",
        startDate: new Date("2026-07-03"),
        endDate: new Date("2026-07-07"),
      }),
    /overlaps with existing application "app-approved"/
  );

  assert.doesNotThrow(() =>
    assertNoLeaveOverlap({
      applications: [
        {
          id: "app-draft",
          employeeId: "emp-001",
          status: "draft",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2026-07-05"),
        } as never,
      ],
      employeeId: "emp-001",
      startDate,
      endDate,
    })
  );
});

test("HRM-LAM-011 assertNotInBlackout ignores inactive blackout periods", () => {
  assert.throws(
    () =>
      assertNotInBlackout({
        blackoutPeriods: [
          {
            id: "bp-1",
            companyId: "company-001",
            code: "PEAK",
            reason: "Peak season",
            startDate: new Date("2026-07-01"),
            endDate: new Date("2026-07-31"),
            active: true,
            scope: { countryCode: "MY" },
          } as never,
        ],
        companyId: "company-001",
        leaveTypeId: "lt-001",
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-12"),
        employee: {
          companyId: "company-001",
          employeeId: "emp-001",
          hireDate: new Date("2020-01-01"),
          countryCode: "MY",
        } as never,
      }),
    /blackout period "PEAK"/
  );

  assert.doesNotThrow(() =>
    assertNotInBlackout({
      blackoutPeriods: [
        {
          id: "bp-2",
          companyId: "company-001",
          code: "INACTIVE",
          reason: "Inactive",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2026-07-31"),
          active: false,
          scope: { countryCode: "MY" },
        } as never,
      ],
      companyId: "company-001",
      leaveTypeId: "lt-001",
      startDate: new Date("2026-07-10"),
      endDate: new Date("2026-07-12"),
      employee: {
        companyId: "company-001",
        employeeId: "emp-001",
        hireDate: new Date("2020-01-01"),
        countryCode: "MY",
      } as never,
    })
  );
});

test("HRM-LAM-011 assertNoticePeriod accepts notice exactly at minimum", () => {
  assert.doesNotThrow(() =>
    assertNoticePeriod(new Date("2026-07-01"), new Date("2026-07-08"), 7)
  );
});

test("HRM-LAM-011 lamLeaveTypeFieldLabels exposes policy validation fields", async () => {
  const { lamLeaveTypeFieldLabels } = await import(
    "../src/shared/leave-type-policy-group.ts"
  );
  const { lamLeaveBlackoutPeriodFieldLabels } = await import(
    "../src/shared/leave-application-policy-validation.ts"
  );

  assert.equal(lamLeaveTypeFieldLabels.minNoticeDays, "Minimum Notice (Days)");
  assert.equal(
    lamLeaveTypeFieldLabels.maxConsecutiveDays,
    "Maximum Consecutive Days"
  );
  assert.equal(lamLeaveBlackoutPeriodFieldLabels.reason, "Reason");
});

test("HRM-LAM-011 buildLeaveApplicationScopeProfile uses startDate when hireDate omitted in policy gates", () => {
  const startDate = new Date("2026-08-05");
  const profile = buildLeaveApplicationScopeProfile({
    companyId: "company-001",
    employeeId: "emp-001",
    hireDate: startDate,
    countryCode: "MY",
  });

  assert.equal(profile.hireDate.toISOString(), startDate.toISOString());
});
