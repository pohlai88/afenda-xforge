import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  approveLamLeaveApplication,
  rejectLamLeaveApplication,
  requestLamLeaveApplicationClarification,
  returnLamLeaveApplication,
} from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveApprovalRoute } from "../src/actions/leave-approval-routes.action.ts";
import { adjustLamLeaveBalance } from "../src/actions/leave-balance-adjustment.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { requireLamApprovalAccess } from "../src/execution.ts";
import { getLamLeaveApplicationById } from "../src/queries/leave-applications.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  buildLamHrFallbackApproverContext,
  buildLamStepApproverContext,
} from "./lam-approval-test-context.ts";

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

const managerStepContext = buildLamStepApproverContext(
  approveContext,
  "mgr-001"
);
const hrStepContext = buildLamStepApproverContext(approveContext, "hr-001");

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
  ],
} as const;

const approverReadContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
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

const submitProfile = { ...employeeProfile } as const;

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

const submitPendingApplication = async (args?: {
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
}): Promise<string> => {
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

  const startDate = args?.startDate ?? new Date("2026-07-01");
  const endDate = args?.endDate ?? new Date("2026-07-03");
  const totalDays = args?.totalDays ?? 3;

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
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

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");
  return submit.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-decisions-${randomUUID()}.json`
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

test("approval access gate requires approve capability or write access", () => {
  assert.equal(requireLamApprovalAccess(undefined)?.ok, false);
  assert.equal(requireLamApprovalAccess(approveContext), null);
  assert.equal(requireLamApprovalAccess(writeContext), null);
  assert.equal(
    requireLamApprovalAccess({
      ...approveContext,
      grantedCapabilities: [],
      canWrite: false,
    })?.ok,
    false
  );
});

test("HRM-LAM-014 approve advances multi-step workflow then finalizes", async () => {
  const applicationId = await submitPendingApplication();

  const first = await approveLamLeaveApplication(
    {
      applicationId,
      approvedBy: "mgr-001",
    },
    managerStepContext
  );
  assert.equal(first.ok, true);

  const afterFirst = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(afterFirst?.status, "pending_approval");
  assert.equal(afterFirst?.currentStepOrder, 2);

  const stateAfterFirst = await loadLamRepository(readContext);
  const balanceAfterFirst = stateAfterFirst.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balanceAfterFirst?.pending, 3);
  assert.equal(balanceAfterFirst?.used, 0);
  assert.equal(balanceAfterFirst?.remaining, 15);

  const second = await approveLamLeaveApplication(
    {
      applicationId,
      approvedBy: "hr-001",
    },
    hrStepContext
  );
  assert.equal(second.ok, true);

  const afterSecond = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(afterSecond?.status, "approved");
  assert.ok(afterSecond?.approvedAt);
  assert.equal(afterSecond?.approvedBy, "hr-001");

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 3);
  assert.equal(balance?.remaining, 15);

  const balanceAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.leaveApplicationId === applicationId &&
      entry.metadata.usedAfter === 3 &&
      entry.metadata.pendingAfter === 0
  );
  assert.ok(balanceAudit);

  const approvedAudit = state.auditEvents.filter(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationApproved
  );
  assert.equal(approvedAudit.length, 2);
});

test("AC-013 approved leave updates leave balance on single-step final approval", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-SINGLE-FINAL",
      title: "Single Step Final Approval",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const stateBefore = await loadLamRepository(readContext);
  const balanceBefore = stateBefore.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balanceBefore?.pending, 3);
  assert.equal(balanceBefore?.used, 0);

  const approved = await approveLamLeaveApplication(
    {
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    managerStepContext
  );
  assert.equal(approved.ok, true);

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "approved");

  const stateAfter = await loadLamRepository(readContext);
  const balanceAfter = stateAfter.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balanceAfter?.pending, 0);
  assert.equal(balanceAfter?.used, 3);
  assert.equal(balanceAfter?.remaining, 15);

  const balanceAudit = stateAfter.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveBalanceUpdated &&
      entry.metadata.leaveApplicationId === submit.targetId
  );
  assert.ok(balanceAudit);
});

test("AC-013 approve fails closed when leave type is inactive but pending balance remains", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-INACTIVE-TYPE",
      title: "Single Step Inactive Type Guard",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
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

  const approved = await approveLamLeaveApplication(
    {
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    managerStepContext
  );
  assert.equal(approved.ok, false);
  if (approved.ok) {
    throw new Error("Expected approve to fail when leave type is inactive");
  }
  assert.match(
    approved.error,
    /Active leave type is required to finalize leave balance/i
  );

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 3);
  assert.equal(balance?.used, 0);
});

test("HRM-LAM-009 approve rejects insufficient balance after post-submit balance adjustment", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-SINGLE-APPROVE",
      title: "Single Step Approval Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const adjusted = await adjustLamLeaveBalance(
    {
      companyId: "company-001",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      periodYear: 2026,
      adjustmentDays: -16,
      reason: "Post-submit balance correction",
      authorizedBy: "hr-admin",
    },
    writeContext
  );
  assert.equal(adjusted.ok, true);

  const approved = await approveLamLeaveApplication(
    {
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    managerStepContext
  );
  assert.equal(approved.ok, false);
  if (approved.ok) {
    throw new Error("Expected final approval to fail after balance reduction");
  }
  assert.match(approved.error, /Insufficient leave balance/);

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");
});

test("HRM-LAM-015 reject requires and stores rejection reason", async () => {
  const applicationId = await submitPendingApplication();

  const missingReason = await rejectLamLeaveApplication(
    {
      applicationId,
      rejectionReason: "   ",
    },
    managerStepContext
  );
  assert.equal(missingReason.ok, false);
  if (missingReason.ok) {
    throw new Error("Expected empty rejection reason to fail");
  }
  assert.match(missingReason.error, /rejection reason is required/i);

  const rejected = await rejectLamLeaveApplication(
    {
      applicationId,
      rejectionReason: "Insufficient staffing during peak period",
    },
    managerStepContext
  );
  assert.equal(rejected.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    approverReadContext
  );
  assert.equal(application?.status, "rejected");
  assert.equal(
    application?.rejectionReason,
    "Insufficient staffing during peak period"
  );

  const redactedApplication = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(redactedApplication?.status, "rejected");
  assert.equal(redactedApplication?.rejectionReason, null);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.remaining, 18);

  const rejectAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationRejected
  );
  assert.ok(rejectAudit);
  assert.equal(
    rejectAudit?.metadata.rejectionReason,
    "Insufficient staffing during peak period"
  );
});

test("HRM-LAM-014 return releases pending balance and stores returned reason", async () => {
  const applicationId = await submitPendingApplication();

  const result = await returnLamLeaveApplication(
    {
      applicationId,
      returnedReason: "Please attach updated travel itinerary",
    },
    managerStepContext
  );
  assert.equal(result.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "returned");
  assert.equal(
    application?.returnedReason,
    "Please attach updated travel itinerary"
  );
  assert.ok(application?.returnedAt);

  const state = await loadLamRepository(readContext);
  const returnedAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationReturned
  );
  assert.ok(returnedAudit);
  assert.equal(returnedAudit?.metadata.requestType, "return");
  assert.equal(returnedAudit?.metadata.viaPrimaryApprover, true);

  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === "emp-001" &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.remaining, 18);
});

test("HRM-LAM-014 request clarification returns application for employee follow-up", async () => {
  const applicationId = await submitPendingApplication();

  const result = await requestLamLeaveApplicationClarification(
    {
      applicationId,
      clarificationReason: "Clarify whether leave is paid or unpaid",
    },
    managerStepContext
  );
  assert.equal(result.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "returned");
  assert.equal(
    application?.returnedReason,
    "Clarify whether leave is paid or unpaid"
  );

  const state = await loadLamRepository(readContext);
  const clarifyAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveApplicationReturned &&
      entry.metadata.requestType === "clarification"
  );
  assert.ok(clarifyAudit);
  assert.equal(clarifyAudit?.metadata.viaPrimaryApprover, true);

  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === "emp-001" &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
});

test("AC-011 employee can resubmit after clarification request", async () => {
  const applicationId = await submitPendingApplication();

  await requestLamLeaveApplicationClarification(
    {
      applicationId,
      clarificationReason: "Confirm travel dates",
    },
    managerStepContext
  );

  const resubmit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      id: applicationId,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Updated after clarification",
    },
    writeContext
  );
  assert.equal(resubmit.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");
  assert.equal(application?.returnedReason, null);
});

test("AC-011 employee can resubmit returned leave application", async () => {
  const applicationId = await submitPendingApplication();

  await returnLamLeaveApplication(
    {
      applicationId,
      returnedReason: "Add supporting details",
    },
    managerStepContext
  );

  const resubmit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      id: applicationId,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Updated reason after return",
    },
    writeContext
  );
  assert.equal(resubmit.ok, true);

  const application = await getLamLeaveApplicationById(
    applicationId,
    readContext
  );
  assert.equal(application?.status, "pending_approval");
  assert.equal(application?.returnedReason, null);
  assert.equal(application?.reason, "Updated reason after return");

  const approved = await approveLamLeaveApplication(
    {
      applicationId,
      approvedBy: "mgr-001",
    },
    managerStepContext
  );
  assert.equal(approved.ok, true);

  const afterFirst = await approveLamLeaveApplication(
    {
      applicationId,
      approvedBy: "hr-001",
    },
    hrStepContext
  );
  assert.equal(afterFirst.ok, true);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 3);
});

test("approve rejects invalid application status", async () => {
  const applicationId = await submitPendingApplication();

  await rejectLamLeaveApplication(
    {
      applicationId,
      rejectionReason: "Not approved",
    },
    managerStepContext
  );

  const result = await approveLamLeaveApplication(
    { applicationId },
    managerStepContext
  );
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected approve after reject to fail");
  }
  assert.match(result.error, /submitted or pending approval/);
});

test("fallbackToHr allows HR fallback approver when delegation is active", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-FALLBACK-ROUTE",
      title: "Manager with HR Fallback",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [
        {
          order: 1,
          kind: "direct_manager",
          label: "Manager",
          fallbackToHr: true,
        },
      ],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-03"),
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
      approvedBy: "hr-001",
    },
    buildLamHrFallbackApproverContext(
      approveContext,
      "hr-001",
      ["hr-001"],
      ["mgr-001"]
    )
  );
  assert.equal(approved.ok, true);

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(application?.status, "approved");

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 0);
  assert.equal(balance?.used, 3);

  const approveAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
        leaveAttendanceManagementAuditEvents.leaveApplicationApproved &&
      entry.entityId === submit.targetId
  );
  assert.equal(approveAudit?.metadata.viaHrFallbackDelegation, true);
});

test("decision actions reject unauthorized workflow actor on configured step", async () => {
  const applicationId = await submitPendingApplication();
  const unauthorizedContext = buildLamStepApproverContext(
    approveContext,
    "wrong-mgr",
    ["mgr-001"]
  );

  const deniedApprove = await approveLamLeaveApplication(
    {
      applicationId,
      approvedBy: "wrong-mgr",
    },
    unauthorizedContext
  );
  assert.equal(deniedApprove.ok, false);
  if (deniedApprove.ok) {
    throw new Error("Expected unauthorized workflow actor to be denied");
  }
  assert.match(
    deniedApprove.error,
    /not authorized for approval workflow step/
  );

  const deniedReject = await rejectLamLeaveApplication(
    {
      applicationId,
      rejectionReason: "Not approved",
      approvedBy: "wrong-mgr",
    },
    unauthorizedContext
  );
  assert.equal(deniedReject.ok, false);

  const deniedReturn = await returnLamLeaveApplication(
    {
      applicationId,
      returnedReason: "Needs changes",
      approvedBy: "wrong-mgr",
    },
    unauthorizedContext
  );
  assert.equal(deniedReturn.ok, false);

  const deniedClarify = await requestLamLeaveApplicationClarification(
    {
      applicationId,
      clarificationReason: "Need more detail",
      approvedBy: "wrong-mgr",
    },
    unauthorizedContext
  );
  assert.equal(deniedClarify.ok, false);
});

test("decision actions fail closed without approval access", async () => {
  const applicationId = await submitPendingApplication();

  const denied = await approveLamLeaveApplication(
    { applicationId },
    {
      actorId: "viewer-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [],
    }
  );
  assert.equal(denied.ok, false);
  if (denied.ok) {
    throw new Error("Expected approval to be denied");
  }
  assert.match(denied.error, /Approval access denied/);
});
