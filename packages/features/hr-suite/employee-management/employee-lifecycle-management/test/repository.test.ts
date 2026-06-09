import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  applyEmployeeLifecycleTransition,
  createEmployeeLifecycleRepositoryId,
  createEmployeeLifecycleState,
  findEmployeeLifecycleStateByEmployeeId,
  loadEmployeeLifecycleRepository,
  mutateEmployeeLifecycleRepository,
  removeEmployeeLifecycleState,
  resetEmployeeLifecycleRepositoryForTesting,
  saveEmployeeLifecycleRepository,
  setEmployeeLifecycleRepositoryPathForTesting,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

test("persists lifecycle states with scope-aware file storage", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-repository-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  const northState = createEmployeeLifecycleState({
    employeeId: "emp-north",
    companyId: "co-north",
    tenantId: "tenant-a",
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });
  const southState = createEmployeeLifecycleState({
    employeeId: "emp-south",
    companyId: "co-south",
    tenantId: "tenant-b",
    effectiveAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:00.000Z"),
  });

  saveEmployeeLifecycleRepository({
    states: [northState, southState],
  });

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);

  const tenantAState = loadEmployeeLifecycleRepository({
    tenantId: "tenant-a",
  });
  assert.equal(tenantAState.states.length, 1);
  assert.equal(tenantAState.states[0]?.employeeId, "emp-north");

  const transitionState = applyEmployeeLifecycleTransition(northState, {
    toStage: "hiring",
    effectiveAt: new Date("2026-06-02T00:00:00.000Z"),
    recordedAt: new Date("2026-06-02T00:00:00.000Z"),
  });

  mutateEmployeeLifecycleRepository(
    (draft) => {
      draft.states = draft.states.map((state) =>
        state.employeeId === transitionState.employeeId
          ? transitionState
          : state
      );
    },
    { tenantId: "tenant-a" }
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);

  const reloadedRepository = loadEmployeeLifecycleRepository();
  assert.equal(reloadedRepository.states.length, 2);
  assert.equal(
    reloadedRepository.states.find((state) => state.employeeId === "emp-north")
      ?.currentStage,
    "hiring"
  );
  assert.equal(
    reloadedRepository.states.find((state) => state.employeeId === "emp-south")
      ?.currentStage,
    "preboarding"
  );
});

test("exposes repository lookup and mutation helpers", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-repository-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  const state = createEmployeeLifecycleState({
    employeeId: "emp-repo",
    tenantId: "tenant-a",
  });

  assert.equal(createEmployeeLifecycleRepositoryId().length > 0, true);
  assert.equal(findEmployeeLifecycleStateByEmployeeId("emp-repo"), null);

  upsertEmployeeLifecycleState(state);

  assert.equal(
    findEmployeeLifecycleStateByEmployeeId("emp-repo")?.currentStage,
    "preboarding"
  );
  assert.equal(removeEmployeeLifecycleState("emp-repo"), true);
  assert.equal(findEmployeeLifecycleStateByEmployeeId("emp-repo"), null);
});
