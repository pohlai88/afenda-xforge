import assert from "node:assert/strict";

import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { evaluateMetadataGovernance } from "../src/policy/governance";
import { test } from "./test-runtime";

const createContext = () =>
  createMetadataRenderContext(
    {
      capabilities: {},
      featureFlags: {},
      permissions: {},
    },
    { correlationId: "corr-governance-coverage", mode: "update" }
  );

test("capability-mismatch diagnostic includes correlation metadata", () => {
  const context = createContext();
  const evaluation = evaluateMetadataGovernance({
    context,
    key: "archive",
    policy: { capability: "billing.archive", fallback: "forbidden" },
    target: "action",
  });

  assert.equal(evaluation.diagnostic?.code, "capability-mismatch");
  assert.equal(evaluation.diagnostic?.correlationId, context.correlationId);
  assert.equal(evaluation.diagnostic?.target, "archive");
  assert.equal(evaluation.diagnostic?.rendererType, "action");
});

test("feature-flag-disabled diagnostic includes correlation metadata", () => {
  const context = createContext();
  const evaluation = evaluateMetadataGovernance({
    context,
    key: "beta-action",
    policy: { featureFlag: "beta-actions", fallback: "disable" },
    target: "action",
  });

  assert.equal(evaluation.diagnostic?.code, "feature-flag-disabled");
  assert.equal(evaluation.diagnostic?.correlationId, context.correlationId);
  assert.equal(evaluation.diagnostic?.target, "beta-action");
});

test("readonly-mode diagnostic includes correlation metadata", () => {
  const context = createContext();
  const evaluation = evaluateMetadataGovernance({
    context,
    key: "notes",
    readonly: true,
    target: "field",
  });

  assert.equal(evaluation.diagnostic?.code, "readonly-mode");
  assert.equal(evaluation.diagnostic?.correlationId, context.correlationId);
  assert.equal(evaluation.diagnostic?.target, "notes");
});

test("disabled-renderer diagnostic includes correlation metadata", () => {
  const context = createContext();
  const evaluation = evaluateMetadataGovernance({
    context,
    disabled: true,
    key: "status",
    target: "field",
  });

  assert.equal(evaluation.diagnostic?.code, "disabled-renderer");
  assert.equal(evaluation.diagnostic?.correlationId, context.correlationId);
  assert.equal(evaluation.diagnostic?.target, "status");
});
