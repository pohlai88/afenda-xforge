import assert from "node:assert/strict";
import type { ReactElement } from "react";
import {
  bindRendererDiagnosticCorrelation,
  createMissingRendererDiagnostic,
  createRendererErrorDiagnostic,
  mergeRendererDiagnostics,
} from "../src/adapters/diagnostics";
import {
  createMissingActionRenderer,
  createMissingFieldRenderer,
  createMissingSectionRenderer,
  resolveActionSurface,
} from "../src/adapters/fallbacks";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataActionRenderer,
} from "../src/adapters/metadata-renderer-resolvers";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;
const context = createMetadataRenderContext(undefined, { mode: "read" });

test("resolveActionSurface normalizes strings, undefined values, and action contracts", () => {
  assert.equal(resolveActionSurface(undefined), "button");
  assert.equal(resolveActionSurface("menu"), "menu");
  assert.equal(
    resolveActionSurface({
      key: "overflow",
      kind: "custom",
      label: "More",
      placement: "overflow",
    }),
    "menu"
  );
});

test("missing fallback renderers thread diagnostic message into the error state", () => {
  const fieldDiagnostic = createMissingRendererDiagnostic(
    "field",
    "legacy-field",
    "error-state"
  );
  const actionDiagnostic = createMissingRendererDiagnostic(
    "action",
    "legacy-action",
    "error-state"
  );
  const sectionDiagnostic = createMissingRendererDiagnostic(
    "section",
    "legacy-section",
    "error-state"
  );

  const fieldElement = createMissingFieldRenderer(fieldDiagnostic)({
    context,
    field: {
      key: "legacy-field",
      kind: "legacy-field" as never,
      label: "Legacy Field",
    },
  }) as TestElement;
  const actionElement = createMissingActionRenderer(actionDiagnostic)({
    action: {
      key: "legacy-action",
      kind: "legacy-action" as never,
      label: "Legacy Action",
    },
    context,
  }) as TestElement;
  const sectionElement = createMissingSectionRenderer(sectionDiagnostic)({
    context,
    section: {
      key: "legacy-section",
      kind: "legacy-section" as never,
      title: "Legacy Section",
    },
  }) as TestElement;

  assert.equal(fieldElement.props.title, "Unsupported field: Legacy Field");
  assert.equal(fieldElement.props.description, fieldDiagnostic.message);
  assert.equal(actionElement.props.title, "Unsupported action: Legacy Action");
  assert.equal(actionElement.props.description, actionDiagnostic.message);
  assert.equal(
    sectionElement.props.title,
    "Unsupported section: Legacy Section"
  );
  assert.equal(sectionElement.props.description, sectionDiagnostic.message);
});

test("renderer diagnostics can be rebound, merged, and synthesized from errors", () => {
  const originalDiagnostic = createMissingRendererDiagnostic(
    "field",
    "legacy-field",
    "error-state"
  );
  const rebound = bindRendererDiagnosticCorrelation(
    originalDiagnostic,
    "correlation-123"
  );
  assert.ok(rebound);
  const rendererError = createRendererErrorDiagnostic(
    "action",
    "archive",
    new Error("boom")
  );
  const synthesized = createMetadataRendererErrorDiagnostic(
    "section",
    "records",
    "unexpected",
    "correlation-456"
  );

  assert.equal(rebound?.correlationId, "correlation-123");
  assert.equal(
    bindRendererDiagnosticCorrelation(undefined, "unused"),
    undefined
  );
  assert.equal(rendererError.code, "renderer-error");
  assert.equal(rendererError.details?.error, "boom");
  assert.equal(synthesized.correlationId, "correlation-456");
  assert.equal(synthesized.details?.error, "unexpected");
  assert.deepEqual(
    mergeRendererDiagnostics([rebound], undefined, [rendererError]),
    [rebound, rendererError]
  );
});

test("missing action resolution emits a missing-renderer diagnostic", () => {
  const resolution = resolveMetadataActionRenderer("legacy-surface");
  const element = resolution.renderer({
    action: {
      key: "legacy",
      kind: "legacy-surface" as never,
      label: "Legacy",
    },
    context,
  }) as TestElement;

  assert.equal(resolution.diagnostic?.code, "missing-renderer");
  assert.equal(element.props.title, "Unsupported action: Legacy");
});
