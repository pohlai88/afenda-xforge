import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createEmployeeSelfservicePortalRecord,
  updateEmployeeSelfservicePortalRecord,
} from "../src/actions.ts";
import {
  getEmployeeSelfservicePortalRecord,
  listEmployeeSelfservicePortalRecords,
} from "../src/queries.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";

let repositoryPath = "";

beforeEach(() => {
  repositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-portal-${randomUUID()}.json`
  );
  setEmployeeSelfservicePortalRepositoryPathForTesting(repositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(repositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository artifacts.
  }
});

test("persists scoped portal records and limits employee reads to self", () => {
  const created = createEmployeeSelfservicePortalRecord(
    {
      employeeId: "emp-001",
      employeeNumber: "E001",
      displayName: "Alex Worker",
      workEmail: "alex@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.employeeId, "emp-001");
  assert.equal(created.status, "invited");

  const selfRecord = getEmployeeSelfservicePortalRecord(created.id, {
    canRead: true,
    actorEmployeeId: "emp-001",
    tenantId: "tenant-1",
    companyId: "company-1",
  });

  assert.ok(selfRecord);
  assert.equal(selfRecord.displayName, "Alex Worker");

  const deniedOtherEmployee = getEmployeeSelfservicePortalRecord(created.id, {
    canRead: true,
    actorEmployeeId: "emp-002",
    tenantId: "tenant-1",
    companyId: "company-1",
  });

  assert.equal(deniedOtherEmployee, null);

  const hrList = listEmployeeSelfservicePortalRecords(
    {},
    {
      canRead: true,
      canReadAll: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  assert.equal(hrList.length, 1);
  assert.equal(hrList[0]?.id, created.id);

  const crossCompanyList = listEmployeeSelfservicePortalRecords(
    {},
    {
      canRead: true,
      canReadAll: true,
      tenantId: "tenant-1",
      companyId: "company-2",
      userId: "hr-admin",
    }
  );

  assert.equal(crossCompanyList.length, 0);
});

test("denies writes when write access is missing", () => {
  assert.throws(
    () =>
      createEmployeeSelfservicePortalRecord(
        {
          employeeId: "emp-002",
          employeeNumber: "E002",
          displayName: "Denied Worker",
        },
        {
          canWrite: false,
          tenantId: "tenant-1",
          companyId: "company-1",
          userId: "viewer",
        }
      ),
    /write access denied/i
  );
});

test("updates records within the active scope", () => {
  const created = createEmployeeSelfservicePortalRecord(
    {
      employeeId: "emp-003",
      employeeNumber: "E003",
      displayName: "Taylor Portal",
    },
    {
      canWrite: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  const updated = updateEmployeeSelfservicePortalRecord(
    {
      id: created.id,
      displayName: "Taylor Portal Updated",
      status: "active",
      mobileAccessEnabled: false,
    },
    {
      canWrite: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  assert.equal(updated.displayName, "Taylor Portal Updated");
  assert.equal(updated.status, "active");
  assert.equal(updated.mobileAccessEnabled, false);
});
