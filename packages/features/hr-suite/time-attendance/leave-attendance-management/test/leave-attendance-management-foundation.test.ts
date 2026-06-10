import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  createLamMutationAuditEvent,
  requireLamMutationAccess,
} from "../src/execution.ts";
import { leaveAttendanceManagementManifest } from "../src/manifest.ts";
import {
  canReadLeaveAttendanceManagement,
  canWriteLeaveAttendanceManagement,
} from "../src/policy.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  leaveAttendanceManagementAcceptanceCoverage,
  leaveAttendanceManagementRequirementCoverage,
} from "../src/registry/requirement-coverage.ts";
import {
  loadLamRepository,
  mutateLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
  upsertLamEntity,
} from "../src/repository.ts";
import {
  lamLeaveTypeSchema,
  lamRepositoryEntityTypeValues,
} from "../src/schema.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "actor-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [leaveAttendanceManagementCapabilities.leaveTypesWrite],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-foundation-${randomUUID()}.json`
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

test("foundation manifest covers all HRM-LAM requirements and acceptance criteria", () => {
  assert.equal(leaveAttendanceManagementRequirementCoverage.length, 30);
  assert.equal(leaveAttendanceManagementAcceptanceCoverage.length, 25);
  assert.deepEqual(
    [...leaveAttendanceManagementManifest.requirementCoverage],
    [...leaveAttendanceManagementRequirementCoverage]
  );
  assert.deepEqual(
    [...leaveAttendanceManagementManifest.acceptanceCriteria],
    [...leaveAttendanceManagementAcceptanceCoverage]
  );
  assert.ok(leaveAttendanceManagementManifest.capabilities.length > 0);
  assert.ok(leaveAttendanceManagementManifest.writeCapabilities.length > 0);
});

test("schema validates core repository entity types and leave type records", () => {
  assert.equal(lamRepositoryEntityTypeValues.length, 13);

  const leaveType = lamLeaveTypeSchema.parse({
    id: randomUUID(),
    companyId: "company-001",
    code: "AL",
    name: "Annual Leave",
    kind: "annual",
    active: true,
    requiresDocument: false,
    paid: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(leaveType.kind, "annual");
});

test("policy gates read and write access from capability context", () => {
  assert.equal(canReadLeaveAttendanceManagement(undefined), false);
  assert.equal(canWriteLeaveAttendanceManagement(undefined), false);

  assert.equal(
    canReadLeaveAttendanceManagement({
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceRead,
      ],
    }),
    true
  );

  assert.equal(
    canWriteLeaveAttendanceManagement({
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceWrite,
      ],
    }),
    true
  );
});

test("execution kernel denies mutations without write access", () => {
  assert.equal(requireLamMutationAccess(undefined)?.ok, false);
  assert.equal(requireLamMutationAccess(writeContext), null);
});

test("repository persists leave types and audit events atomically", async () => {
  const leaveTypeId = randomUUID();
  const now = new Date();

  await mutateLamRepository((draft) => {
    draft.leaveTypes = upsertLamEntity(draft.leaveTypes, {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      active: true,
      requiresDocument: false,
      paid: true,
      createdAt: now,
      updatedAt: now,
    });
    draft.auditEvents.push(
      createLamMutationAuditEvent({
        companyId: "company-001",
        actorId: "actor-001",
        action: leaveAttendanceManagementAuditEvents.leaveTypeUpserted,
        entityType: "leave_type",
        entityId: leaveTypeId,
        summary: "Leave type upserted",
        metadata: { code: "AL" },
        before: null,
        after: { id: leaveTypeId, code: "AL" },
      })
    );
  }, writeContext);

  const state = await loadLamRepository(writeContext);
  assert.equal(state.leaveTypes.length, 1);
  assert.equal(state.auditEvents.length, 1);
  assert.equal(state.leaveTypes[0]?.code, "AL");
  assert.equal(
    state.auditEvents[0]?.action,
    leaveAttendanceManagementAuditEvents.leaveTypeUpserted
  );
});
