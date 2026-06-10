import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { renderMetadataAction } from "../src/adapters/ui-action-adapter";
import { renderMetadataComposition } from "../src/adapters/ui-composition-adapter";
import { renderMetadataField } from "../src/adapters/ui-field-adapter";
import { renderMetadataLayout } from "../src/adapters/ui-layout-adapter";
import { renderMetadataSection } from "../src/adapters/ui-section-adapter";
import {
  MetadataSectionStack,
  renderMetadataFormResult,
  renderMetadataStateBoundaryResult,
} from "../src/components";
import type { MetadataDiagnostic } from "../src/contracts/diagnostics.contract";
import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../src/contracts/field-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { createRendererRegistry } from "../src/registry/create-renderer-registry";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const elementName = (element: TestElement | null | undefined): string =>
  typeof element?.type === "function"
    ? ((element.type as { name?: string }).name ?? "")
    : "";

const containsElementNamed = (
  element: TestElement | null | undefined,
  name: string
): boolean => {
  if (!element || typeof element !== "object" || !("type" in element)) {
    return false;
  }

  if (elementName(element as TestElement) === name) {
    return true;
  }

  const children = (element as TestElement).props.children;

  if (Array.isArray(children)) {
    return children.some((child) =>
      containsElementNamed(child as TestElement, name)
    );
  }

  return containsElementNamed(children as TestElement, name);
};

const assertSafeFallback = (
  result: {
    diagnostics: readonly MetadataDiagnostic[];
    element: unknown;
  },
  expectedStateName: string,
  expectedDiagnosticCode?: MetadataDiagnostic["code"]
): void => {
  assert.ok(result.element, "fallback must render an element");
  assert.equal(elementName(result.element as TestElement), expectedStateName);

  if (expectedDiagnosticCode) {
    assert.equal(result.diagnostics.at(0)?.code, expectedDiagnosticCode);
  }
};

test("invalid field contracts render InvalidState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "create" });
  const result = renderMetadataField({
    context,
    field: {
      key: "amount",
      kind: "currency" as never,
      label: "Amount",
    },
  });

  assertSafeFallback(result, "InvalidState", "invalid-contract");
});

test("invalid action contracts render InvalidState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "create" });
  const result = renderMetadataAction({
    action: {
      key: "save",
      kind: "unsupported-action" as never,
      label: "Save",
    },
    context,
  });

  assertSafeFallback(result, "InvalidState", "invalid-contract");
});

test("invalid section contracts render InvalidState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataSection({
    context,
    section: {
      key: "broken",
      kind: "unsupported-section" as never,
      title: "Broken",
    },
  });

  assertSafeFallback(result, "InvalidState", "invalid-contract");
});

test("invalid layout contracts render InvalidState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataLayout({
    context,
    layout: {
      key: "broken",
      kind: "unsupported-layout" as never,
      title: "Broken",
    },
  });

  assertSafeFallback(result, "InvalidState", "invalid-contract");
});

test("invalid composition contracts render InvalidState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataComposition({
    composition: {
      nodes: [],
      rootKey: "missing-root",
      version: "1.0.0",
    },
    context,
    resolveNode: () => ({
      diagnostics: [],
      element: null,
    }),
  });

  assertSafeFallback(result, "InvalidState", "invalid-contract");
});

test("unsupported field renderers render ErrorState without throwing", () => {
  const context = createMetadataRenderContext({ mode: "create" });
  const emptyRegistry = createRendererRegistry<
    MetadataFieldKind,
    MetadataFieldRenderer
  >([]);
  const result = renderMetadataField({
    context,
    field: {
      key: "name",
      kind: "text",
      label: "Name",
    },
    registry: emptyRegistry,
  });

  assertSafeFallback(result, "ErrorState", "missing-renderer");
});

test("section partial completeness wraps PartialState", () => {
  const context = createMetadataRenderContext({
    mode: "read",
    state: "partial",
  });
  const result = renderMetadataSection({
    context,
    section: {
      completenessDescription: "Some fields are unavailable.",
      key: "details",
      kind: "details",
      title: "Details",
    },
  });

  assert.equal(elementName(result.element as TestElement), "PartialState");
});

test("section degraded completeness wraps DegradedState", () => {
  const context = createMetadataRenderContext({
    mode: "read",
    state: "degraded",
  });
  const result = renderMetadataSection({
    context,
    section: {
      completenessDescription: "Some data may be stale.",
      key: "summary",
      kind: "details",
      title: "Summary",
    },
  });

  assert.equal(elementName(result.element as TestElement), "DegradedState");
});

test("MetadataSectionStack survives mixed valid and invalid sections", () => {
  const element = MetadataSectionStack({
    sections: [
      {
        key: "valid",
        kind: "details",
        title: "Valid",
      },
      {
        key: "invalid",
        kind: "unsupported-section" as never,
        title: "Invalid",
      },
    ],
  }) as TestElement;

  assert.ok(element);
  assert.match(
    JSON.stringify(element),
    /InvalidState|Invalid section contract/i
  );
});

test("renderMetadataFormResult routes invalid surface state through state boundary", () => {
  const boundaryResult = renderMetadataStateBoundaryResult({
    error: "Metadata contract failed validation.",
    state: "invalid",
  });

  assert.equal(
    elementName(boundaryResult.element as TestElement),
    "InvalidState"
  );

  const result = renderMetadataFormResult({
    error: "Metadata contract failed validation.",
    fields: [
      {
        key: "name",
        kind: "text",
        label: "Name",
      },
    ],
    state: "invalid",
  });

  assert.ok(result.element);
  assert.equal(
    containsElementNamed(result.element as TestElement, "InvalidState"),
    true
  );
});

test("renderMetadataFormResult keeps rendering when one field contract is invalid", () => {
  const result = renderMetadataFormResult({
    fields: [
      {
        key: "name",
        kind: "text",
        label: "Name",
      },
      {
        key: "broken",
        kind: "currency" as never,
        label: "Broken",
      },
    ],
    values: {
      name: "Ada",
    },
  });

  assert.ok(result.element);
  assert.equal(
    result.diagnostics.some(
      (diagnostic) => diagnostic.code === "invalid-contract"
    ),
    true
  );
  assert.match(
    JSON.stringify(result.element),
    /InvalidState|Invalid field contract/i
  );
});
