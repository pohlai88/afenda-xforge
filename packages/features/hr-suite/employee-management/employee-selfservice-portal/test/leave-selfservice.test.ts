import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  configureEmployeeSelfservicePortalLeaveAttendanceIntegration,
  createEmployeeSelfservicePortal,
  listEmployeeSelfservicePortalLeaveApplications,
  listEmployeeSelfservicePortalLeaveBalances,
  resetEmployeeSelfservicePortalLeaveAttendanceIntegrationForTesting,
} from "../src/server.ts";

let essRepositoryPath = "";

const scope = {
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  essRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-leave-${randomUUID()}.json`
  );

  setEmployeeSelfservicePortalRepositoryPathForTesting(essRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  configureEmployeeSelfservicePortalLeaveAttendanceIntegration({
    listLeaveApplications: (query, context) =>
      context?.actorEmployeeId === "employee-1"
        ? [
            {
              approvalReference: "APR-001",
              employeeId: "employee-1",
              endDate: new Date("2026-06-21T00:00:00.000Z"),
              id: "leave-application-1",
              leaveTypeCode:
                query.leaveTypeCode && query.leaveTypeCode !== "annual"
                  ? ""
                  : "annual",
              leaveTypeName: "Annual Leave",
              reason: "Family travel",
              rejectionReason: null,
              reviewedAt: new Date("2026-06-05T00:00:00.000Z"),
              reviewedByUserId: "manager-user",
              startDate: new Date("2026-06-20T00:00:00.000Z"),
              status: "approved",
              submittedAt: new Date("2026-06-01T00:00:00.000Z"),
              totalUnits: 2,
              unit: "days",
              updatedAt: new Date("2026-06-05T00:00:00.000Z"),
            },
          ].filter((record) =>
            query.leaveTypeCode
              ? record.leaveTypeCode === query.leaveTypeCode
              : true
          )
        : [],
    listLeaveBalances: (query, context) =>
      context?.actorEmployeeId === "employee-1"
        ? [
            {
              adjustedBalance: 0,
              carriedForwardBalance: 3,
              earnedBalance: 10,
              employeeId: "employee-1",
              forfeitedBalance: 0,
              id: "leave-balance-annual-1",
              leaveTypeCode: "annual",
              leaveTypeName: "Annual Leave",
              openingBalance: 12,
              pendingBalance: 1,
              remainingBalance: 14,
              unit: "days",
              updatedAt: new Date("2026-06-10T00:00:00.000Z"),
              usedBalance: 8,
            },
          ].filter((record) =>
            query.leaveTypeCode
              ? record.leaveTypeCode === query.leaveTypeCode
              : true
          )
        : [],
  });

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
});

afterEach(() => {
  rmSync(essRepositoryPath, { force: true });
  resetEmployeeSelfservicePortalLeaveAttendanceIntegrationForTesting();
});

test("lists actor-scoped leave balances for an accessible ESS portal record", () => {
  const balances = listEmployeeSelfservicePortalLeaveBalances(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.remainingBalance, 14);
});

test("lists actor-scoped leave application history and approval status", () => {
  const applications = listEmployeeSelfservicePortalLeaveApplications(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

  assert.equal(applications.length, 1);
  assert.equal(applications[0]?.status, "approved");
  assert.equal(applications[0]?.approvalReference, "APR-001");
});

test("fails closed when the employee has no accessible ESS portal record", () => {
  const balances = listEmployeeSelfservicePortalLeaveBalances(
    {},
    {
      actorEmployeeId: "employee-2",
      canRead: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

  assert.equal(balances.length, 0);
});
