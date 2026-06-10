import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  leaveAttendanceManagementAuditEvents,
  listLamLeaveTypesQuerySchema,
} from "../src/contracts/index.ts";
import {
  getLamLeaveTypeById,
  listLamLeaveTypesRecords,
} from "../src/queries/leave-types.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamLeaveTypeKindSchema,
  lamLeaveTypeKindValues,
  lamLeaveTypeSchema,
} from "../src/schema.ts";
import { isLeaveTypeAccessibleToEmployeePolicyGroup } from "../src/shared/leave-type-policy-group.ts";

let currentRepositoryPath = "";

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
  grantedCapabilities: [leaveAttendanceManagementCapabilities.leaveTypesRead],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-types-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-003 leave type kinds cover annual, medical, unpaid, maternity, and related types", () => {
  assert.ok(lamLeaveTypeKindValues.includes("annual"));
  assert.ok(lamLeaveTypeKindValues.includes("medical"));
  assert.ok(lamLeaveTypeKindValues.includes("unpaid"));
  assert.ok(lamLeaveTypeKindValues.includes("maternity"));
  assert.ok(lamLeaveTypeKindValues.includes("paternity"));
  assert.ok(lamLeaveTypeKindValues.includes("compassionate"));
  assert.equal(lamLeaveTypeKindValues.length, 10);
  assert.equal(lamLeaveTypeKindSchema.parse("annual"), "annual");
  assert.equal(
    lamLeaveTypeKindSchema.parse("hospitalization"),
    "hospitalization"
  );
});

test("upsertLamLeaveType creates, updates, and lists leave types with audit trail", async () => {
  const created = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      paid: true,
      requiresDocument: false,
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamLeaveType(
    {
      id: created.targetId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave (Revised)",
      kind: "annual",
      active: true,
    },
    writeContext
  );

  assert.equal(updated.ok, true);

  const listed = await listLamLeaveTypesRecords({}, readContext);
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.name, "Annual Leave (Revised)");

  const fetched = await getLamLeaveTypeById(created.targetId, readContext);
  assert.equal(fetched?.code, "AL");

  const state = await loadLamRepository(writeContext);
  assert.equal(state.auditEvents.length, 2);
  assert.equal(
    state.auditEvents[0]?.action,
    leaveAttendanceManagementAuditEvents.leaveTypeUpserted
  );
  assert.equal(
    state.auditEvents[1]?.action,
    leaveAttendanceManagementAuditEvents.leaveTypeUpdated
  );
});

test("upsertLamLeaveType rejects duplicate codes within company and policy group scope", async () => {
  const first = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "ML",
      name: "Medical Leave",
      kind: "medical",
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const duplicate = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "ml",
      name: "Duplicate Medical",
      kind: "medical",
    },
    writeContext
  );

  assert.equal(duplicate.ok, false);
  if (duplicate.ok) {
    return;
  }

  assert.match(duplicate.error, /already exists/i);
});

test("AC-003 upsertLamLeaveType configures leave types by policy group", async () => {
  const scoped = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave (Executives)",
      kind: "annual",
      policyGroupId: "policy-group-001",
    },
    writeContext
  );
  assert.equal(scoped.ok, true);
  if (!scoped.ok) {
    return;
  }

  const companyWide = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave (Company)",
      kind: "annual",
    },
    writeContext
  );
  assert.equal(companyWide.ok, true);

  const otherGroup = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave (Operations)",
      kind: "annual",
      policyGroupId: "policy-group-002",
    },
    writeContext
  );
  assert.equal(otherGroup.ok, true);

  const fetched = await getLamLeaveTypeById(scoped.targetId, readContext);
  assert.equal(fetched?.policyGroupId, "policy-group-001");

  const forGroupOne = await listLamLeaveTypesRecords(
    { policyGroupId: "policy-group-001" },
    readContext
  );
  assert.equal(forGroupOne.length, 2);
  assert.ok(
    forGroupOne.some((entry) => entry.policyGroupId === "policy-group-001")
  );
  assert.ok(forGroupOne.some((entry) => entry.policyGroupId === null));

  const onlyUnscoped = await listLamLeaveTypesRecords(
    { unscopedPolicyGroupOnly: true },
    readContext
  );
  assert.equal(onlyUnscoped.length, 1);
  assert.equal(onlyUnscoped[0]?.name, "Annual Leave (Company)");

  const exactGroupTwo = await listLamLeaveTypesRecords(
    { policyGroupId: "policy-group-002", unscopedPolicyGroupOnly: true },
    readContext
  );
  assert.equal(exactGroupTwo.length, 1);
  assert.equal(exactGroupTwo[0]?.policyGroupId, null);

  const updated = await upsertLamLeaveType(
    {
      id: scoped.targetId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave (Executives Revised)",
      kind: "annual",
      policyGroupId: "policy-group-003",
    },
    writeContext
  );
  assert.equal(updated.ok, true);
  assert.equal(
    (await getLamLeaveTypeById(scoped.targetId, readContext))?.policyGroupId,
    "policy-group-003"
  );

  const state = await loadLamRepository(writeContext);
  const upsertAudit = state.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.leaveTypeUpserted
  );
  assert.equal(upsertAudit?.metadata?.policyGroupId, "policy-group-001");
});

test("AC-003 rejects duplicate leave type code within the same policy group", async () => {
  const first = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "ML",
      name: "Medical Leave",
      kind: "medical",
      policyGroupId: "policy-group-001",
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const duplicate = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "ML",
      name: "Duplicate Medical",
      kind: "medical",
      policyGroupId: "policy-group-001",
    },
    writeContext
  );

  assert.equal(duplicate.ok, false);
  if (duplicate.ok) {
    return;
  }

  assert.match(duplicate.error, /already exists/i);
});

test("denies leave type writes when context is not writable", async () => {
  const denied = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "UL",
      name: "Unpaid Leave",
      kind: "unpaid",
      paid: false,
    },
    { ...writeContext, canWrite: false, actorId: "viewer" }
  );

  assert.equal(denied.ok, false);
  if (denied.ok) {
    return;
  }

  assert.match(denied.error, /Write access denied/i);
});

test("leave type queries fail closed without read access", async () => {
  await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "PL",
      name: "Paternity Leave",
      kind: "paternity",
    },
    writeContext
  );

  assert.equal((await listLamLeaveTypesRecords({}, undefined)).length, 0);
  assert.equal(
    await getLamLeaveTypeById("missing", { companyId: "company-001" }),
    null
  );
});

test("listLamLeaveTypesQuerySchema supports policy group and active filters", () => {
  const parsed = listLamLeaveTypesQuerySchema.parse({
    active: true,
    kind: "maternity",
    policyGroupId: "policy-group-001",
    unscopedPolicyGroupOnly: false,
    page: 1,
    pageSize: 25,
    search: "maternity",
  });

  assert.equal(parsed.kind, "maternity");
  assert.equal(parsed.active, true);
  assert.equal(parsed.policyGroupId, "policy-group-001");
  assert.equal(parsed.unscopedPolicyGroupOnly, false);

  const record = lamLeaveTypeSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    code: "MAT",
    name: "Maternity Leave",
    kind: "maternity",
    policyGroupId: "policy-group-001",
    active: true,
    requiresDocument: true,
    paid: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(record.kind, "maternity");
});

test("AC-003 isLeaveTypeAccessibleToEmployeePolicyGroup enforces scoped vs unscoped access", () => {
  assert.equal(
    isLeaveTypeAccessibleToEmployeePolicyGroup({
      leaveTypePolicyGroupId: null,
      employeePolicyGroupId: "policy-group-001",
    }),
    true
  );
  assert.equal(
    isLeaveTypeAccessibleToEmployeePolicyGroup({
      leaveTypePolicyGroupId: "policy-group-001",
      employeePolicyGroupId: "policy-group-001",
    }),
    true
  );
  assert.equal(
    isLeaveTypeAccessibleToEmployeePolicyGroup({
      leaveTypePolicyGroupId: "policy-group-001",
      employeePolicyGroupId: "policy-group-002",
    }),
    false
  );
  assert.equal(
    isLeaveTypeAccessibleToEmployeePolicyGroup({
      leaveTypePolicyGroupId: "policy-group-001",
      employeePolicyGroupId: null,
    }),
    false
  );
});
