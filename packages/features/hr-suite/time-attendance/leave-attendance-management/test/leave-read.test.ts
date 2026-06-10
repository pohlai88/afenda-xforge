import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  listLeaveAttendanceManagementLeaveApplications,
  listLeaveAttendanceManagementLeaveBalances,
  resetLeaveAttendanceManagementStoresForTesting,
  upsertLeaveAttendanceManagementLeaveApplicationRecord,
  upsertLeaveAttendanceManagementLeaveBalanceRecord,
} from "../src/server.ts";

const scope = {
  companyId: "company-a",
  tenantId: "tenant-a",
};

beforeEach(() => {
  resetLeaveAttendanceManagementStoresForTesting();

  upsertLeaveAttendanceManagementLeaveBalanceRecord({
    adjustedBalance: 0,
    carriedForwardBalance: 2,
    companyId: scope.companyId,
    earnedBalance: 10,
    employeeId: "employee-1",
    forfeitedBalance: 0,
    id: "leave-balance-annual-employee-1",
    leaveTypeCode: "annual",
    leaveTypeName: "Annual Leave",
    openingBalance: 12,
    pendingBalance: 2,
    remainingBalance: 15,
    tenantId: scope.tenantId,
    unit: "days",
    updatedAt: new Date("2026-06-10T00:00:00.000Z"),
    usedBalance: 7,
  });

  upsertLeaveAttendanceManagementLeaveBalanceRecord({
    adjustedBalance: 0,
    carriedForwardBalance: 0,
    companyId: scope.companyId,
    earnedBalance: 6,
    employeeId: "employee-2",
    forfeitedBalance: 0,
    id: "leave-balance-annual-employee-2",
    leaveTypeCode: "annual",
    leaveTypeName: "Annual Leave",
    openingBalance: 6,
    pendingBalance: 1,
    remainingBalance: 5,
    tenantId: scope.tenantId,
    unit: "days",
    updatedAt: new Date("2026-06-09T00:00:00.000Z"),
    usedBalance: 1,
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

  upsertLeaveAttendanceManagementLeaveApplicationRecord({
    approvalReference: null,
    companyId: scope.companyId,
    employeeId: "employee-2",
    endDate: new Date("2026-06-16T00:00:00.000Z"),
    id: "leave-application-2",
    leaveTypeCode: "medical",
    leaveTypeName: "Medical Leave",
    reason: "Clinic visit",
    rejectionReason: null,
    reviewedAt: null,
    reviewedByUserId: null,
    startDate: new Date("2026-06-16T00:00:00.000Z"),
    status: "pending_approval",
    submittedAt: new Date("2026-06-10T00:00:00.000Z"),
    tenantId: scope.tenantId,
    totalUnits: 1,
    unit: "days",
    updatedAt: new Date("2026-06-10T00:00:00.000Z"),
  });
});

afterEach(() => {
  resetLeaveAttendanceManagementStoresForTesting();
});

test("lists leave balances only for the scoped employee by default", () => {
  const balances = listLeaveAttendanceManagementLeaveBalances(
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
  assert.equal(balances[0]?.employeeId, "employee-1");
  assert.equal(balances[0]?.remainingBalance, 15);
});

test("lists leave application history and status for the scoped employee", () => {
  const applications = listLeaveAttendanceManagementLeaveApplications(
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
  assert.equal(applications[0]?.employeeId, "employee-1");
  assert.equal(applications[0]?.status, "approved");
});

test("allows elevated scoped access to read multiple employees", () => {
  const balances = listLeaveAttendanceManagementLeaveBalances(
    {},
    {
      canRead: true,
      canReadAll: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "hr-admin",
    }
  );

  assert.equal(balances.length, 2);
});
