import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamLeaveEncashmentPolicy } from "../src/actions/leave-encashment-policies.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  getLamLeaveEncashmentPolicyById,
  listLamLeaveEncashmentPoliciesRecords,
} from "../src/queries/index.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.encashmentWrite,
    leaveAttendanceManagementCapabilities.leaveTypesWrite,
  ],
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [leaveAttendanceManagementCapabilities.encashmentRead],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-encashment-policies-${randomUUID()}.json`
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

test("HRM-LAM-033 upsertLamLeaveEncashmentPolicy creates, updates, and lists scoped policies with audit trail", async () => {
  const created = await upsertLamLeaveEncashmentPolicy(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "ENC-STD",
      title: "Standard Encashment",
      maxEncashableDays: 5,
      encashmentRatePercent: 100,
      minRemainingBalanceDays: 3,
      effectiveFrom: new Date("2026-01-01"),
      scope: { countryCode: "MY", grade: "G5" },
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamLeaveEncashmentPolicy(
    {
      id: created.targetId,
      companyId: "company-001",
      leaveTypeId,
      code: "ENC-STD",
      title: "Standard Encashment (Revised)",
      maxEncashableDays: 7,
      encashmentRatePercent: 80,
      minRemainingBalanceDays: 2,
      effectiveFrom: new Date("2026-01-01"),
      scope: { countryCode: "MY", grade: "G5" },
    },
    writeContext
  );
  assert.equal(updated.ok, true);

  const record = await getLamLeaveEncashmentPolicyById(
    created.targetId,
    readContext
  );
  assert.equal(record?.maxEncashableDays, 7);
  assert.equal(record?.encashmentRatePercent, 80);

  const listed = await listLamLeaveEncashmentPoliciesRecords(
    { leaveTypeId, grade: "G5" },
    readContext
  );
  assert.equal(listed.length, 1);

  const state = await loadLamRepository(readContext);
  assert.ok(
    state.auditEvents.some(
      (event) =>
        event.action ===
        leaveAttendanceManagementAuditEvents.leaveEncashmentPolicyCreated
    )
  );
});

test("HRM-LAM-033 rejects encashment policy when leave type is missing", async () => {
  const result = await upsertLamLeaveEncashmentPolicy(
    {
      companyId: "company-001",
      leaveTypeId: "missing-leave-type",
      code: "ENC-BAD",
      title: "Bad Leave Type",
      maxEncashableDays: 5,
      encashmentRatePercent: 100,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(result.ok, false);
});

test("HRM-LAM-033 write guard denies encashment policy mutation without write capability", async () => {
  const denied = await upsertLamLeaveEncashmentPolicy(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "ENC-DENIED",
      title: "Denied",
      maxEncashableDays: 5,
      encashmentRatePercent: 100,
      effectiveFrom: new Date("2026-01-01"),
    },
    {
      actorId: "hr-viewer",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.encashmentRead,
      ],
    }
  );

  assert.equal(denied.ok, false);
});
