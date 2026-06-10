import assert from "node:assert/strict";
import { test } from "node:test";
import { employeeLifecycleManagementAuditEvents } from "../src/contract.ts";
import {
  applyEmployeeLifecycleTransition,
  createEmployeeLifecycleState,
  EmployeeLifecycleTransitionError,
  employeeLifecycleStageValues,
  employeeLifecycleStateSchema,
  getEmployeeLifecycleAllowedTransitionTargets,
  getEmployeeLifecycleStateFromHistory,
  isEmployeeLifecycleStateConsistent,
} from "../src/schema.ts";

test("defines the canonical lifecycle stage catalog", () => {
  assert.deepEqual(employeeLifecycleStageValues, [
    "preboarding",
    "hiring",
    "onboarding",
    "probation",
    "confirmed",
    "active",
    "suspended",
    "notice_period",
    "offboarding",
    "separated",
    "retired",
    "archived",
  ]);
  assert.deepEqual(getEmployeeLifecycleAllowedTransitionTargets("active"), [
    "suspended",
    "notice_period",
    "offboarding",
    "separated",
    "retired",
    "archived",
  ]);
});

test("creates a consistent initial lifecycle state", () => {
  const state = createEmployeeLifecycleState({
    employeeId: "emp-001",
    companyId: "co-001",
    tenantId: "tenant-001",
    initialStage: "preboarding",
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
    actorId: "hr-admin",
  });

  const parsedState = employeeLifecycleStateSchema.parse(state);

  assert.equal(parsedState.currentStage, "preboarding");
  assert.equal(parsedState.history.length, 1);
  assert.equal(
    parsedState.history[0]?.event,
    employeeLifecycleManagementAuditEvents.stateInitialized
  );
  assert.ok(isEmployeeLifecycleStateConsistent(parsedState));
});

test("applies valid transitions and preserves transition history", () => {
  const initialState = createEmployeeLifecycleState({
    employeeId: "emp-002",
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });

  const hiringState = applyEmployeeLifecycleTransition(initialState, {
    toStage: "hiring",
    effectiveAt: new Date("2026-06-02T00:00:00.000Z"),
    recordedAt: new Date("2026-06-02T00:00:00.000Z"),
    reason: "Offer accepted",
  });

  const onboardingState = applyEmployeeLifecycleTransition(hiringState, {
    toStage: "onboarding",
    effectiveAt: new Date("2026-06-03T00:00:00.000Z"),
    recordedAt: new Date("2026-06-03T00:00:00.000Z"),
  });

  assert.equal(onboardingState.currentStage, "onboarding");
  assert.equal(onboardingState.history.length, 3);
  assert.equal(
    onboardingState.history[1]?.event,
    employeeLifecycleManagementAuditEvents.transitionApplied
  );
  assert.equal(onboardingState.history[2]?.sequence, 2);
  assert.deepEqual(
    onboardingState.history[2] && "toStage" in onboardingState.history[2]
      ? onboardingState.history[2].toStage
      : undefined,
    "onboarding"
  );
  assert.ok(isEmployeeLifecycleStateConsistent(onboardingState));
  assert.deepEqual(
    getEmployeeLifecycleStateFromHistory({
      employeeId: onboardingState.employeeId,
      companyId: onboardingState.companyId,
      tenantId: onboardingState.tenantId,
      history: onboardingState.history,
    }),
    onboardingState
  );
});

test("rejects invalid lifecycle transitions", () => {
  const state = createEmployeeLifecycleState({
    employeeId: "emp-003",
  });

  assert.throws(
    () =>
      applyEmployeeLifecycleTransition(state, {
        toStage: "retired",
        effectiveAt: new Date("2026-06-05T00:00:00.000Z"),
      }),
    (error: unknown) =>
      error instanceof EmployeeLifecycleTransitionError &&
      error.currentStage === "preboarding" &&
      error.targetStage === "retired"
  );
});
