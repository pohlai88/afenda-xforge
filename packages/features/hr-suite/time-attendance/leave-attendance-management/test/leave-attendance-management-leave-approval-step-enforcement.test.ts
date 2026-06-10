import assert from "node:assert/strict";
import { test } from "node:test";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  assertActorAuthorizedForApprovalStep,
  evaluateApprovalStepAuthorization,
  mapLamMutationErrorToHttpStatus,
  requiresLeaveApprovalStepIdentityEnforcement,
  resolveLeaveApprovalActorEmployeeId,
} from "../src/shared/index.ts";

const fallbackRoute = {
  id: "route-fallback",
  companyId: "company-001",
  code: "AL-FALLBACK",
  title: "Fallback Route",
  steps: [
    {
      order: 1,
      kind: "direct_manager" as const,
      label: "Manager",
      fallbackToHr: true,
    },
  ],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const route = {
  id: "route-001",
  companyId: "company-001",
  code: "AL-ROUTE",
  title: "Route",
  steps: [
    { order: 1, kind: "direct_manager" as const, label: "Manager" },
    {
      order: 2,
      kind: "named_approver" as const,
      label: "Named",
      approverRef: "approver-001",
    },
  ],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const pendingApplication = {
  approvalRouteId: "route-001",
  currentStepOrder: 1,
  status: "pending_approval" as const,
};

test("requiresLeaveApprovalStepIdentityEnforcement applies only to routed pending approvals", () => {
  assert.equal(
    requiresLeaveApprovalStepIdentityEnforcement(pendingApplication),
    true
  );
  assert.equal(
    requiresLeaveApprovalStepIdentityEnforcement({
      ...pendingApplication,
      status: "submitted",
    }),
    false
  );
  assert.equal(
    requiresLeaveApprovalStepIdentityEnforcement({
      ...pendingApplication,
      approvalRouteId: null,
    }),
    false
  );
});

test("assertActorAuthorizedForApprovalStep accepts orchestration-resolved direct manager", () => {
  assert.doesNotThrow(() =>
    assertActorAuthorizedForApprovalStep({
      application: pendingApplication,
      route,
      context: {
        actorEmployeeId: "mgr-001",
        resolvedStepApproverEmployeeIds: ["mgr-001"],
      },
      approvedBy: "mgr-001",
    })
  );
});

test("assertActorAuthorizedForApprovalStep rejects unauthorized actor on direct manager step", () => {
  assert.throws(
    () =>
      assertActorAuthorizedForApprovalStep({
        application: pendingApplication,
        route,
        context: {
          actorEmployeeId: "mgr-002",
          resolvedStepApproverEmployeeIds: ["mgr-001"],
        },
        approvedBy: "mgr-002",
      }),
    /not authorized for approval workflow step "direct_manager"/
  );
});

test("assertActorAuthorizedForApprovalStep accepts named approver via approverRef", () => {
  assert.doesNotThrow(() =>
    assertActorAuthorizedForApprovalStep({
      application: {
        ...pendingApplication,
        currentStepOrder: 2,
      },
      route,
      context: {
        actorEmployeeId: "approver-001",
      },
      approvedBy: "approver-001",
    })
  );
});

test("assertActorAuthorizedForApprovalStep allows HR officer bypass for configured HR admins", () => {
  assert.doesNotThrow(() =>
    assertActorAuthorizedForApprovalStep({
      application: {
        ...pendingApplication,
        currentStepOrder: 2,
      },
      route: {
        ...route,
        steps: [{ order: 2, kind: "hr_officer" as const, label: "HR" }],
      },
      context: {
        actorEmployeeId: "hr-admin",
        canWrite: true,
        grantedCapabilities: [
          leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
          leaveAttendanceManagementCapabilities.leaveEntitlementsWrite,
        ],
      },
      approvedBy: "hr-admin",
    })
  );
});

test("resolveLeaveApprovalActorEmployeeId rejects approvedBy mismatch", () => {
  assert.throws(
    () =>
      resolveLeaveApprovalActorEmployeeId({
        context: { actorEmployeeId: "mgr-001" },
        approvedBy: "mgr-002",
      }),
    /does not match authenticated actor employee identity/
  );
});

test("mapLamMutationErrorToHttpStatus maps unauthorized workflow actor to 403", () => {
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      'Actor is not authorized for approval workflow step "direct_manager" (order 1)'
    ),
    403
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      "HR fallback delegation is active but actor is not an authorized HR fallback approver"
    ),
    403
  );
});

test("fallbackToHr allows HR fallback only when delegation is active and actor is resolved", () => {
  const pending = {
    approvalRouteId: "route-fallback",
    currentStepOrder: 1,
    status: "pending_approval" as const,
  };

  assert.doesNotThrow(() =>
    assertActorAuthorizedForApprovalStep({
      application: pending,
      route: fallbackRoute,
      context: {
        actorEmployeeId: "hr-001",
        hrFallbackDelegated: true,
        resolvedHrFallbackApproverEmployeeIds: ["hr-001"],
        resolvedStepApproverEmployeeIds: ["mgr-001"],
      },
      approvedBy: "hr-001",
    })
  );

  const evaluation = evaluateApprovalStepAuthorization({
    application: pending,
    route: fallbackRoute,
    context: {
      actorEmployeeId: "hr-001",
      hrFallbackDelegated: true,
      resolvedHrFallbackApproverEmployeeIds: ["hr-001"],
      resolvedStepApproverEmployeeIds: ["mgr-001"],
    },
    approvedBy: "hr-001",
  });
  assert.equal(evaluation.authorized, true);
  if (evaluation.authorized) {
    assert.equal(evaluation.outcome.viaHrFallbackDelegation, true);
    assert.equal(evaluation.outcome.viaPrimaryApprover, false);
  }
});

test("fallbackToHr rejects HR actor when delegation flag is not set", () => {
  assert.throws(
    () =>
      assertActorAuthorizedForApprovalStep({
        application: {
          approvalRouteId: "route-fallback",
          currentStepOrder: 1,
          status: "pending_approval",
        },
        route: fallbackRoute,
        context: {
          actorEmployeeId: "hr-001",
          resolvedHrFallbackApproverEmployeeIds: ["hr-001"],
          resolvedStepApproverEmployeeIds: ["mgr-001"],
        },
        approvedBy: "hr-001",
      }),
    /not authorized for approval workflow step "direct_manager"/
  );
});

test("fallbackToHr rejects HR actor when delegation is active but HR list is empty", () => {
  assert.throws(
    () =>
      assertActorAuthorizedForApprovalStep({
        application: {
          approvalRouteId: "route-fallback",
          currentStepOrder: 1,
          status: "pending_approval",
        },
        route: fallbackRoute,
        context: {
          actorEmployeeId: "hr-001",
          hrFallbackDelegated: true,
          resolvedHrFallbackApproverEmployeeIds: [],
          resolvedStepApproverEmployeeIds: ["mgr-001"],
        },
        approvedBy: "hr-001",
      }),
    /no resolved HR fallback approvers were supplied/
  );
});
