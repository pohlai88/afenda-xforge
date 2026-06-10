import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  seedEmployeeUserAccountLinkForTests,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "@repo/features-employee-management-employee-records-management/server";
import { resolveLamNotificationRecipientsWithRegistry } from "../app/api/hr/_lib/lam-notification-orchestration.ts";

let currentRepositoryPath = "";

beforeEach(() => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-notification-orchestration-${randomUUID()}.json`
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

test("resolveLamNotificationRecipientsWithRegistry resolves employee auth user from registry", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: true,
    companyId: "company-001",
    employeeId: "emp-001",
    tenantId: "tenant-001",
    userId: "user-001",
  });

  const recipients = await resolveLamNotificationRecipientsWithRegistry({
    request: new Request("http://localhost/api/hr/leave/leave-applications/app-001/approve", {
      headers: {
        "x-company-id": "company-001",
        "x-tenant-id": "tenant-001",
      },
    }),
    hints: {
      companyId: "company-001",
      employeeId: "emp-001",
      tenantId: "tenant-001",
    },
  });

  assert.equal(recipients.employeeUserId, "user-001");
});

test("resolveLamNotificationRecipientsWithRegistry resolves approver auth users from registry", async () => {
  seedEmployeeUserAccountLinkForTests({
    active: true,
    companyId: "company-001",
    employeeId: "mgr-001",
    tenantId: "tenant-001",
    userId: "mgr-user",
  });

  const recipients = await resolveLamNotificationRecipientsWithRegistry({
    request: new Request("http://localhost/api/hr/leave/leave-applications/app-001/approve", {
      headers: {
        "x-company-id": "company-001",
        "x-tenant-id": "tenant-001",
      },
    }),
    hints: {
      approverEmployeeIds: ["mgr-001"],
      companyId: "company-001",
      tenantId: "tenant-001",
    },
  });

  assert.deepEqual(recipients.approverUserIds, ["mgr-user"]);
});
