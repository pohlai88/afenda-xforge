import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { processLamLeaveEncashment } from "../src/actions/process-leave-encashment.action.ts";
import { adjustLamLeaveBalance } from "../src/actions/leave-balance-adjustment.action.ts";
import { upsertLamLeaveEncashmentPolicy } from "../src/actions/leave-encashment-policies.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { listPayrollReferences } from "../src/projector/payroll-references.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";
let policyId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.encashmentWrite,
    leaveAttendanceManagementCapabilities.leaveTypesWrite,
    leaveAttendanceManagementCapabilities.leaveBalancesWrite,
  ],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-encashment-process-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveTypeResult = await upsertLamLeaveType(
    {
      code: "annual",
      name: "Annual Leave",
      kind: "annual",
      paid: true,
      active: true,
    },
    writeContext
  );
  assert.equal(leaveTypeResult.ok, true);
  leaveTypeId = leaveTypeResult.targetId;

  const policyResult = await upsertLamLeaveEncashmentPolicy(
    {
      code: "encash-standard",
      title: "Standard encashment",
      leaveTypeId,
      maxEncashableDays: 5,
      encashmentRatePercent: 100,
      minRemainingBalanceDays: 2,
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );
  assert.equal(policyResult.ok, true);
  policyId = policyResult.targetId;
});

afterEach(() => {
  if (currentRepositoryPath) {
    rmSync(currentRepositoryPath, { force: true });
  }
});

test("processLamLeaveEncashment debits balance and emits payroll reference", async () => {
  const adjusted = await adjustLamLeaveBalance(
    {
      employeeId: "employee-001",
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 10,
      reason: "Seed balance",
      authorizedBy: "hr-manager",
    },
    writeContext
  );
  assert.equal(adjusted.ok, true);

  const result = await processLamLeaveEncashment(
    {
      employeeId: "employee-001",
      leaveTypeId,
      policyId,
      periodYear: 2026,
      encashmentDays: 3,
      payPeriodStart: new Date("2026-06-01"),
      payPeriodEnd: new Date("2026-06-30"),
      authorizedBy: "hr-manager",
      reason: "Year-end encashment",
    },
    writeContext
  );

  assert.equal(result.ok, true);

  const nextState = await loadLamRepository(writeContext);
  const balance = nextState.leaveBalances.find(
    (entry) => entry.employeeId === "employee-001"
  );
  assert.ok(balance);
  assert.equal(balance.used, 3);
  assert.equal(balance.remaining, 7);
  assert.equal(nextState.leaveEncashmentRequests.length, 1);

  const payrollReferences = listPayrollReferences(nextState, {
    companyId: "company-001",
    deductionCategory: "leave_encashment",
  });
  assert.equal(payrollReferences.length, 1);
  assert.equal(payrollReferences[0]?.deductionCategory, "leave_encashment");

  const auditEvent = nextState.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.leaveEncashmentProcessed
  );
  assert.ok(auditEvent);
});

test("processLamLeaveEncashment rejects when balance would fall below minimum", async () => {
  const adjusted = await adjustLamLeaveBalance(
    {
      employeeId: "employee-002",
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: 4,
      reason: "Seed balance",
      authorizedBy: "hr-manager",
    },
    writeContext
  );
  assert.equal(adjusted.ok, true);

  const result = await processLamLeaveEncashment(
    {
      employeeId: "employee-002",
      leaveTypeId,
      policyId,
      periodYear: 2026,
      encashmentDays: 3,
      payPeriodStart: new Date("2026-06-01"),
      payPeriodEnd: new Date("2026-06-30"),
      authorizedBy: "hr-manager",
      reason: "Should fail",
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("Expected encashment to fail");
  }
  assert.match(result.error, /minRemainingBalanceDays/);
});
