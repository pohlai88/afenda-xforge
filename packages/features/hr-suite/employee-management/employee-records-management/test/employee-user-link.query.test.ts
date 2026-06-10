import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  resolveAuthUserIdByEmployeeId,
  resolveEmployeeIdByAuthUserId,
  seedEmployeeUserAccountLinkForTests,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "../src/queries/employee-user-link.query.ts";

let currentRepositoryPath = "";

beforeEach(() => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `employee-user-link-query-${randomUUID()}.json`
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

test("resolveEmployeeIdByAuthUserId reads active links from file-backed store", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: true,
    companyId: "company-001",
    employeeId: "emp-registry",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  const employeeId = await resolveEmployeeIdByAuthUserId({
    companyId: "company-001",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  assert.equal(employeeId, "emp-registry");
});

test("resolveEmployeeIdByAuthUserId ignores inactive links", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: false,
    companyId: "company-001",
    employeeId: "emp-inactive",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  const employeeId = await resolveEmployeeIdByAuthUserId({
    companyId: "company-001",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  assert.equal(employeeId, undefined);
});

test("resolveAuthUserIdByEmployeeId reads active links from file-backed store", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: true,
    companyId: "company-001",
    employeeId: "emp-registry",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  const userId = await resolveAuthUserIdByEmployeeId({
    companyId: "company-001",
    employeeId: "emp-registry",
    tenantId: "tenant-001",
  });

  assert.equal(userId, "user-001");
});

test("resolveAuthUserIdByEmployeeId ignores inactive links", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: false,
    companyId: "company-001",
    employeeId: "emp-inactive",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  const userId = await resolveAuthUserIdByEmployeeId({
    companyId: "company-001",
    employeeId: "emp-inactive",
    tenantId: "tenant-001",
  });

  assert.equal(userId, undefined);
});
