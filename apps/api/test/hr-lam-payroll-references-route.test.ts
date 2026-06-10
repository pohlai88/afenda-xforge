import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import type { LamPolicyCapability } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  applyLamLeaveEntitlementCalculation,
  approveLamLeaveApplication,
  submitLamLeaveApplication,
  upsertLamAttendanceRecord,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as getPayrollReferenceRoute } from "../app/api/hr/leave/payroll-references/[applicationId]/route.ts";
import { POST as exportPayrollReferencesRoute } from "../app/api/hr/leave/payroll-references/export/route.ts";
import { GET as listPayrollReferencesRoute } from "../app/api/hr/leave/payroll-references/route.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";
let annualLeaveTypeId = "";

const payPeriodQuery = "payPeriodStart=2026-06-01&payPeriodEnd=2026-06-30";

const writeContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const approveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  grantedCapabilities: [
    "hr.lam.leave-applications.approve",
  ] as LamPolicyCapability[],
};

const payrollReadHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "false",
  "x-lam-capabilities": "hr.lam.payroll-references.read",
};

const payrollExportHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
  "x-actor-id": "payroll-001",
  "x-lam-capabilities": "hr.lam.payroll-references.read",
};

const deniedHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-lam-capabilities": "hr.lam.leave-applications.write",
};

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

const submitApprovedUnpaidLeave = async (): Promise<string> => {
  const submitted = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Personal unpaid leave",
    },
    writeContext
  );
  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("Failed to submit unpaid leave");
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submitted.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  return submitted.targetId;
};

const seedAnnualLeaveBalance = async (): Promise<void> => {
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

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

const submitApprovedAnnualLeave = async (): Promise<string> => {
  await seedAnnualLeaveBalance();

  const submitted = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: annualLeaveTypeId,
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-11"),
      totalDays: 2,
      reason: "Annual leave",
    },
    writeContext
  );
  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("Failed to submit annual leave");
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: "company-001",
      applicationId: submitted.targetId,
      approvedBy: "mgr-001",
    },
    approveContext
  );
  assert.equal(approved.ok, true);

  return submitted.targetId;
};

const seedAttendancePayrollRecords = async (): Promise<void> => {
  for (const [status, date] of [
    ["absent", "2026-06-05"],
    ["late", "2026-06-06"],
    ["early_out", "2026-06-07"],
  ] as const) {
    const result = await upsertLamAttendanceRecord(
      {
        companyId: "company-001",
        employeeId: "emp-001",
        attendanceDate: new Date(date),
        status,
      },
      writeContext
    );
    assert.equal(result.ok, true);
  }
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-payroll-references-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

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
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-017 payroll references list route exposes unpaid leave through HTTP boundary", async () => {
  const applicationId = await submitApprovedUnpaidLeave();

  const response = await listPayrollReferencesRoute(
    new Request(
      "http://localhost/api/hr/leave/payroll-references?payPeriodStart=2026-07-01&payPeriodEnd=2026-07-31&deductionCategory=unpaid_leave",
      { headers: payrollReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const references = (await response.json()) as Array<{
    leaveApplicationId: string;
    deductionCategory: string;
    totalDays: number;
    sourceReference: string;
  }>;
  assert.equal(references.length, 1);
  assert.equal(references[0]?.leaveApplicationId, applicationId);
  assert.equal(references[0]?.deductionCategory, "unpaid_leave");
  assert.equal(references[0]?.totalDays, 3);
  assert.match(
    references[0]?.sourceReference ?? "",
    /^lam:unpaid-leave:company-001:/
  );
});

test("AC-017 payroll reference detail route returns unpaid leave deduction reference", async () => {
  const applicationId = await submitApprovedUnpaidLeave();

  const response = await getPayrollReferenceRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references/${applicationId}`,
      { headers: payrollReadHeaders }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 200);

  const reference = (await response.json()) as {
    deductionCategory: string;
    paid: boolean;
    sourceReference: string;
  };
  assert.equal(reference.deductionCategory, "unpaid_leave");
  assert.equal(reference.paid, false);
  assert.match(reference.sourceReference, /^lam:unpaid-leave:company-001:/);
});

test("AC-017 payroll export route emits deduction reference batch through HTTP boundary", async () => {
  const applicationId = await submitApprovedUnpaidLeave();

  const response = await exportPayrollReferencesRoute(
    new Request("http://localhost/api/hr/leave/payroll-references/export", {
      method: "POST",
      headers: payrollExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        payPeriodStart: "2026-07-01",
        payPeriodEnd: "2026-07-31",
        exportedBy: "payroll-001",
        deductionCategories: ["unpaid_leave"],
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    references: Array<{ leaveApplicationId: string }>;
    batch: { referenceCount: number };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.references.length, 1);
  assert.equal(payload.references[0]?.leaveApplicationId, applicationId);
  assert.equal(payload.batch.referenceCount, 1);
});

test("AC-017 payroll export route denies without payroll reference capability", async () => {
  await submitApprovedUnpaidLeave();

  const response = await exportPayrollReferencesRoute(
    new Request("http://localhost/api/hr/leave/payroll-references/export", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        payPeriodStart: "2026-07-01",
        payPeriodEnd: "2026-07-31",
        deductionCategories: ["unpaid_leave"],
      }),
    })
  );
  assert.equal(response.status, 403);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Payroll reference read access denied/i);
});

test("AC-017 payroll reference detail route returns 404 without payroll capability", async () => {
  const applicationId = await submitApprovedUnpaidLeave();

  const response = await getPayrollReferenceRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references/${applicationId}`,
      {
        headers: {
          "x-company-id": "company-001",
          "x-tenant-id": "tenant-001",
          "x-can-read-lam": "true",
        },
      }
    ),
    { params: Promise.resolve({ applicationId }) }
  );
  assert.equal(response.status, 404);
});

test("payroll export route returns 400 for invalid JSON body", async () => {
  const response = await exportPayrollReferencesRoute(
    new Request("http://localhost/api/hr/leave/payroll-references/export", {
      method: "POST",
      headers: payrollExportHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { ok: boolean; error: string };
  assert.equal(payload.ok, false);
  assert.match(payload.error, /Invalid JSON request body/i);
});

test("AC-020 payroll references list route exposes approved paid leave through HTTP boundary", async () => {
  const applicationId = await submitApprovedAnnualLeave();

  const response = await listPayrollReferencesRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references?${payPeriodQuery}&deductionCategory=approved_leave`,
      { headers: payrollReadHeaders }
    )
  );
  assert.equal(response.status, 200);

  const references = (await response.json()) as Array<{
    leaveApplicationId: string;
    deductionCategory: string;
    paid: boolean;
  }>;
  assert.equal(references.length, 1);
  assert.equal(references[0]?.leaveApplicationId, applicationId);
  assert.equal(references[0]?.deductionCategory, "approved_leave");
  assert.equal(references[0]?.paid, true);
});

test("AC-020 payroll references list route exposes attendance absence and lateness through HTTP boundary", async () => {
  await seedAttendancePayrollRecords();

  const absenceResponse = await listPayrollReferencesRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references?${payPeriodQuery}&deductionCategory=absence`,
      { headers: payrollReadHeaders }
    )
  );
  assert.equal(absenceResponse.status, 200);
  const absence = (await absenceResponse.json()) as Array<{
    deductionCategory: string;
  }>;
  assert.equal(absence.length, 1);
  assert.equal(absence[0]?.deductionCategory, "absence");

  const latenessResponse = await listPayrollReferencesRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references?${payPeriodQuery}&deductionCategory=lateness`,
      { headers: payrollReadHeaders }
    )
  );
  assert.equal(latenessResponse.status, 200);
  const lateness = (await latenessResponse.json()) as Array<{
    deductionCategory: string;
  }>;
  assert.equal(lateness.length, 1);
  assert.equal(lateness[0]?.deductionCategory, "lateness");
});

test("AC-020 payroll export route emits mixed leave and attendance batch through HTTP boundary", async () => {
  const applicationId = await submitApprovedAnnualLeave();
  await seedAttendancePayrollRecords();

  const response = await exportPayrollReferencesRoute(
    new Request("http://localhost/api/hr/leave/payroll-references/export", {
      method: "POST",
      headers: payrollExportHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        payPeriodStart: "2026-06-01",
        payPeriodEnd: "2026-06-30",
        exportedBy: "payroll-001",
        deductionCategories: [
          "approved_leave",
          "absence",
          "lateness",
          "attendance_deduction",
        ],
      }),
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    ok: boolean;
    references: Array<{ deductionCategory: string }>;
    batch: {
      referenceCount: number;
      leaveApplicationIds: string[];
      attendanceRecordIds: string[];
    };
  };
  assert.equal(payload.ok, true);
  assert.equal(payload.references.length, 4);
  assert.equal(payload.batch.referenceCount, 4);
  assert.ok(payload.batch.leaveApplicationIds.includes(applicationId));
  assert.equal(payload.batch.attendanceRecordIds.length, 3);
});

test("AC-020 payroll references list route fails closed without payroll reference capability", async () => {
  await seedAttendancePayrollRecords();

  const response = await listPayrollReferencesRoute(
    new Request(
      `http://localhost/api/hr/leave/payroll-references?${payPeriodQuery}&deductionCategory=all`,
      {
        headers: {
          "x-company-id": "company-001",
          "x-tenant-id": "tenant-001",
          "x-can-read-lam": "true",
        },
      }
    )
  );
  assert.equal(response.status, 200);

  const references = (await response.json()) as unknown[];
  assert.deepEqual(references, []);
});
