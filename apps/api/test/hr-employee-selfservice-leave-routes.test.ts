import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createEmployeeSelfservicePortal } from "@repo/features-employee-management-employee-selfservice-portal/server";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-selfservice-portal/src/repository.ts";
import {
  resetLeaveAttendanceManagementStoresForTesting,
  upsertLeaveAttendanceManagementLeaveApplicationRecord,
  upsertLeaveAttendanceManagementLeaveBalanceRecord,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/server.ts";
import { GET as getAuditTrailRoute } from "../app/api/hr/employee-selfservice-portal/audit-trail/route.ts";
import { GET as getLeaveApplicationsRoute } from "../app/api/hr/employee-selfservice-portal/leave/applications/route.ts";
import { GET as getLeaveBalancesRoute } from "../app/api/hr/employee-selfservice-portal/leave/balances/route.ts";

let essRepositoryPath = "";

const scope = {
  companyId: "company-a",
  tenantId: "tenant-a",
};

const baseHeaders = {
  "x-actor-employee-id": "employee-1",
  "x-can-read-employee-selfservice-portal": "true",
  "x-can-write-employee-selfservice-portal": "true",
  "x-company-id": scope.companyId,
  "x-organization-id": "org-a",
  "x-request-id": "request-a",
  "x-tenant-id": scope.tenantId,
  "x-user-id": "employee-user",
};

const buildRequest = (path: string, init: RequestInit = {}): Request =>
  new Request(`http://localhost${path}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers ?? {}),
    },
  });

beforeEach(() => {
  essRepositoryPath = resolve(
    tmpdir(),
    `afenda-api-ess-leave-${randomUUID()}.json`
  );

  setEmployeeSelfservicePortalRepositoryPathForTesting(essRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  resetLeaveAttendanceManagementStoresForTesting();

  createEmployeeSelfservicePortal(
    {
      displayName: "Employee One",
      employeeId: "employee-1",
      employeeNumber: "E001",
      locale: "en-US",
      workEmail: "employee.one@example.com",
    },
    {
      canWrite: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "hr-admin",
    }
  );

  upsertLeaveAttendanceManagementLeaveBalanceRecord({
    adjustedBalance: 0,
    carriedForwardBalance: 2,
    companyId: scope.companyId,
    earnedBalance: 10,
    employeeId: "employee-1",
    forfeitedBalance: 0,
    id: "leave-balance-annual-1",
    leaveTypeCode: "annual",
    leaveTypeName: "Annual Leave",
    openingBalance: 12,
    pendingBalance: 1,
    remainingBalance: 13,
    tenantId: scope.tenantId,
    unit: "days",
    updatedAt: new Date("2026-06-10T00:00:00.000Z"),
    usedBalance: 9,
  });

  upsertLeaveAttendanceManagementLeaveApplicationRecord({
    approvalReference: "APR-001",
    companyId: scope.companyId,
    employeeId: "employee-1",
    endDate: new Date("2026-06-21T00:00:00.000Z"),
    id: "leave-application-1",
    leaveTypeCode: "annual",
    leaveTypeName: "Annual Leave",
    reason: "Family travel",
    rejectionReason: null,
    reviewedAt: new Date("2026-06-05T00:00:00.000Z"),
    reviewedByUserId: "manager-user",
    startDate: new Date("2026-06-20T00:00:00.000Z"),
    status: "approved",
    submittedAt: new Date("2026-06-01T00:00:00.000Z"),
    tenantId: scope.tenantId,
    totalUnits: 2,
    unit: "days",
    updatedAt: new Date("2026-06-05T00:00:00.000Z"),
  });
});

afterEach(() => {
  rmSync(essRepositoryPath, { force: true });
  resetLeaveAttendanceManagementStoresForTesting();
});

test("returns scoped leave balances and leave application history and records audit evidence", async () => {
  const balancesResponse = await getLeaveBalancesRoute(
    buildRequest("/api/hr/employee-selfservice-portal/leave/balances")
  );
  const applicationsResponse = await getLeaveApplicationsRoute(
    buildRequest("/api/hr/employee-selfservice-portal/leave/applications")
  );
  const auditTrailResponse = await getAuditTrailRoute(
    buildRequest("/api/hr/employee-selfservice-portal/audit-trail")
  );

  assert.equal(balancesResponse.status, 200);
  assert.equal(applicationsResponse.status, 200);
  assert.equal(auditTrailResponse.status, 200);

  const balances = (await balancesResponse.json()) as Array<{
    remainingBalance: number;
  }>;
  const applications = (await applicationsResponse.json()) as Array<{
    status: string;
  }>;
  const auditEntries = (await auditTrailResponse.json()) as Array<{
    action: string;
  }>;

  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.remainingBalance, 13);
  assert.equal(applications.length, 1);
  assert.equal(applications[0]?.status, "approved");
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.leave.balances.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.leave.applications.view"
    ),
    true
  );
});
