import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  deactivateEmployeeUserAccountLink,
  listEmployeeUserAccountLinks,
  upsertEmployeeUserAccountLink,
} from "../src/actions/employee-user-link.action.ts";
import {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "../src/employee-user-link.repository.ts";

const context = {
  canRead: true,
  canWrite: true,
  companyId: "company-001",
  tenantId: "tenant-001",
};

let currentRepositoryPath = "";

beforeEach(() => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `employee-user-link-action-${randomUUID()}.json`
  );
  setEmployeeUserAccountRepositoryPathForTesting(currentRepositoryPath);
  resetEmployeeUserAccountLinksForTests();
});

afterEach(() => {
  resetEmployeeUserAccountRepositoryPathForTesting();
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("upsertEmployeeUserAccountLink binds auth user to employee", async () => {
  const result = await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-001",
      userId: "user-001",
    },
    context
  );

  assert.equal(result.ok, true);
  assert.equal(result.link?.employeeId, "emp-001");
  assert.equal(result.link?.active, true);
});

test("resolveEmployeeIdByAuthUserId reads bound employee after upsert", async () => {
  await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-bound",
      userId: "user-bound",
    },
    context
  );

  const { resolveEmployeeIdByAuthUserId } = await import(
    "../src/queries/employee-user-link.query.ts"
  );
  const employeeId = await resolveEmployeeIdByAuthUserId({
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: "user-bound",
  });

  assert.equal(employeeId, "emp-bound");
});

test("deactivateEmployeeUserAccountLink soft-deactivates without deleting row", async () => {
  await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-001",
      userId: "user-001",
    },
    context
  );

  const deactivated = await deactivateEmployeeUserAccountLink(
    { userId: "user-001" },
    context
  );
  assert.equal(deactivated.ok, true);
  assert.equal(deactivated.link?.active, false);

  const listed = await listEmployeeUserAccountLinks(
    { userId: "user-001" },
    context
  );
  assert.equal(listed.links?.length, 1);
  assert.equal(listed.links?.[0]?.active, false);

  const { resolveEmployeeIdByAuthUserId } = await import(
    "../src/queries/employee-user-link.query.ts"
  );
  const employeeId = await resolveEmployeeIdByAuthUserId({
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: "user-001",
  });
  assert.equal(employeeId, undefined);
});

test("upsertEmployeeUserAccountLink rejects duplicate employee binding", async () => {
  await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-shared",
      userId: "user-a",
    },
    context
  );

  const conflict = await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-shared",
      userId: "user-b",
    },
    context
  );

  assert.equal(conflict.ok, false);
  if (conflict.ok) {
    throw new Error("Expected duplicate employee binding to fail");
  }
  assert.match(conflict.error, /already linked/);
});
