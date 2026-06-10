import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { renderMetadataField } from "../src/adapters";
import {
  MetadataDiagnosticsPanel,
  MetadataForm,
  renderMetadataFormResult,
} from "../src/components";
import type { MetadataFieldContract } from "../src/contracts";
import type { MetadataRenderContext } from "../src/contracts/render-context.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { defaultFieldRegistry } from "../src/registry";
import { test } from "./test-runtime";

const fields: readonly MetadataFieldContract[] = [
  {
    key: "name",
    label: "Name",
    kind: "text",
    placeholder: "Enter name",
  },
  {
    key: "status",
    label: "Status",
    kind: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    key: "enabled",
    label: "Enabled",
    kind: "checkbox",
  },
];

type TestElement = ReactElement<any, any>;

const collectElements = (
  node: ReactNode,
  elements: TestElement[] = []
): TestElement[] => {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectElements(child, elements);
    }

    return elements;
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return elements;
  }

  const element = node as TestElement;

  if (element.type === MetadataDiagnosticsPanel) {
    collectElements(MetadataDiagnosticsPanel(element.props), elements);
    return elements;
  }

  elements.push(element);
  collectElements(element.props.children, elements);

  return elements;
};

test("defaultFieldRegistry resolves the concrete field renderer", () => {
  const textRenderer = defaultFieldRegistry.get("text").renderer;
  const selectRenderer = defaultFieldRegistry.get("select").renderer;
  const checkboxRenderer = defaultFieldRegistry.get("checkbox").renderer;

  assert.equal(textRenderer.name, "TextFieldRenderer");
  assert.equal(selectRenderer.name, "SelectFieldRenderer");
  assert.equal(checkboxRenderer.name, "CheckboxFieldRenderer");
});

test("renderMetadataField returns the rendered field primitive", () => {
  const context: MetadataRenderContext = createMetadataRenderContext(
    undefined,
    {
      mode: "create",
    }
  );

  const textField = renderMetadataField({
    context,
    field: fields[0],
    value: "Acme",
  }).element as TestElement;
  const selectField = renderMetadataField({
    context,
    field: fields[1],
    value: "draft",
  }).element as TestElement;
  const checkboxField = renderMetadataField({
    context,
    field: fields[2],
    value: true,
  }).element as TestElement;

  assert.equal(
    typeof textField.type === "string" ? textField.type : textField.type.name,
    "MetadataFieldShell"
  );
  assert.equal(
    typeof selectField.type === "string"
      ? selectField.type
      : selectField.type.name,
    "MetadataFieldShell"
  );
  assert.equal(
    typeof checkboxField.type === "string"
      ? checkboxField.type
      : checkboxField.type.name,
    "MetadataFieldShell"
  );
});

test("MetadataForm renders a form grid with all fields", () => {
  const element = MetadataForm({
    fields,
    title: "Customer",
    values: {
      enabled: true,
      name: "Acme",
      status: "draft",
    },
  }) as TestElement;

  const elements = collectElements(element);
  const form = elements.find((candidate) => candidate.type === "form");

  assert.ok(form);

  const grid = elements.find(
    (candidate) =>
      candidate.type === "div" &&
      typeof candidate.props.className === "string" &&
      candidate.props.className.includes("grid") &&
      candidate.props.className.includes("md:grid-cols-2") &&
      candidate.props.className.includes("gap-4")
  ) as TestElement | undefined;

  assert.ok(grid);
  assert.equal(Array.isArray(grid?.props.children), true);
  assert.equal(grid?.props.children.length, fields.length);
});

test("renderMetadataFormResult surfaces diagnostics for governed field fallbacks", () => {
  const result = renderMetadataFormResult({
    context: {
      correlationId: "corr-governance",
      diagnosticsEnabled: true,
    },
    fields: [
      {
        key: "employeeStatus",
        kind: "text",
        label: "Status",
        permission: "employee.write",
      },
    ],
    state: "ready",
  });

  assert.equal(result.diagnostics.length > 0, true);
  assert.equal(result.diagnostics[0]?.code, "missing-permission");
  assert.ok(
    collectElements(result.element).some(
      (element) => element.props?.["data-diagnostics-enabled"] === "true"
    )
  );
  assert.ok(
    collectElements(result.element).some(
      (element) => element.props?.["data-diagnostics-panel"] === "true"
    )
  );
});
