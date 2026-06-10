import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createEmployeeSelfservicePortal,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import { createHrEmployeeRecordAction } from "../../../packages/features/hr-suite/employee-management/employee-records-management/src/actions.server.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-records-management/src/repository.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-selfservice-portal/src/repository.ts";
import { GET as getApprovalInboxRoute } from "../app/api/hr/employee-selfservice-portal/approval-inbox/route.ts";
import { GET as getAuditTrailRoute } from "../app/api/hr/employee-selfservice-portal/audit-trail/route.ts";
import { POST as approveProfileUpdateRoute } from "../app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/approve/route.ts";

let sandboxDirectory = "";
let employeeId = "";
let managerEmployeeId = "";
let fixtureSuffix = "";

const baseManagerHeaders = {
  "x-can-read-all-employee-selfservice-portal": "true",
  "x-can-read-employee-selfservice-portal": "true",
  "x-can-view-sensitive-employee-selfservice-portal": "true",
  "x-can-write-employee-selfservice-portal": "true",
  "x-company-id": "company-1",
  "x-organization-id": "org-1",
  "x-request-id": "manager-request-1",
  "x-tenant-id": "tenant-1",
  "x-user-id": "manager-user",
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-ess-manager-"));
  fixtureSuffix = randomUUID().slice(0, 8);
  setEmployeeSelfservicePortalRepositoryPathForTesting(
    join(sandboxDirectory, "ess-repository.json")
  );
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setHrEmployeeRecordsRepositoryPathForTesting(
    join(sandboxDirectory, "employee-records-repository.json")
  );
  resetHrEmployeeRecordsRepositoryForTesting();

  const managerCreated = createHrEmployeeRecordAction(
    {
      employeeNumber: `M400-${fixtureSuffix}`,
      legalName: `Manager Route Reviewer ${fixtureSuffix}`,
      email: `manager.route.reviewer.${fixtureSuffix}@example.com`,
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(managerCreated.ok, true);
  assert.ok(managerCreated.targetId);
  managerEmployeeId = managerCreated.targetId;

  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: `E400-${fixtureSuffix}`,
      legalName: `Manager Route Employee ${fixtureSuffix}`,
      email: `manager.route.employee.${fixtureSuffix}@example.com`,
      managerEmployeeId,
      personalEmail: `before.manager.route.${fixtureSuffix}@example.com`,
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  employeeId = created.targetId;

  createEmployeeSelfservicePortal(
    {
      displayName: "Employee 400",
      employeeId,
      employeeNumber: "E400",
      locale: "en-US",
      workEmail: "e400@example.com",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );
});

afterEach(() => {
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

const buildManagerRequest = (
  path: string,
  init?: RequestInit & { bodyObject?: unknown }
): Request =>
  new Request(`http://localhost${path}`, {
    ...init,
    body:
      init?.bodyObject === undefined
        ? init?.body
        : JSON.stringify(init.bodyObject),
    headers: {
      "content-type": "application/json",
      ...baseManagerHeaders,
      "x-actor-employee-id": managerEmployeeId,
      ...(init?.headers ?? {}),
    },
  });

test("serves manager approval inbox and records approval audit evidence", async () => {
  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        personalEmail: `after.manager.route.${fixtureSuffix}@example.com`,
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "employee-actor",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  const inboxResponse = await getApprovalInboxRoute(
    buildManagerRequest("/api/hr/employee-selfservice-portal/approval-inbox")
  );
  assert.equal(inboxResponse.status, 200);

  const inboxItems = (await inboxResponse.json()) as Array<{
    employeeId: string;
    id: string;
  }>;
  assert.equal(inboxItems.length, 1);
  assert.equal(inboxItems[0]?.employeeId, employeeId);
  assert.equal(inboxItems[0]?.id, submitted.id);

  const approveResponse = await approveProfileUpdateRoute(
    buildManagerRequest(
      `/api/hr/employee-selfservice-portal/profile-update-requests/${submitted.id}/approve`,
      {
        bodyObject: {
          approvalReference: "MGR-API-400",
        },
        method: "POST",
      }
    ),
    {
      params: Promise.resolve({ requestId: submitted.id }),
    }
  );

  assert.equal(approveResponse.status, 200);

  const auditTrailResponse = await getAuditTrailRoute(
    buildManagerRequest("/api/hr/employee-selfservice-portal/audit-trail")
  );
  assert.equal(auditTrailResponse.status, 200);

  const auditEntries = (await auditTrailResponse.json()) as Array<{
    action: string;
  }>;

  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.approval-inbox.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.profile-update-request.approve"
    ),
    true
  );
});
