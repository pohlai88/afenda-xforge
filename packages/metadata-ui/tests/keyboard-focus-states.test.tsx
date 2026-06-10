import assert from "node:assert/strict";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { renderMetadataTableCell } from "../src/components/metadata-cell-renderers";
import { StatePanel } from "../src/components/state-panel";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  handleKeyboardActivation,
  METADATA_FOCUS_VISIBLE_RING_CLASS,
  METADATA_INTERACTIVE_LINK_CLASS,
  METADATA_INTERACTIVE_ROW_CLASS,
} from "../src/interaction/keyboard-focus-contract";
import { resolveActionVisualDefinition } from "../src/renderers/actions/action-visual-matrix";
import { BaseActionRenderer } from "../src/renderers/actions/base-action.renderer";
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

const isInteractiveControl = (candidate: TestElement): boolean => {
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
    typeName === "Switch" ||
    typeName === "Button"
  );
};

const findInteractiveControl = (
  element: TestElement
): TestElement | undefined =>
  findElementByProp(element, (candidate) => isInteractiveControl(candidate));

test("keyboard focus contract exposes token-backed focus-visible replacement", () => {
  assert.match(METADATA_FOCUS_VISIBLE_RING_CLASS, /outline-none/);
  assert.match(METADATA_FOCUS_VISIBLE_RING_CLASS, /focus-visible:ring-\[3px\]/);
  assert.match(METADATA_INTERACTIVE_LINK_CLASS, /focus-visible:ring-\[3px\]/);
  assert.match(METADATA_INTERACTIVE_ROW_CLASS, /focus-visible:ring-\[3px\]/);
});

test("handleKeyboardActivation responds to Enter and Space only", () => {
  let activated = 0;

  handleKeyboardActivation(
    {
      key: "Enter",
      preventDefault: () => {
        activated += 1;
      },
    } as KeyboardEvent<HTMLElement>,
    () => {
      activated += 10;
    }
  );

  assert.equal(activated, 11);

  handleKeyboardActivation(
    {
      key: "Tab",
      preventDefault: () => {
        activated += 1;
      },
    } as KeyboardEvent<HTMLElement>,
    () => {
      activated += 10;
    }
  );

  assert.equal(activated, 11);
});

test("field and action renderers compose keyboard-focusable @repo/ui controls", () => {
  const fieldRenderers = [
    TextFieldRenderer,
    NumberFieldRenderer,
    MoneyFieldRenderer,
    DateFieldRenderer,
    TextareaFieldRenderer,
    SelectFieldRenderer,
    CheckboxFieldRenderer,
    SwitchFieldRenderer,
  ];

  for (const renderer of fieldRenderers) {
    const element = expandFieldShell(
      renderer({
        context: baseContext,
        field: baseField,
        value: "INV-001",
      })
    ) as TestElement;
    const control = findInteractiveControl(element);

    assert.ok(
      control,
      `${renderer.name} should render a keyboard-focusable @repo/ui control`
    );
    assert.notEqual(control?.props.tabIndex, -1);
  }

  const actionElement = BaseActionRenderer({
    action: {
      disabled: true,
      href: "https://example.com",
      key: "open",
      kind: "custom",
      label: "Open",
    },
    context: baseContext,
    visual: resolveActionVisualDefinition("button"),
  }) as TestElement;

  const disabledLink = findElementByProp(
    actionElement,
    (candidate) => candidate.type === "a"
  );

  assert.equal(disabledLink?.props.tabIndex, -1);
  assert.equal(disabledLink?.props["aria-disabled"], true);
});

test("metadata table email cells expose focus-visible replacement", () => {
  const element = renderMetadataTableCell(
    {
      key: "email",
      kind: "email",
      label: "Email",
    },
    "hello@example.com",
    { locale: "en", timezone: "UTC" }
  ) as TestElement;

  assert.ok(element);
  assert.match(String(element.props.className), /focus-visible:ring-\[3px\]/);
  assert.match(String(element.props.className), /truncate/);
});

test("state panel disabled link actions remove keyboard focus without pointer-events-none", () => {
  const element = StatePanel({
    action: {
      disabled: true,
      href: "https://example.com",
      label: "Retry",
    },
    description: "Try again later.",
    title: "Unavailable",
    tone: "danger",
  }) as TestElement;

  const button = findElementByProp(
    element,
    (candidate) => candidate.type?.name === "Button"
  );
  const link = findElementByProp(
    element,
    (candidate) => candidate.type === "a"
  );

  assert.equal(button?.props.disabled, true);
  assert.equal(link?.props.tabIndex, -1);
  assert.equal(link?.props["aria-disabled"], true);
});
