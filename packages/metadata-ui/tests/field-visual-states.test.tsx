import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { renderMetadataField } from "../src/adapters";
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
    typeName === "Input" ||
    typeName === "Textarea" ||
    typeName === "NativeSelect" ||
    typeName === "Checkbox" ||
    typeName === "Switch"
  );
};

const findControl = (element: TestElement): TestElement | undefined => {
  const collectControls = (node: ReactNode, matches: TestElement[]): void => {
    if (Array.isArray(node)) {
      for (const child of node) {
        collectControls(child, matches);
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

    collectControls(candidate.props.children, matches);
  };

  const matches: TestElement[] = [];
  collectControls(element, matches);

  return (
    matches.find((candidate) => Boolean(candidate.props?.["data-slot"])) ??
    matches[0]
  );
};

const usesReadOnlyControl = (control: TestElement | undefined): boolean => {
  const slot = control?.props?.["data-slot"];
  const typeName =
    typeof control?.type === "string" ? control.type : control?.type?.name;

  return (
    slot === "input" ||
    slot === "textarea" ||
    typeName === "Input" ||
    typeName === "Textarea"
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

test("resolveFieldVisualState separates disabled and readonly", () => {
  const disabledState = resolveFieldVisualState({
    context: baseContext,
    disabled: true,
    field: baseField,
  });

  assert.equal(disabledState.isDisabled, true);
  assert.equal(disabledState.isReadOnly, false);

  const readonlyState = resolveFieldVisualState({
    context: createMetadataRenderContext(
      {
        readonly: true,
      },
      {
        mode: "read",
      }
    ),
    field: baseField,
  });

  assert.equal(readonlyState.isReadOnly, true);
  assert.equal(readonlyState.isDisabled, false);
});

test("field renderers expose default, disabled, readonly, and error visual states", () => {
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
    const defaultElement = renderField(renderer);
    const defaultControl = findControl(defaultElement);

    assert.ok(
      defaultControl,
      `${renderer.name} should render a design-system control`
    );
    assert.equal(defaultControl?.props.disabled, undefined);
    assert.equal(defaultControl?.props.readOnly, undefined);
    assert.notEqual(defaultControl?.props["aria-invalid"], true);

    const disabledElement = renderField(renderer, { disabled: true });
    const disabledControl = findControl(disabledElement);

    assert.equal(disabledControl?.props.disabled, true);
    assert.notEqual(disabledControl?.props.readOnly, true);

    const readonlyElement = renderField(renderer, {
      context: createMetadataRenderContext(
        {
          readonly: true,
        },
        {
          mode: "read",
        }
      ),
    });
    const readonlyControl = findControl(readonlyElement);

    assert.ok(
      readonlyControl,
      `${renderer.name} should render a readonly design-system control`
    );

    if (usesReadOnlyControl(readonlyControl)) {
      assert.equal(readonlyControl.props.readOnly, true);
      assert.notEqual(readonlyControl.props.disabled, true);
    } else {
      assert.equal(readonlyControl.props.disabled, true);
    }

    const errorElement = renderField(renderer, {
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
    const errorControl = findControl(errorElement);

    assert.equal(errorControl?.props["aria-invalid"], true);
    assert.ok(
      findElementByProp(
        errorElement,
        (candidate) =>
          candidate.type?.name === "FieldError" ||
          candidate.props?.["data-slot"] === "field-error"
      ),
      `${renderer.name} should render FieldError for error diagnostics`
    );
  }
});

test("renderMetadataField preserves readonly governance without disabling the control", () => {
  const context = createMetadataRenderContext(
    { permissions: {} },
    {
      mode: "update",
    }
  );

  const result = renderMetadataField({
    context,
    field: {
      fallback: "readonly",
      key: "amount",
      kind: "text",
      label: "Amount",
      permission: "invoice.write",
    },
    value: "1200",
  });

  const control = findControl(expandFieldShell(result.element) as TestElement);

  assert.equal(control?.props.readOnly, true);
  assert.notEqual(control?.props.disabled, true);
});

test("status field renders a token-backed badge surface", () => {
  const element = renderField(TextFieldRenderer, {
    field: {
      ...baseField,
      key: "status",
      kind: "status",
      label: "Status",
    },
    value: "active",
  });

  assert.ok(
    findElementByProp(element, (candidate) => candidate.type?.name === "Badge")
  );
});
