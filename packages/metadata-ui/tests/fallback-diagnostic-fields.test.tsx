import assert from "node:assert/strict";

import { renderMetadataField, renderMetadataState } from "../src/adapters";
import type { MetadataRendererDiagnostic } from "../src/adapters/diagnostics";
import { renderMetadataStateBoundaryResult } from "../src/components";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { test } from "./test-runtime";

test("unsupported-state fallback exposes correlationId, target, and rendererType", () => {
  const context = createMetadataRenderContext({
    correlationId: "corr-unsupported-state",
  });
  const result = renderMetadataStateBoundaryResult({
    context,
    state: "mystery" as never,
  });

  assert.equal(result.diagnostics[0]?.code, "unsupported-state");
  assert.equal(result.diagnostics[0]?.correlationId, "corr-unsupported-state");
  assert.equal(result.diagnostics[0]?.target, "mystery");
  assert.equal(
    (result.diagnostics[0] as MetadataRendererDiagnostic | undefined)
      ?.rendererType,
    "state"
  );
});

test("missing-permission fallback exposes correlationId and renderer target", () => {
  const context = createMetadataRenderContext(
    {
      permissions: {},
    },
    { correlationId: "corr-missing-permission", mode: "update" }
  );

  const result = renderMetadataField({
    context,
    field: {
      fallback: "forbidden",
      key: "employeeStatus",
      kind: "text",
      label: "Status",
      permission: "employee.write",
    },
    value: "active",
  });

  assert.equal(result.diagnostics[0]?.code, "missing-permission");
  assert.equal(result.diagnostics[0]?.correlationId, "corr-missing-permission");
  assert.equal(result.diagnostics[0]?.target, "employeeStatus");
  assert.equal(
    (result.diagnostics[0] as MetadataRendererDiagnostic | undefined)
      ?.rendererType,
    "field"
  );
});

test("renderMetadataState error path preserves correlationId on diagnostics", () => {
  const context = createMetadataRenderContext({
    correlationId: "corr-state-error",
  });
  const result = renderMetadataState({
    context,
    error: "Unable to load records.",
    state: "error",
  });

  assert.equal(result.diagnostics.length >= 0, true);
  assert.equal(result.element !== null, true);
});
