import assert from "node:assert/strict";
import { test } from "node:test";
import { mapLamMutationErrorToHttpStatus } from "../src/shared/leave-application-submit.ts";
import {
  assertLeaveApplicationReadyForApprovalDecision,
  isLeaveApplicationInConfiguredWorkflow,
  lamLeaveApprovalStepKindLabels,
  resolveLeaveApprovalProgress,
} from "../src/shared/leave-approval-workflow.ts";

const sampleRoute = {
  id: "route-001",
  companyId: "company-001",
  code: "AL-ROUTE",
  title: "Annual Leave Route",
  leaveTypeId: "lt-001",
  steps: [
    { order: 1, kind: "direct_manager" as const, label: "Manager" },
    { order: 2, kind: "hr_officer" as const, label: "HR" },
  ],
  active: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

test("AC-010 resolveLeaveApprovalProgress tracks multi-step workflow position", () => {
  const firstStep = resolveLeaveApprovalProgress({
    application: {
      approvalRouteId: "route-001",
      currentStepOrder: 1,
      status: "pending_approval",
    },
    route: sampleRoute,
  });

  assert.equal(firstStep.currentStep?.kind, "direct_manager");
  assert.equal(firstStep.nextStep?.kind, "hr_officer");
  assert.equal(firstStep.isFinalStep, false);

  const finalStep = resolveLeaveApprovalProgress({
    application: {
      approvalRouteId: "route-001",
      currentStepOrder: 2,
      status: "pending_approval",
    },
    route: sampleRoute,
  });

  assert.equal(finalStep.currentStep?.kind, "hr_officer");
  assert.equal(finalStep.nextStep, null);
  assert.equal(finalStep.isFinalStep, true);
});

test("AC-010 isLeaveApplicationInConfiguredWorkflow detects routed applications", () => {
  assert.equal(
    isLeaveApplicationInConfiguredWorkflow({
      approvalRouteId: "route-001",
      status: "pending_approval",
    }),
    true
  );
  assert.equal(
    isLeaveApplicationInConfiguredWorkflow({
      approvalRouteId: null,
      status: "submitted",
    }),
    false
  );
});

test("AC-010 assertLeaveApplicationReadyForApprovalDecision rejects inconsistent routing state", () => {
  assert.throws(
    () =>
      assertLeaveApplicationReadyForApprovalDecision({
        approvalRouteId: "route-001",
        currentStepOrder: 1,
        status: "submitted",
      }),
    /not pending approval/
  );

  assert.doesNotThrow(() =>
    assertLeaveApplicationReadyForApprovalDecision({
      approvalRouteId: "route-001",
      currentStepOrder: 1,
      status: "pending_approval",
    })
  );
});

test("AC-010 lamLeaveApprovalStepKindLabels exposes configured step kinds", () => {
  assert.equal(lamLeaveApprovalStepKindLabels.direct_manager, "Direct Manager");
  assert.equal(lamLeaveApprovalStepKindLabels.hr_officer, "HR Officer");
});

test("AC-010 mapLamMutationErrorToHttpStatus maps workflow validation failures to 422", () => {
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      "Leave application must be in submitted status to route"
    ),
    422
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      "Leave application has a configured approval route but is not pending approval"
    ),
    422
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus("rejection reason is required"),
    422
  );
});
