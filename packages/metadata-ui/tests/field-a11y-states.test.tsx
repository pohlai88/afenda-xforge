import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import type { MetadataFieldRendererProps } from "../src/contracts/field-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  CheckboxFieldRenderer,
  DateFieldRenderer,
  MoneyFieldRenderer,
  NumberFieldRenderer,
  SelectFieldRenderer,
  SwitchFieldRenderer,
  TextareaFieldRenderer,
  TextFieldRenderer,
} from "../src/renderers/fields";
import { resolveFieldVisualState } from "../src/renderers/fields/field-visual-state";
import { MetadataFieldShell } from "../src/renderers/fields/metadata-field-shell";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const baseContext = createMetadataRenderContext(undefined, { mode: "update" });

const baseField = {
  key: "invoiceNumber",
  label: "Invoice number",
  kind: "text" as const,
  helpText: "Enter the invoice identifier.",
};

const expandFieldShell = (node: ReactNode): ReactNode => {
  if (Array.isArray(node)) {
    return node.map((child) => expandFieldShell(child));
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;

  if (element.type === MetadataFieldShell) {
    return expandFieldShell(MetadataFieldShell(element.props));
  }

  return {
    ...element,
    props: {
      ...element.props,
      children: expandFieldShell(element.props.children),
    },
  };
};

const findElementByProp = (
  node: ReactNode,
  predicate: (element: TestElement) => boolean
): TestElement | undefined => {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElementByProp(child, predicate);
      if (match) {
        return match;
      }
    }

    return;
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return;
  }

  const element = node as TestElement;

  if (predicate(element)) {
    return element;
  }

  return findElementByProp(element.props.children, predicate);
};

const isFieldControl = (candidate: TestElement): boolean => {
  const typeName =
    typeof candidate.type === "string" ? candidate.type : candidate.type?.name;
  const slot = candidate.props?.["data-slot"];

  return (
    slot === "input" ||
    slot === "textarea" ||
    slot === "native-select" ||
    slot === "checkbox" ||
    slot === "switch" ||
    slot === "badge" ||
    typeName === "Input" ||
    typeName === "Textarea" ||
    typeName === "NativeSelect" ||
    typeName === "Checkbox" ||
    typeName === "Switch" ||
    typeName === "Badge"
  );
};

const findControl = (element: TestElement): TestElement | undefined => {
  const matches: TestElement[] = [];

  const collectControls = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      for (const child of node) {
        collectControls(child);
      }

      return;
    }

    if (!node || typeof node !== "object" || !("type" in node)) {
      return;
    }

    const candidate = node as TestElement;

    if (isFieldControl(candidate)) {
      matches.push(candidate);
    }

    collectControls(candidate.props.children);
  };

  collectControls(element);

  return (
    matches.find((candidate) => Boolean(candidate.props?.["data-slot"])) ??
    matches[0]
  );
};

const renderField = (
  renderer: (props: MetadataFieldRendererProps) => ReactElement,
  overrides: Partial<MetadataFieldRendererProps> = {}
): TestElement =>
  expandFieldShell(
    renderer({
      context: baseContext,
      field: baseField,
      value: "INV-001",
      ...overrides,
    })
  ) as TestElement;

test("resolveFieldVisualState generates stable help and error ids", () => {
  const visualState = resolveFieldVisualState({
    context: baseContext,
    diagnostics: [
      {
        code: "renderer-error",
        correlationId: "corr-field-error",
        message: "Invoice number is invalid.",
        severity: "error",
        target: baseField.key,
      },
    ],
    field: baseField,
  });

  assert.equal(visualState.controlId, baseField.key);
  assert.equal(visualState.helpId, `${baseField.key}-help`);
  assert.equal(visualState.errorId, `${baseField.key}-error`);
  assert.equal(
    visualState.describedBy,
    `${baseField.key}-help ${baseField.key}-error`
  );
});

test("field renderers associate labels, controls, and help text", () => {
  const renderers = [
    TextFieldRenderer,
    NumberFieldRenderer,
    MoneyFieldRenderer,
    DateFieldRenderer,
    TextareaFieldRenderer,
    SelectFieldRenderer,
    CheckboxFieldRenderer,
    SwitchFieldRenderer,
  ];

  for (const renderer of renderers) {
    const element = renderField(renderer);
    const label = findElementByProp(
      element,
      (candidate) =>
        candidate.type?.name === "FieldLabel" ||
        candidate.props?.["data-slot"] === "field-label"
    );
    const control = findControl(element);
    const description = findElementByProp(
      element,
      (candidate) =>
        candidate.type?.name === "FieldDescription" ||
        candidate.props?.["data-slot"] === "field-description"
    );

    assert.ok(label, `${renderer.name} should render FieldLabel`);
    assert.ok(control, `${renderer.name} should render a field control`);
    assert.equal(
      label?.props.htmlFor,
      control?.props.id,
      `${renderer.name} FieldLabel htmlFor must match control id`
    );
    assert.ok(description, `${renderer.name} should render FieldDescription`);
    assert.equal(
      description?.props.id,
      `${baseField.key}-help`,
      `${renderer.name} help text id must match visual state`
    );
    assert.equal(
      control?.props["aria-describedby"],
      `${baseField.key}-help`,
      `${renderer.name} control aria-describedby must include help id`
    );
    assert.notEqual(control?.props["aria-label"], baseField.label);
  }
});

test("field renderers expose alert-backed inline errors linked to controls", () => {
  const renderers = [
    TextFieldRenderer,
    NumberFieldRenderer,
    MoneyFieldRenderer,
    DateFieldRenderer,
    TextareaFieldRenderer,
    SelectFieldRenderer,
    CheckboxFieldRenderer,
    SwitchFieldRenderer,
  ];

  for (const renderer of renderers) {
    const element = renderField(renderer, {
      diagnostics: [
        {
          code: "renderer-error",
          correlationId: "corr-field-error",
          message: "Invoice number is invalid.",
          severity: "error",
          target: baseField.key,
        },
      ],
    });
    const control = findControl(element);
    const error = findElementByProp(
      element,
      (candidate) =>
        candidate.type?.name === "FieldError" ||
        candidate.props?.["data-slot"] === "field-error"
    );

    assert.ok(error, `${renderer.name} should render FieldError`);
    assert.equal(error?.props.id, `${baseField.key}-error`);
    assert.ok(
      error?.type?.name === "FieldError" ||
        error?.props?.["data-slot"] === "field-error",
      `${renderer.name} should compose @repo/ui FieldError (role="alert" enforced by check:field-a11y)`
    );
    assert.equal(control?.props["aria-invalid"], true);
    assert.equal(
      control?.props["aria-describedby"],
      `${baseField.key}-help ${baseField.key}-error`
    );
  }
});

test("status field renderer associates label, badge control, and inline errors", () => {
  const element = renderField(TextFieldRenderer, {
    field: {
      ...baseField,
      key: "status",
      kind: "status",
      label: "Status",
    },
    value: "active",
  });
  const label = findElementByProp(
    element,
    (candidate) =>
      candidate.type?.name === "FieldLabel" ||
      candidate.props?.["data-slot"] === "field-label"
  );
  const control = findControl(element);

  assert.ok(label, "status field should render FieldLabel");
  assert.ok(control, "status field should render a badge control");
  assert.equal(label?.props.htmlFor, control?.props.id);
  assert.equal(control?.props.id, "status");
  assert.equal(control?.props["aria-describedby"], "status-help");
});
