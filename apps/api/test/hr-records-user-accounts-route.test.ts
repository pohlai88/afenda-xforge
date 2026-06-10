import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "@repo/features-employee-management-employee-records-management/server";
import { GET, POST } from "../app/api/hr/records/user-accounts/route.ts";
import { POST as deactivateUserAccount } from "../app/api/hr/records/user-accounts/deactivate/route.ts";

const headers = {
  "content-type": "application/json",
  "x-can-read-employee-records": "true",
  "x-can-write-employee-records": "true",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
};

let currentRepositoryPath = "";

beforeEach(() => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `employee-user-link-api-${randomUUID()}.json`
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

test("POST /api/hr/records/user-accounts binds auth user to employee", async () => {
  const response = await POST(
    new Request("http://localhost/api/hr/records/user-accounts", {
      body: JSON.stringify({
        employeeId: "emp-api",
        userId: "user-api",
      }),
      headers,
      method: "POST",
    })
  );

  assert.equal(response.status, 201);
  const body = (await response.json()) as {
    link?: { employeeId: string; userId: string };
    ok: boolean;
  };
  assert.equal(body.ok, true);
  assert.equal(body.link?.employeeId, "emp-api");
});

test("GET /api/hr/records/user-accounts lists scoped links", async () => {
  await POST(
    new Request("http://localhost/api/hr/records/user-accounts", {
      body: JSON.stringify({
        employeeId: "emp-list",
        userId: "user-list",
      }),
      headers,
      method: "POST",
    })
  );

  const response = await GET(
    new Request("http://localhost/api/hr/records/user-accounts?userId=user-list", {
      headers,
      method: "GET",
    })
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as Array<{ employeeId: string; userId: string }>;
  assert.equal(body.length, 1);
  assert.equal(body[0]?.employeeId, "emp-list");
});

test("POST /api/hr/records/user-accounts/deactivate soft-deactivates link", async () => {
  await POST(
    new Request("http://localhost/api/hr/records/user-accounts", {
      body: JSON.stringify({
        employeeId: "emp-deactivate",
        userId: "user-deactivate",
      }),
      headers,
      method: "POST",
    })
  );

  const response = await deactivateUserAccount(
    new Request("http://localhost/api/hr/records/user-accounts/deactivate", {
      body: JSON.stringify({ userId: "user-deactivate" }),
      headers,
      method: "POST",
    })
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    link?: { active: boolean };
    ok: boolean;
  };
  assert.equal(body.ok, true);
  assert.equal(body.link?.active, false);
});
