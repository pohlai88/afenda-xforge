import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  leaveAttendanceManagementAuditEvents,
  listLamLeaveEntitlementRulesQuerySchema,
} from "../src/contracts/index.ts";
import {
  getLamLeaveEntitlementRuleById,
  listLamLeaveEntitlementRulesRecords,
} from "../src/queries/leave-entitlement-rules.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamLeaveEntitlementRuleSchema,
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

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-entitlement-rules-${randomUUID()}.json`
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

test("HRM-LAM-004 entitlement scope schema supports legal entity, country, location, type, grade, and policy group", () => {
  const scope = lamEntitlementRuleScopeSchema.parse({
    countryCode: "MY",
    legalEntityCode: "ACME-MY",
    workLocationCode: "KL-HQ",
    employmentType: "permanent",
    grade: "G5",
    policyGroupId: "policy-group-001",
    departmentId: "dept-hr",
  });

  assert.equal(scope.legalEntityCode, "ACME-MY");
  assert.equal(scope.countryCode, "MY");
  assert.equal(scope.workLocationCode, "KL-HQ");
  assert.equal(scope.employmentType, "permanent");
  assert.equal(scope.grade, "G5");
  assert.equal(scope.policyGroupId, "policy-group-001");
  assert.equal("companyId" in scope, false);
});

test("upsertLamLeaveEntitlementRule creates, updates, and lists scoped rules with audit trail", async () => {
  const created = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-STD",
      title: "Standard Annual Entitlement",
      entitlementDays: 14,
      effectiveFrom: new Date("2026-01-01"),
      scope: {
        countryCode: "MY",
        legalEntityCode: "ACME-MY",
        workLocationCode: "KL-HQ",
        employmentType: "permanent",
        grade: "G5",
        policyGroupId: "policy-group-001",
      },
      tenureMonthsMin: 0,
      tenureMonthsMax: 24,
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamLeaveEntitlementRule(
    {
      id: created.targetId,
      companyId: "company-001",
      leaveTypeId,
      code: "AL-STD",
      title: "Standard Annual Entitlement (Revised)",
      entitlementDays: 16,
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

  assert.equal(updated.ok, true);

  const listed = await listLamLeaveEntitlementRulesRecords(
    {
      legalEntityCode: "ACME-MY",
      countryCode: "MY",
      grade: "G5",
      policyGroupId: "policy-group-001",
    },
    readContext
  );

  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.entitlementDays, 16);
  assert.equal(listed[0]?.scope?.legalEntityCode, "ACME-MY");

  const locationFiltered = await listLamLeaveEntitlementRulesRecords(
    {
      workLocationCode: "KL-HQ",
      employmentType: "permanent",
    },
    readContext
  );
  assert.equal(locationFiltered.length, 1);
  assert.equal(locationFiltered[0]?.scope?.workLocationCode, "KL-HQ");
  assert.equal(locationFiltered[0]?.scope?.employmentType, "permanent");

  const fetched = await getLamLeaveEntitlementRuleById(
    created.targetId,
    readContext
  );
  assert.equal(fetched?.title, "Standard Annual Entitlement (Revised)");

  const state = await loadLamRepository(writeContext);
  assert.equal(state.auditEvents.length, 3);
  assert.equal(
    state.auditEvents[1]?.action,
    leaveAttendanceManagementAuditEvents.leaveEntitlementRuleCreated
  );
  assert.equal(
    state.auditEvents[2]?.action,
    leaveAttendanceManagementAuditEvents.leaveEntitlementRuleUpdated
  );
});

test("upsertLamLeaveEntitlementRule rejects duplicate codes and missing leave types", async () => {
  const first = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MGR",
      title: "Manager Annual Entitlement",
      entitlementDays: 18,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const duplicate = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "al-mgr",
      title: "Duplicate Code",
      entitlementDays: 10,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) {
    assert.match(duplicate.error, /already exists/i);
  }

  const missingLeaveType = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: randomUUID(),
      code: "AL-NEW",
      title: "Missing Leave Type",
      entitlementDays: 10,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(missingLeaveType.ok, false);
  if (!missingLeaveType.ok) {
    assert.match(missingLeaveType.error, /Leave type/i);
  }
});

test("upsertLamLeaveEntitlementRule validates tenure range and write access", async () => {
  const invalidTenure = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-TENURE",
      title: "Invalid Tenure",
      entitlementDays: 12,
      effectiveFrom: new Date("2026-01-01"),
      tenureMonthsMin: 24,
      tenureMonthsMax: 6,
    },
    writeContext
  );
  assert.equal(invalidTenure.ok, false);
  if (!invalidTenure.ok) {
    assert.match(invalidTenure.error, /tenureMonthsMin/i);
  }

  const denied = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-DENY",
      title: "Denied Rule",
      entitlementDays: 8,
      effectiveFrom: new Date("2026-01-01"),
    },
    { ...writeContext, canWrite: false }
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.match(denied.error, /Write access denied/i);
  }
});

test("leave entitlement rule queries fail closed without read access", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-READ",
      title: "Read Guard",
      entitlementDays: 10,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(
    (await listLamLeaveEntitlementRulesRecords({}, undefined)).length,
    0
  );
  assert.equal(
    await getLamLeaveEntitlementRuleById("missing", {
      companyId: "company-001",
    }),
    null
  );
});

test("listLamLeaveEntitlementRulesQuerySchema supports all HRM-LAM-004 scope filters", () => {
  const parsed = listLamLeaveEntitlementRulesQuerySchema.parse({
    leaveTypeId,
    countryCode: "MY",
    legalEntityCode: "ACME-MY",
    workLocationCode: "KL-HQ",
    employmentType: "permanent",
    grade: "G5",
    policyGroupId: "policy-group-001",
    departmentId: "dept-hr",
    active: true,
    page: 1,
    pageSize: 25,
  });

  assert.equal(parsed.legalEntityCode, "ACME-MY");
  assert.equal(parsed.employmentType, "permanent");

  const record = lamLeaveEntitlementRuleSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    leaveTypeId,
    code: "AL-FILTER",
    title: "Filtered Rule",
    scope: {
      countryCode: "MY",
      legalEntityCode: "ACME-MY",
      workLocationCode: "KL-HQ",
      employmentType: "permanent",
      grade: "G5",
      policyGroupId: "policy-group-001",
    },
    entitlementDays: 12,
    tenureMonthsMin: 0,
    tenureMonthsMax: null,
    effectiveFrom: new Date("2026-01-01"),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(record.scope?.legalEntityCode, "ACME-MY");
});

test("upsertLamLeaveEntitlementRule rejects invalid effective date range", async () => {
  const result = await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-INVALID-DATES",
      title: "Invalid Dates",
      entitlementDays: 12,
      effectiveFrom: new Date("2026-12-31"),
      effectiveTo: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected invalid effective date range to fail");
  }
  assert.match(result.error, /effectiveTo must be after effectiveFrom/);
});

test("listLamLeaveEntitlementRulesRecords filters by effectiveOn date", async () => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-PAST",
      title: "Past Rule",
      entitlementDays: 10,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      active: true,
    },
    writeContext
  );

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-CURRENT",
      title: "Current Rule",
      entitlementDays: 14,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: null,
      active: true,
    },
    writeContext
  );

  const effectiveRules = await listLamLeaveEntitlementRulesRecords(
    { effectiveOn: new Date("2026-06-01") },
    readContext
  );

  assert.ok(effectiveRules.some((entry) => entry.code === "AL-CURRENT"));
  assert.equal(
    effectiveRules.some((entry) => entry.code === "AL-PAST"),
    false
  );
});
