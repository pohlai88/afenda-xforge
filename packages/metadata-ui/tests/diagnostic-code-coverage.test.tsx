import assert from "node:assert/strict";
import type { ReactElement } from "react";

import {
  collectManifestDuplicateRendererDiagnostics,
  createDuplicateRendererDiagnostic,
  createUnsupportedStateDiagnostic,
  renderMetadataAction,
  renderMetadataField,
  renderMetadataSection,
  renderMetadataState,
  resolveMetadataFieldRenderer,
  resolveMetadataStateRenderer,
} from "../src/adapters";
import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../src/contracts/field-renderer.contract";
import type { MetadataUiState } from "../src/contracts/render-context.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import type { MetadataStateRenderer } from "../src/contracts/state-renderer.contract";
import { createRendererRegistry } from "../src/registry/create-renderer-registry";
import { TextFieldRenderer } from "../src/renderers/fields/text-field.renderer";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const context = createMetadataRenderContext(undefined, { mode: "read" });

test("invalid-contract diagnostic is emitted for structurally invalid field contracts", () => {
  const result = renderMetadataField({
    context,
    field: {
      key: "",
      kind: "text",
      label: "Status",
    },
  });

  assert.equal(result.diagnostics[0]?.code, "invalid-contract");
  assert.match(String(result.diagnostics[0]?.message ?? ""), /non-empty key/);
  assert.equal((result.element as TestElement).type.name, "InvalidState");
});

test("invalid-contract diagnostic is emitted for structurally invalid action contracts", () => {
  const result = renderMetadataAction({
    action: {
      key: "archive",
      kind: "archive",
      label: "",
    },
    context,
  });

  assert.equal(result.diagnostics[0]?.code, "invalid-contract");
  assert.match(String(result.diagnostics[0]?.message ?? ""), /non-empty label/);
});

test("invalid-contract diagnostic is emitted for unsupported action kinds", () => {
  const result = renderMetadataAction({
    action: {
      key: "save",
      kind: "launch" as never,
      label: "Save",
    },
    context,
  });

  assert.equal(result.diagnostics[0]?.code, "invalid-contract");
  assert.match(
    String(result.diagnostics[0]?.message ?? ""),
    /unsupported kind/
  );
});

test("invalid-contract diagnostic is emitted for select fields without options", () => {
  const result = renderMetadataField({
    context,
    field: {
      key: "status",
      kind: "select",
      label: "Status",
    },
  });

  assert.equal(result.diagnostics[0]?.code, "invalid-contract");
  assert.match(
    String(result.diagnostics[0]?.message ?? ""),
    /requires at least one option/
  );
});

test("invalid-contract diagnostic is emitted for structurally invalid section contracts", () => {
  const result = renderMetadataSection({
    context,
    section: {
      key: "summary",
      kind: "section",
      title: "",
    },
  });

  assert.equal(result.diagnostics[0]?.code, "invalid-contract");
  assert.match(String(result.diagnostics[0]?.message ?? ""), /non-empty title/);
});

test("deprecated-renderer diagnostic is emitted when resolving deprecated registrations", () => {
  const registry = createRendererRegistry<
    MetadataFieldKind,
    MetadataFieldRenderer
  >([
    {
      deprecated: true,
      key: "text",
      renderer: TextFieldRenderer,
      version: "1.0.0",
    },
  ]);
  const resolution = resolveMetadataFieldRenderer("text", registry);

  assert.equal(resolution.diagnostic?.code, "deprecated-renderer");
  assert.match(String(resolution.diagnostic?.message ?? ""), /deprecated/i);
});

test("unsupported-renderer-version diagnostic is emitted when version constraints fail", () => {
  const registry = createRendererRegistry<
    MetadataFieldKind,
    MetadataFieldRenderer
  >([
    {
      key: "text",
      renderer: TextFieldRenderer,
      version: "0.9.0",
    },
  ]);
  const constrainedContext = createMetadataRenderContext({
    rendererVersionConstraints: {
      "field:text": { min: "1.0.0" },
    },
  });
  const resolution = resolveMetadataFieldRenderer(
    "text",
    registry,
    constrainedContext
  );

  assert.equal(resolution.diagnostic?.code, "unsupported-renderer-version");
});

test("duplicate-renderer diagnostic is emitted for duplicate manifest registry keys", () => {
  const entries = [
    {
      composeGroup: "field",
      fixture: false,
      kind: "field",
      publicExport: true,
      registryKey: "text",
      rendererExport: "TextFieldRenderer",
      rendererPath: "fields/text-field.renderer.tsx",
      smokeTest: false,
      title: "Text field renderer",
    },
    {
      composeGroup: "field",
      fixture: false,
      kind: "field",
      publicExport: true,
      registryKey: "text",
      rendererExport: "TextFieldRenderer",
      rendererPath: "fields/text-field.renderer.tsx",
      smokeTest: false,
      title: "Text field renderer duplicate",
    },
  ] satisfies readonly import("../metadata-ui.manifest.ts").MetadataUiManifestEntry[];

  const diagnostics = collectManifestDuplicateRendererDiagnostics(entries);

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0]?.code, "duplicate-renderer");
  assert.equal(
    createDuplicateRendererDiagnostic("field", "text").code,
    "duplicate-renderer"
  );
});

test("unsupported-state diagnostic is emitted for unknown runtime state keys", () => {
  const result = renderMetadataState({
    context,
    state: "mystery",
  });

  assert.equal(result.diagnostics[0]?.code, "unsupported-state");
  assert.equal(
    createUnsupportedStateDiagnostic("mystery").code,
    "unsupported-state"
  );
  assert.equal((result.element as TestElement).type.name, "ErrorState");
});

test("known but unregistered state still emits missing-renderer diagnostic", () => {
  const registry = createRendererRegistry<
    MetadataUiState,
    MetadataStateRenderer
  >([]);
  const resolution = resolveMetadataStateRenderer("loading", registry);

  assert.equal(resolution.diagnostic?.code, "missing-renderer");
});
