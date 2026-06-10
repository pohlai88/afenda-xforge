import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import {
  routeLamLeaveApplication,
  upsertLamLeaveApprovalRoute,
} from "../src/actions/leave-approval-routes.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  routeMatchesApprovalContext,
  selectLeaveApprovalRoute,
} from "../src/projector/approval-routing.ts";
import { getLamLeaveApplicationById } from "../src/queries/leave-applications.query.ts";
import {
  getLamLeaveApprovalRouteById,
  listLamLeaveApprovalRoutesRecords,
} from "../src/queries/leave-approval-routes.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { lamLeaveApprovalRouteSchema } from "../src/schema.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";

const writeContext = {
  actorId: "hr-admin-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
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

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-approval-routing-${randomUUID()}.json`
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

test("approval-routing selects most specific route by leave type, duration, and grade", () => {
  const now = new Date();
  const generic = lamLeaveApprovalRouteSchema.parse({
    id: "route-generic",
    companyId: "company-001",
    code: "GENERIC",
    title: "Generic Route",
    leaveTypeId: null,
    scope: {},
    minDurationDays: null,
    maxDurationDays: null,
    steps: [{ order: 1, kind: "direct_manager" }],
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  const gradeSpecific = lamLeaveApprovalRouteSchema.parse({
    id: "route-grade",
    companyId: "company-001",
    code: "G5-ROUTE",
    title: "Grade G5 Route",
    leaveTypeId,
    scope: { grade: "G5" },
    minDurationDays: null,
    maxDurationDays: null,
    steps: [
      { order: 1, kind: "direct_manager" },
      { order: 2, kind: "hr_officer" },
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  const longLeave = lamLeaveApprovalRouteSchema.parse({
    id: "route-long",
    companyId: "company-001",
    code: "LONG-LEAVE",
    title: "Long Leave Route",
    leaveTypeId,
    scope: { grade: "G5", departmentId: "dept-sales" },
    minDurationDays: 5,
    maxDurationDays: null,
    steps: [
      { order: 1, kind: "department_head" },
      { order: 2, kind: "hr_officer" },
    ],
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  assert.equal(
    routeMatchesApprovalContext(longLeave, {
      companyId: "company-001",
      leaveTypeId,
      totalDays: 6,
      scope: { grade: "G5", departmentId: "dept-sales" },
    }),
    true
  );
  assert.equal(
    routeMatchesApprovalContext(longLeave, {
      companyId: "company-001",
      leaveTypeId,
      totalDays: 3,
      scope: { grade: "G5", departmentId: "dept-sales" },
    }),
    false
  );

  const selected = selectLeaveApprovalRoute(
    [generic, gradeSpecific, longLeave],
    {
      companyId: "company-001",
      leaveTypeId,
      totalDays: 6,
      scope: { grade: "G5", departmentId: "dept-sales" },
    }
  );
  assert.equal(selected?.id, "route-long");
});

test("HRM-LAM-012 upsertLamLeaveApprovalRoute persists workflow steps", async () => {
  const result = await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-MANAGER-HR",
      title: "Annual Leave Manager + HR",
      leaveTypeId,
      scope: { countryCode: "MY", grade: "G5" },
      steps: [
        {
          order: 1,
          kind: "direct_manager",
          label: "Line Manager",
          fallbackToHr: true,
        },
        {
          order: 2,
          kind: "hr_officer",
          label: "HR Officer",
        },
      ],
      active: true,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected route upsert to succeed");
  }

  const route = await getLamLeaveApprovalRouteById(
    result.targetId,
    readContext
  );
  assert.ok(route);
  assert.equal(route?.code, "AL-MANAGER-HR");
  assert.equal(route?.steps.length, 2);
  assert.equal(route?.steps[0]?.kind, "direct_manager");
  assert.equal(route?.steps[0]?.fallbackToHr, true);

  const routes = await listLamLeaveApprovalRoutesRecords(
    { leaveTypeId, grade: "G5" },
    readContext
  );
  assert.equal(routes.length, 1);

  const state = await loadLamRepository(readContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApprovalRouteCreated
  );
  assert.ok(audit);
  assert.equal(audit?.entityType, "approval_route");
});

test("HRM-LAM-012 submit auto-routes application to pending_approval when route matches", async () => {
  const route = await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-SUBMIT-ROUTE",
      title: "Submit Auto Route",
      leaveTypeId,
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager" }],
      active: true,
    },
    writeContext
  );
  assert.equal(route.ok, true);

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

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.ok(application);
  assert.equal(application?.status, "pending_approval");
  assert.equal(application?.approvalRouteId, route.ok ? route.targetId : null);
  assert.equal(application?.currentStepOrder, 1);

  const state = await loadLamRepository(readContext);
  const routedAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationRouted
  );
  assert.ok(routedAudit);
  assert.equal(routedAudit?.metadata.stepKind, "direct_manager");
});

test("HRM-LAM-013 route selection respects department and duration bounds", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "DEPT-SALES",
      title: "Sales Department Route",
      leaveTypeId,
      scope: { departmentId: "dept-sales", grade: "G5" },
      minDurationDays: 2,
      maxDurationDays: 5,
      steps: [
        { order: 1, kind: "department_head" },
        { order: 2, kind: "hr_officer" },
      ],
      active: true,
    },
    writeContext
  );

  const matching = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-10"),
      endDate: new Date("2026-07-12"),
      totalDays: 3,
    },
    writeContext
  );
  assert.equal(matching.ok, true);

  const application = await getLamLeaveApplicationById(
    matching.ok ? matching.targetId : "",
    readContext
  );
  assert.equal(application?.status, "pending_approval");

  const noRouteMatch = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-17"),
      totalDays: 8,
    },
    writeContext
  );
  assert.equal(noRouteMatch.ok, true);
  if (!noRouteMatch.ok) {
    throw new Error("Expected submit without matching route to succeed");
  }

  const unmatchedApplication = await getLamLeaveApplicationById(
    noRouteMatch.targetId,
    readContext
  );
  assert.equal(unmatchedApplication?.status, "submitted");
  assert.equal(unmatchedApplication?.approvalRouteId, null);
});

test("HRM-LAM-012 routeLamLeaveApplication routes submitted application when route configured later", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-01"),
      totalDays: 1,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const before = await getLamLeaveApplicationById(submit.targetId, readContext);
  assert.equal(before?.status, "submitted");

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "LATE-ROUTE",
      title: "Late Configured Route",
      leaveTypeId,
      steps: [{ order: 1, kind: "direct_manager" }],
      active: true,
    },
    writeContext
  );

  const routed = await routeLamLeaveApplication(
    {
      applicationId: submit.targetId,
      grade: "G5",
      departmentId: "dept-sales",
    },
    writeContext
  );
  assert.equal(routed.ok, true);

  const after = await getLamLeaveApplicationById(submit.targetId, readContext);
  assert.equal(after?.status, "pending_approval");
  assert.equal(after?.currentStepOrder, 1);
});

test("HRM-LAM-012 routeLamLeaveApplication rejects reroute when not submitted", async () => {
  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "MANUAL-ROUTE",
      title: "Manual Route",
      leaveTypeId,
      steps: [{ order: 1, kind: "hr_officer", label: "HR Review" }],
      active: true,
    },
    writeContext
  );

  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-01"),
      totalDays: 1,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const beforeRoute = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.equal(beforeRoute?.status, "pending_approval");

  const reroute = await routeLamLeaveApplication(
    {
      applicationId: submit.targetId,
      grade: "G5",
      departmentId: "dept-sales",
    },
    writeContext
  );
  assert.equal(reroute.ok, false);
  if (reroute.ok) {
    throw new Error("Expected reroute to fail when not submitted");
  }
  assert.match(reroute.error, /must be in submitted status/);
});

test("upsertLamLeaveApprovalRoute rejects fallbackToHr on hr_officer steps", async () => {
  const result = await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "AL-HR-FALLBACK-INVALID",
      title: "Invalid HR Fallback",
      steps: [{ order: 1, kind: "hr_officer", fallbackToHr: true }],
      active: true,
    },
    writeContext
  );
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected invalid hr_officer fallbackToHr to fail");
  }
  assert.match(result.error, /cannot use fallbackToHr/);
});

test("upsertLamLeaveApprovalRoute rejects named_approver without approverRef", async () => {
  const result = await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "INVALID-NAMED",
      title: "Invalid Named Approver",
      leaveTypeId,
      steps: [{ order: 1, kind: "named_approver" }],
      active: true,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected invalid named approver to fail");
  }
  assert.match(result.error, /requires approverRef/);
});

test("AC-010 submit without matching route remains submitted", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-01"),
      totalDays: 1,
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
  assert.equal(application?.approvalRouteId, null);

  const state = await loadLamRepository(readContext);
  const routedAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationRouted
  );
  assert.equal(routedAudit, undefined);
});
