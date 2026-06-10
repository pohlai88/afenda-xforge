import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { MetadataToolbar } from "../src/components/metadata-toolbar";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { TextFieldRenderer } from "../src/renderers/fields";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "../src/renderers/fields/field-visual-state";
import { MetadataFieldShell } from "../src/renderers/fields/metadata-field-shell";
import {
  DENSITY_VISUAL_MATRIX,
  resolveDensitySurfaceProps,
  resolveDensityTextareaClassName,
  resolveDensityVisualDefinition,
  resolveFieldControlDensityClassName,
} from "../src/visualization/density-visual-contract";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const baseField = {
  key: "invoiceNumber",
  label: "Invoice number",
  kind: "text" as const,
};

const expandFieldShell = (node: unknown): TestElement =>
  (typeof node === "object" &&
  node &&
  "type" in node &&
  (node as TestElement).type === MetadataFieldShell
    ? MetadataFieldShell((node as TestElement).props)
    : node) as TestElement;

test("DENSITY_VISUAL_MATRIX defines distinct spacing for each density", () => {
  assert.notEqual(
    DENSITY_VISUAL_MATRIX.compact.formSpacing,
    DENSITY_VISUAL_MATRIX.comfortable.formSpacing
  );
  assert.notEqual(
    DENSITY_VISUAL_MATRIX.compact.toolbarTitleClass,
    DENSITY_VISUAL_MATRIX.comfortable.toolbarTitleClass
  );
  assert.match(resolveDensityVisualDefinition("compact").formGridGap, /gap-/);
});

test("resolveDensitySurfaceProps maps compact and comfortable to data-density", () => {
  assert.deepEqual(resolveDensitySurfaceProps("compact"), {
    "data-density": "compact",
  });
  assert.deepEqual(resolveDensitySurfaceProps("comfortable"), {
    "data-density": "comfortable",
  });
  assert.deepEqual(resolveDensitySurfaceProps("default"), {});
});

test("resolveFieldControlDensityClassName applies token-backed control sizing", () => {
  assert.match(
    resolveFieldControlDensityClassName("compact"),
    /control-density/
  );
  assert.match(
    resolveFieldControlDensityClassName("compact"),
    /min-h-\[var\(--density-control-height\)\]/
  );
});

test("resolveDensityTextareaClassName scales minimum height by density", () => {
  assert.match(resolveDensityTextareaClassName("compact"), /min-h-20/);
  assert.match(resolveDensityTextareaClassName("default"), /min-h-24/);
  assert.match(resolveDensityTextareaClassName("comfortable"), /min-h-28/);
});

test("field renderers pass context.density to MetadataFieldShell", () => {
  const compactContext = createMetadataRenderContext(
    { density: "compact" },
    { mode: "update" }
  );
  const comfortableContext = createMetadataRenderContext(
    { density: "comfortable" },
    { mode: "update" }
  );

  const compactField = expandFieldShell(
    TextFieldRenderer({
      context: compactContext,
      field: baseField,
      value: "INV-001",
    })
  );
  const comfortableField = expandFieldShell(
    TextFieldRenderer({
      context: comfortableContext,
      field: baseField,
      value: "INV-001",
    })
  );

  assert.equal(compactField.props["data-density"], "compact");
  assert.equal(comfortableField.props["data-density"], "comfortable");
});

test("input field renderers compose control-density classes from context", () => {
  const context = createMetadataRenderContext(
    { density: "compact" },
    { mode: "update" }
  );
  const numberProps = {
    context,
    field: { ...baseField, key: "amount", kind: "number" as const },
    value: 1200,
  };
  const dateProps = {
    context,
    field: { ...baseField, key: "dueDate", kind: "date" as const },
    value: "2024-06-10",
  };
  const textareaProps = {
    context,
    field: { ...baseField, key: "notes", kind: "textarea" as const },
    value: "Notes",
  };

  const numberClassName = resolveFieldControlClassName(
    resolveFieldVisualState(numberProps),
    "w-full tabular-nums",
    context.density
  );
  const dateClassName = resolveFieldControlClassName(
    resolveFieldVisualState(dateProps),
    "w-full",
    context.density
  );
  const textareaClassName = resolveFieldControlClassName(
    resolveFieldVisualState(textareaProps),
    resolveDensityTextareaClassName(context.density),
    context.density
  );

  assert.ok(numberClassName);
  assert.ok(dateClassName);
  assert.ok(textareaClassName);
  assert.match(numberClassName, /control-density/);
  assert.match(dateClassName, /control-density/);
  assert.match(textareaClassName, /min-h-20/);
  assert.match(textareaClassName, /control-density/);
});

test("MetadataToolbar resolves density-specific title and surface props", () => {
  const compactToolbar = MetadataToolbar({
    context: createMetadataRenderContext(
      { density: "compact" },
      { mode: "read" }
    ),
    title: "Invoices",
  }) as TestElement;
  const comfortableToolbar = MetadataToolbar({
    context: createMetadataRenderContext(
      { density: "comfortable" },
      { mode: "read" }
    ),
    title: "Invoices",
  }) as TestElement;

  assert.equal(compactToolbar.props["data-density"], "compact");
  assert.equal(comfortableToolbar.props["data-density"], "comfortable");
  assert.match(compactToolbar.props.className, /gap-2/);
  assert.match(comfortableToolbar.props.className, /gap-6/);
});
