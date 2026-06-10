import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  extractEmployeeIdFromUserMetadata,
  resolveLamOperationalEmployeeScope,
  resolveLamOperationalEmployeeScopeFromUser,
  shouldBindScopedEmployeeFromSession,
} from "../app/api/hr/_lib/lam-operational-employee-scope.ts";
import {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  resolveEmployeeIdByAuthUserId,
  setEmployeeUserAccountRepositoryPathForTesting,
  upsertEmployeeUserAccountLink,
} from "@repo/features-employee-management-employee-records-management/server";

let currentRepositoryPath = "";

beforeEach(() => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-operational-employee-scope-${randomUUID()}.json`
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

test("extractEmployeeIdFromUserMetadata reads employee_id and employeeId keys", () => {
  assert.equal(
    extractEmployeeIdFromUserMetadata({ employee_id: " emp-001 " }),
    "emp-001"
  );
  assert.equal(
    extractEmployeeIdFromUserMetadata({ employeeId: "emp-002" }),
    "emp-002"
  );
  assert.equal(extractEmployeeIdFromUserMetadata({}), undefined);
});

test("shouldBindScopedEmployeeFromSession binds only non-elevated actors", () => {
  assert.equal(
    shouldBindScopedEmployeeFromSession([
      permissionCatalog.hrLam.leaveApplicationsRead,
      permissionCatalog.hrLam.leaveApplicationsWrite,
    ]),
    true
  );
  assert.equal(
    shouldBindScopedEmployeeFromSession([
      permissionCatalog.hrLam.leaveApplicationsApprove,
    ]),
    false
  );
});

test("resolveLamOperationalEmployeeScopeFromUser binds scoped employee for self-service actors", () => {
  const scope = resolveLamOperationalEmployeeScopeFromUser({
    grantedCapabilities: [permissionCatalog.hrLam.leaveApplicationsRead],
    userMetadata: { employee_id: "emp-self" },
  });

  assert.equal(scope.scopedEmployeeId, "emp-self");
  assert.equal(scope.actorEmployeeId, "emp-self");
});

test("resolveLamOperationalEmployeeScopeFromUser prefers registry employee over metadata", () => {
  const scope = resolveLamOperationalEmployeeScopeFromUser({
    grantedCapabilities: [permissionCatalog.hrLam.leaveApplicationsRead],
    registryEmployeeId: "emp-registry",
    userMetadata: { employee_id: "emp-metadata" },
  });

  assert.equal(scope.scopedEmployeeId, "emp-registry");
  assert.equal(scope.actorEmployeeId, "emp-registry");
});

test("resolveLamOperationalEmployeeScopeFromUser skips elevated actors", () => {
  const scope = resolveLamOperationalEmployeeScopeFromUser({
    grantedCapabilities: [permissionCatalog.hrLam.leaveTypesWrite],
    userMetadata: { employee_id: "emp-self" },
  });

  assert.deepEqual(scope, {});
});

test("resolveLamOperationalEmployeeScope resolves registry links before metadata fallback", async () => {
  const bindResult = await upsertEmployeeUserAccountLink(
    {
      employeeId: "emp-from-registry",
      userId: "user-001",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-001",
      tenantId: "tenant-001",
    }
  );
  assert.equal(bindResult.ok, true);

  const registryEmployeeId = await resolveEmployeeIdByAuthUserId({
    companyId: "company-001",
    tenantId: "tenant-001",
    userId: "user-001",
  });
  assert.equal(registryEmployeeId, "emp-from-registry");

  const scope = await resolveLamOperationalEmployeeScope({
    companyId: "company-001",
    grantedCapabilities: [permissionCatalog.hrLam.leaveApplicationsRead],
    tenantId: "tenant-001",
    userId: "user-001",
    userMetadata: { employee_id: "emp-from-metadata" },
  });

  assert.equal(scope.scopedEmployeeId, "emp-from-registry");
  assert.equal(scope.actorEmployeeId, "emp-from-registry");
});

test("resolveLamOperationalEmployeeScope falls back to metadata when registry link is missing", async () => {
  const scope = await resolveLamOperationalEmployeeScope({
    companyId: "company-001",
    grantedCapabilities: [permissionCatalog.hrLam.leaveApplicationsRead],
    tenantId: "tenant-001",
    userId: "user-001",
    userMetadata: { employee_id: "emp-from-metadata" },
  });

  assert.equal(scope.scopedEmployeeId, "emp-from-metadata");
});
