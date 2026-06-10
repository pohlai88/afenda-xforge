import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  applyLamLeaveEntitlementCalculation,
  submitLamLeaveApplication,
  upsertLamAttendanceRecord,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as listAttendanceSummaryRoute } from "../app/api/hr/attendance/attendance-summary/route.ts";
import { GET as listLeaveApplicationsRoute } from "../app/api/hr/leave/leave-applications/route.ts";
import { GET as listLeaveBalancesRoute } from "../app/api/hr/leave/leave-balances/route.ts";

let currentRepositoryPath = "";
let annualLeaveTypeId = "";
let unpaidLeaveTypeId = "";

const periodQuery = "periodStart=2026-06-01&periodEnd=2026-06-30";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const employeeProfile = {
  companyId: "company-001",
  employeeId: "emp-001",
  hireDate: new Date("2020-01-15"),
  countryCode: "MY",
  legalEntityCode: "MY-ENTITY",
  workLocationCode: "KL",
  employmentType: "permanent",
  grade: "G5",
  departmentId: "dept-sales",
} as const;

const employeeTwoProfile = {
  ...employeeProfile,
  employeeId: "emp-002",
  departmentId: "dept-ops",
} as const;

const employeeSelfBaseHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "false",
  "x-lam-scoped-employee-id": "emp-001",
} as const;

const employeeLeaveBalancesHeaders = {
  ...employeeSelfBaseHeaders,
  "x-lam-capabilities": "hr.lam.leave-balances.read",
};

const employeeLeaveApplicationsHeaders = {
  ...employeeSelfBaseHeaders,
  "x-lam-capabilities": "hr.lam.leave-applications.read",
};

const employeeAttendanceSummaryHeaders = {
  ...employeeSelfBaseHeaders,
  "x-lam-capabilities": "hr.lam.reports.read",
};

const seedAnnualLeaveBalances = async (): Promise<void> => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: annualLeaveTypeId,
      code: "AL-MY",
      title: "Annual Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 14,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  for (const profile of [employeeProfile, employeeTwoProfile]) {
    await applyLamLeaveEntitlementCalculation(
      {
        ...profile,
        leaveTypeId: annualLeaveTypeId,
        periodYear: 2026,
        asOfDate: new Date("2026-06-01"),
      },
      writeContext
    );
  }
};

const seedEmployeeSelfServiceData = async (): Promise<void> => {
  await seedAnnualLeaveBalances();

  await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Own leave history",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      ...employeeTwoProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-03"),
      endDate: new Date("2026-07-04"),
      totalDays: 2,
      reason: "Other employee leave history",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "present",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceDate: new Date("2026-06-10"),
      status: "absent",
    },
    writeContext
  );
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-employee-self-service-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const annualType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      paid: true,
      requiresDocument: false,
      active: true,
    },
    writeContext
  );
  assert.equal(annualType.ok, true);
  if (!annualType.ok) {
    throw new Error("Failed to seed annual leave type");
  }
  annualLeaveTypeId = annualType.targetId;

  const unpaidType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "UNPAID",
      name: "Unpaid Leave",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    writeContext
  );
  assert.equal(unpaidType.ok, true);
  if (!unpaidType.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = unpaidType.targetId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-021 leave balances route returns only scoped employee balances through HTTP boundary", async () => {
  await seedEmployeeSelfServiceData();

  const response = await listLeaveBalancesRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-balances?periodYear=2026",
      {
        headers: employeeLeaveBalancesHeaders,
      }
    )
  );
  assert.equal(response.status, 200);

  const balances = (await response.json()) as Array<{ employeeId: string }>;
  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.employeeId, "emp-001");
});

test("AC-021 leave applications route returns only scoped employee leave history through HTTP boundary", async () => {
  await seedEmployeeSelfServiceData();

  const response = await listLeaveApplicationsRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      headers: employeeLeaveApplicationsHeaders,
    })
  );
  assert.equal(response.status, 200);

  const applications = (await response.json()) as Array<{ employeeId: string }>;
  assert.equal(applications.length, 1);
  assert.equal(applications[0]?.employeeId, "emp-001");
});

test("AC-021 attendance summary route returns scoped employee summary through HTTP boundary", async () => {
  await seedEmployeeSelfServiceData();

  const response = await listAttendanceSummaryRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-summary?${periodQuery}`,
      { headers: employeeAttendanceSummaryHeaders }
    )
  );
  assert.equal(response.status, 200);

  const summaries = (await response.json()) as Array<{
    employeeId: string;
    daysWorked: number;
    absentDays: number;
  }>;
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.employeeId, "emp-001");
  assert.equal(summaries[0]?.daysWorked, 1);
  assert.equal(summaries[0]?.absentDays, 0);
});

test("AC-021 employee self-service routes fail closed when querying another employee id", async () => {
  await seedEmployeeSelfServiceData();

  const balanceResponse = await listLeaveBalancesRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-balances?employeeId=emp-002&periodYear=2026",
      { headers: employeeLeaveBalancesHeaders }
    )
  );
  assert.equal(balanceResponse.status, 200);
  assert.deepEqual(await balanceResponse.json(), []);

  const applicationResponse = await listLeaveApplicationsRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications?employeeId=emp-002",
      { headers: employeeLeaveApplicationsHeaders }
    )
  );
  assert.equal(applicationResponse.status, 200);
  assert.deepEqual(await applicationResponse.json(), []);

  const summaryResponse = await listAttendanceSummaryRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-summary?${periodQuery}&employeeId=emp-002`,
      { headers: employeeAttendanceSummaryHeaders }
    )
  );
  assert.equal(summaryResponse.status, 200);
  assert.deepEqual(await summaryResponse.json(), []);
});

test("AC-021 employee self-service routes fail closed without read capabilities", async () => {
  await seedEmployeeSelfServiceData();

  const deniedHeaders = {
    ...employeeSelfBaseHeaders,
    "x-lam-capabilities": "hr.lam.leave-applications.write",
  };

  const balanceResponse = await listLeaveBalancesRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-balances?periodYear=2026",
      {
        headers: deniedHeaders,
      }
    )
  );
  assert.equal(balanceResponse.status, 200);
  assert.deepEqual(await balanceResponse.json(), []);

  const applicationResponse = await listLeaveApplicationsRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      headers: deniedHeaders,
    })
  );
  assert.equal(applicationResponse.status, 200);
  assert.deepEqual(await applicationResponse.json(), []);

  const summaryResponse = await listAttendanceSummaryRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-summary?${periodQuery}`,
      { headers: deniedHeaders }
    )
  );
  assert.equal(summaryResponse.status, 200);
  assert.deepEqual(await summaryResponse.json(), []);
});
