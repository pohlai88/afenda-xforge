import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  getLamLeaveCarryForwardRuleById,
  listLamLeaveCarryForwardRulesRecords,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import {
  GET as listCarryForwardRulesRoute,
  POST as upsertCarryForwardRuleRoute,
} from "../app/api/hr/leave/leave-carry-forward-rules/route.ts";

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
  grantedCapabilities: ["hr.lam.leave-entitlements.read"],
};

const writeHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-actor-id": "hr-admin",
  "x-lam-capabilities": "hr.lam.leave-entitlements.write",
};

const readHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
  "x-lam-capabilities": "hr.lam.leave-entitlements.read",
};

const deniedHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-carry-forward-rules-${randomUUID()}.json`
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

test("AC-016 carry-forward rules route persists rule through HTTP boundary", async () => {
  const response = await upsertCarryForwardRuleRoute(
    new Request("http://localhost/api/hr/leave/leave-carry-forward-rules", {
      method: "POST",
      headers: writeHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        leaveTypeId,
        code: "CF-HTTP",
        title: "HTTP Carry Forward Rule",
        maxCarryForwardDays: 5,
        forfeitUnused: true,
        effectiveFrom: "2026-01-01",
        scope: { countryCode: "MY", grade: "G5" },
      }),
    })
  );
  assert.equal(response.status, 201);

  const payload = (await response.json()) as { ok: boolean; targetId: string };
  assert.equal(payload.ok, true);

  const listed = await listCarryForwardRulesRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-carry-forward-rules?countryCode=MY&grade=G5",
      { headers: readHeaders }
    )
  );
  assert.equal(listed.status, 200);

  const rules = (await listed.json()) as Array<{ code: string }>;
  assert.equal(rules.length, 1);
  assert.equal(rules[0]?.code, "CF-HTTP");

  const fetched = await getLamLeaveCarryForwardRuleById(
    payload.targetId,
    readContext
  );
  assert.equal(fetched?.maxCarryForwardDays, 5);
});

test("AC-016 carry-forward rules route denies without write authorization", async () => {
  const response = await upsertCarryForwardRuleRoute(
    new Request("http://localhost/api/hr/leave/leave-carry-forward-rules", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        leaveTypeId,
        code: "CF-DENIED",
        title: "Denied Rule",
        maxCarryForwardDays: 5,
        effectiveFrom: "2026-01-01",
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Write access denied/i);

  const rules = await listLamLeaveCarryForwardRulesRecords({}, readContext);
  assert.equal(rules.length, 0);
});

test("carry-forward rules route returns 400 for invalid JSON body", async () => {
  const response = await upsertCarryForwardRuleRoute(
    new Request("http://localhost/api/hr/leave/leave-carry-forward-rules", {
      method: "POST",
      headers: writeHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});
