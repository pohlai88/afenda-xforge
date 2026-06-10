import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { renderMetadataComposition } from "../src/adapters/ui-composition-adapter";
import { renderMetadataLayout } from "../src/adapters/ui-layout-adapter";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

test("renderMetadataLayout resolves stack layouts through the layout registry", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataLayout({
    context,
    layout: {
      key: "main",
      kind: "stack",
      title: "Overview",
    },
    children: <div>content</div>,
  });

  assert.ok(result.element);
  assert.equal(result.diagnostics.length, 0);
});

test("renderMetadataComposition walks the root node through the supplied resolver", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataComposition({
    composition: {
      nodes: [
        {
          key: "root",
          kind: "section",
        },
      ],
      rootKey: "root",
      version: "1.0.0",
    },
    context,
    resolveNode: (node) => ({
      diagnostics: [],
      element: <div data-testid={`node-${node.key}`} />,
    }),
  });

  const element = result.element as TestElement;
  assert.match(JSON.stringify(element), /node-root/);
});

test("renderMetadataComposition emits invalid-contract diagnostics for missing roots", () => {
  const context = createMetadataRenderContext({ mode: "read" });
  const result = renderMetadataComposition({
    composition: {
      nodes: [
        {
          key: "child",
          kind: "section",
        },
      ],
      rootKey: "missing-root",
      version: "1.0.0",
    },
    context,
    resolveNode: () => ({
      diagnostics: [],
      element: null,
    }),
  });

  assert.equal(result.diagnostics.at(0)?.code, "invalid-contract");
});
