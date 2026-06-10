import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { renderMetadataField } from "../src/adapters";
import { renderMetadataFormResult } from "../src/components/metadata-form";
import type { MetadataFieldContract } from "../src/contracts/field-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  createBooleanInputBinding,
  createSelectInputBinding,
  createTextInputBinding,
  resolveFieldValueBinding,
} from "../src/renderers/fields/field-value-binding";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const textField: MetadataFieldContract = {
  key: "name",
  kind: "text",
  label: "Name",
};

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
  elements.push(element);
  collectElements(element.props.children, elements);

  return elements;
};

const noopChange = (_value: unknown): void => {
  return;
};

test("resolveFieldValueBinding distinguishes controlled and uncontrolled modes", () => {
  assert.equal(resolveFieldValueBinding("Acme", noopChange).isControlled, true);
  assert.equal(
    resolveFieldValueBinding(undefined, noopChange).isControlled,
    false
  );
  assert.equal(resolveFieldValueBinding("Acme", undefined).isControlled, false);
});

test("createTextInputBinding returns value/onChange for controlled fields", () => {
  const changes: unknown[] = [];
  const binding = createTextInputBinding("Acme", "Acme", (nextValue) => {
    changes.push(nextValue);
  });

  assert.equal(binding.value, "Acme");
  assert.equal(typeof binding.onChange, "function");
  assert.equal(binding.defaultValue, undefined);

  binding.onChange?.({
    target: { value: "Beta" },
  } as never);

  assert.deepEqual(changes, ["Beta"]);
});

test("createSelectInputBinding returns defaultValue for uncontrolled fields", () => {
  const binding = createSelectInputBinding(undefined, "draft", undefined);

  assert.equal(binding.defaultValue, "draft");
  assert.equal(binding.value, undefined);
});

test("createBooleanInputBinding returns checked/onCheckedChange for controlled fields", () => {
  const changes: unknown[] = [];
  const binding = createBooleanInputBinding(true, (nextValue) => {
    changes.push(nextValue);
  });

  assert.equal(binding.checked, true);
  binding.onCheckedChange?.(false);
  assert.deepEqual(changes, [false]);
});

test("renderMetadataField forwards controlled binding props to renderers", () => {
  const changes: unknown[] = [];
  const result = renderMetadataField({
    context: createMetadataRenderContext(undefined, { mode: "create" }),
    field: textField,
    onChange: (nextValue) => {
      changes.push(nextValue);
    },
    value: "Acme",
  });

  const shell = result.element as TestElement;
  const input = shell.props.children as TestElement;

  assert.equal(input.props.value, "Acme");
  assert.equal(typeof input.props.onChange, "function");
  assert.equal(input.props.defaultValue, undefined);

  input.props.onChange({ target: { value: "Beta" } });
  assert.deepEqual(changes, ["Beta"]);
});

test("renderMetadataFormResult wires onFieldChange through the field adapter", () => {
  const changes: Array<{ key: string; value: unknown }> = [];
  const result = renderMetadataFormResult({
    fields: [textField],
    onFieldChange: (key, value) => {
      changes.push({ key, value });
    },
    state: "ready",
    values: {
      name: "Acme",
    },
  });

  const input = collectElements(result.element).find(
    (element) => element.props?.name === "name"
  ) as TestElement | undefined;

  assert.ok(input);
  assert.equal(input.props.value, "Acme");
  input?.props.onChange({ target: { value: "Beta" } });
  assert.deepEqual(changes, [{ key: "name", value: "Beta" }]);
});
