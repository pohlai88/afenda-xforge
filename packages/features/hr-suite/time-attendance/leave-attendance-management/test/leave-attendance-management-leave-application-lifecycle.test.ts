import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  approveLamLeaveApplication,
  returnLamLeaveApplication,
} from "../src/actions/leave-application-decisions.action.ts";
import {
  amendLamLeaveApplication,
  cancelLamLeaveApplication,
} from "../src/actions/leave-application-lifecycle.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveApprovalRoute } from "../src/actions/leave-approval-routes.action.ts";
import { upsertLamLeaveBlackoutPeriod } from "../src/actions/leave-blackout-periods.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { requireLamBalanceWriteAccess } from "../src/execution.ts";
import { getLamLeaveApplicationById } from "../src/queries/leave-applications.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { buildLamStepApproverContext } from "./lam-approval-test-context.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

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
  actorEmployeeId: "mgr-001",
  resolvedStepApproverEmployeeIds: ["mgr-001"],
  teamEmployeeIds: ["emp-001"],
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  ],
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
  ],
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

const seedBalance = async (): Promise<void> => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

const seedApprovalRoute = async (): Promise<void> => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-APPROVE-ROUTE",
      title: "Approval Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [
        { order: 1, kind: "direct_manager", label: "Manager" },
        { order: 2, kind: "hr_officer", label: "HR" },
      ],
      active: true,
    },
    writeContext
  );
};

const submitPendingApplication = async (args?: {
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
}): Promise<string> => {
  await seedApprovalRoute();

  const startDate = args?.startDate ?? new Date("2026-07-01");
  const endDate = args?.endDate ?? new Date("2026-07-03");
  const totalDays = args?.totalDays ?? 3;

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate,
      endDate,
      totalDays,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  return submit.targetId;
};

const approveApplicationFully = async (
  applicationId: string
): Promise<void> => {
  const first = await approveLamLeaveApplication(
    { applicationId, approvedBy: "mgr-001" },
    buildLamStepApproverContext(approveContext, "mgr-001")
  );
  assert.equal(first.ok, true);

  const second = await approveLamLeaveApplication(
    { applicationId, approvedBy: "hr-001" },
    buildLamStepApproverContext(approveContext, "hr-001")
  );
  assert.equal(second.ok, true);
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-lifecycle-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
    },
    writeContext
  );
  assert.equal(leaveType.ok, true);
  if (!leaveType.ok) {
    throw new Error("Failed to seed leave type");
  }
  leaveTypeId = leaveType.targetId;

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY",
      title: "Annual Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await seedBalance();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("balance write access gate requires balances write capability or write access", () => {
  assert.equal(requireLamBalanceWriteAccess(undefined)?.ok, false);
  assert.equal(requireLamBalanceWriteAccess(writeContext), null);
  assert.equal(
    requireLamBalanceWriteAccess({
      companyId: "company-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveBalancesWrite,
      ],
    }),
    null
  );
  assert.equal(
    requireLamBalanceWriteAccess({
      companyId: "company-001",
      canWrite: false,
      grantedCapabilities: [],
    })?.ok,
    false
  );
});

test("HRM-LAM-017 cancel pending application releases pending balance", async () => {
  const applicationId = await submitPendingApplication();

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId,
      cancellationReason: "Travel plans changed",
    },
    writeContext
  );
  assert.equal(cancelled.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "cancelled");
  assert.equal(application?.cancellationReason, "Travel plans changed");
  assert.ok(application?.cancelledAt);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 18);

  const cancelAudit = state.auditEvents.filter(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationCancelled
  );
  assert.equal(cancelAudit.length, 1);

  const balanceAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.leaveApplicationId === applicationId &&
      entry.metadata.pendingAfter === 0
  );
  assert.ok(balanceAudit);
});

test("AC-014 cancel approved application reverses used balance", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId,
      cancellationReason: "Project deadline moved",
    },
    approveContext
  );
  assert.equal(cancelled.ok, true);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 18);

  const cancelAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveApplicationCancelled &&
      entry.entityId === applicationId
  );
  assert.ok(cancelAudit);

  const balanceAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.leaveApplicationId === applicationId &&
      entry.metadata.usedAfter === 0
  );
  assert.ok(balanceAudit);
});

test("HRM-LAM-017 cancel requires cancellation reason", async () => {
  const applicationId = await submitPendingApplication();

  const result = await cancelLamLeaveApplication(
    {
      applicationId,
      cancellationReason: "   ",
    },
    writeContext
  );
  assert.equal(result.ok, false);
});

test("AC-014 amend approved application adjusts used balance", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const amended = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-04"),
      totalDays: 4,
      amendmentReason: "Extended stay by one day",
      amendedBy: "hr-001",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
      departmentId: employeeProfile.departmentId,
    },
    approveContext
  );
  assert.equal(amended.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "approved");
  assert.equal(application?.totalDays, 4);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.used, 4);
  assert.equal(balance?.remaining, 14);

  const amendAudit = state.auditEvents.filter(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationAmended
  );
  assert.equal(amendAudit.length, 1);

  const balanceAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.leaveApplicationId === applicationId &&
      entry.metadata.usedAfter === 4 &&
      entry.metadata.previousTotalDays === 3 &&
      entry.metadata.nextTotalDays === 4
  );
  assert.ok(balanceAudit);
});

test("AC-014 amend reducing total days decreases used balance", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const amended = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      amendmentReason: "Shortened by one day",
      amendedBy: "hr-001",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
      departmentId: employeeProfile.departmentId,
    },
    approveContext
  );
  assert.equal(amended.ok, true);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.used, 2);
  assert.equal(balance?.remaining, 16);
});

test("AC-014 cancel pending fails closed when leave type is inactive but pending remains", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-CANCEL-INACTIVE",
      title: "Single Step Cancel Inactive Type",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      active: false,
    },
    writeContext
  );

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId: submit.targetId,
      cancellationReason: "Type deactivated after submit",
    },
    writeContext
  );
  assert.equal(cancelled.ok, false);
  if (cancelled.ok) {
    throw new Error("Expected cancel to fail when leave type is inactive");
  }
  assert.match(
    cancelled.error,
    /Active leave type is required to release pending leave balance/i
  );

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");
});

test("AC-014 cancel approved fails closed when leave type is inactive but used remains", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-CANCEL-APPROVED-INACTIVE",
      title: "Single Step Cancel Approved Inactive",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const approved = await approveLamLeaveApplication(
    {
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    buildLamStepApproverContext(approveContext, "mgr-001")
  );
  assert.equal(approved.ok, true);

  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      active: false,
    },
    writeContext
  );

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId: submit.targetId,
      cancellationReason: "Should fail balance reversal",
    },
    approveContext
  );
  assert.equal(cancelled.ok, false);
  if (cancelled.ok) {
    throw new Error("Expected cancel to fail when leave type is inactive");
  }
  assert.match(
    cancelled.error,
    /Active leave type is required to reverse used leave balance/i
  );

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "approved");
});

test("AC-014 amend rejects cross-period balance adjustment", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2027-01-02"),
      endDate: new Date("2027-01-05"),
      totalDays: 4,
      amendmentReason: "Move to next year",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
    },
    approveContext
  );
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected cross-period amend to fail");
  }
  assert.match(result.error, /across leave balance periods/i);
});

test("HRM-LAM-017 amend rejects non-approved application", async () => {
  const applicationId = await submitPendingApplication();

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-04"),
      totalDays: 4,
      amendmentReason: "Should fail",
    },
    approveContext
  );
  assert.equal(result.ok, false);
});

test("HRM-LAM-016 amend rejects when insufficient balance for extension", async () => {
  const applicationId = await submitPendingApplication({
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-07-18"),
    totalDays: 18,
  });
  await approveApplicationFully(applicationId);

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-19"),
      totalDays: 19,
      amendmentReason: "One more day",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
    },
    approveContext
  );
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected insufficient balance failure");
  }
  assert.match(result.error, /Insufficient leave balance/i);
});

test("HRM-LAM-011 amend rejects leave during blackout period", async () => {
  const blackout = await upsertLamLeaveBlackoutPeriod(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "PEAK-AMEND",
      title: "Peak Season Amendment",
      reason: "Peak season amendment block",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-31"),
      scope: { countryCode: "MY" },
      active: true,
    },
    writeContext
  );
  assert.equal(blackout.ok, true);

  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-08-05"),
      endDate: new Date("2026-08-07"),
      totalDays: 3,
      amendmentReason: "Move into peak period",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
    },
    approveContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected blackout rejection on amend");
  }
  assert.match(result.error, /blackout period "PEAK-AMEND"/i);
});

test("HRM-LAM-011 amend rejects insufficient minimum notice", async () => {
  await upsertLamLeaveType(
    {
      id: leaveTypeId,
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
      minNoticeDays: 14,
    },
    writeContext
  );

  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const shortNoticeStart = new Date();
  shortNoticeStart.setUTCDate(shortNoticeStart.getUTCDate() + 3);
  const shortNoticeEnd = new Date(shortNoticeStart);
  shortNoticeEnd.setUTCDate(shortNoticeEnd.getUTCDate() + 2);

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: shortNoticeStart,
      endDate: shortNoticeEnd,
      totalDays: 3,
      amendmentReason: "Reschedule with short notice",
      hireDate: employeeProfile.hireDate,
      countryCode: employeeProfile.countryCode,
      grade: employeeProfile.grade,
    },
    approveContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected insufficient notice on amend");
  }
  assert.match(result.error, /Minimum notice period is 14 day/);
});

test("HRM-LAM-017 cancel returned application performs no balance change", async () => {
  const applicationId = await submitPendingApplication();

  const returned = await returnLamLeaveApplication(
    {
      applicationId,
      returnedReason: "Add supporting details",
    },
    buildLamStepApproverContext(approveContext, "mgr-001")
  );
  assert.equal(returned.ok, true);

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId,
      cancellationReason: "No longer needed",
    },
    writeContext
  );
  assert.equal(cancelled.ok, true);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 0);
  assert.equal(balance?.remaining, 18);
});

test("HRM-LAM-017 cancel approved application requires strict approval access", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const result = await cancelLamLeaveApplication(
    {
      applicationId,
      cancellationReason: "Should fail without approve capability",
    },
    writeContext
  );
  assert.equal(result.ok, false);
});

test("HRM-LAM-017 cancel submitted application releases pending balance", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-02"),
      totalDays: 2,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "submitted");

  const cancelled = await cancelLamLeaveApplication(
    {
      applicationId: submit.targetId,
      cancellationReason: "Plans changed",
    },
    writeContext
  );
  assert.equal(cancelled.ok, true);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
});

test("HRM-LAM-017 amend fails closed without approval access", async () => {
  const applicationId = await submitPendingApplication();
  await approveApplicationFully(applicationId);

  const result = await amendLamLeaveApplication(
    {
      applicationId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-04"),
      totalDays: 4,
      amendmentReason: "Unauthorized amend attempt",
    },
    {
      companyId: "company-001",
      canWrite: false,
      grantedCapabilities: [],
    }
  );
  assert.equal(result.ok, false);
});
