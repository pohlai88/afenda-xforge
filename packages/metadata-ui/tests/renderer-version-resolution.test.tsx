import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { resolveMetadataFieldRenderer } from "../src/adapters/metadata-renderer-resolvers";
import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../src/contracts/field-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { createRendererRegistry } from "../src/registry/create-renderer-registry";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const stubRenderer: MetadataFieldRenderer = () => null;

test("resolveMetadataFieldRenderer rejects unsupported registry versions", () => {
  const registry = createRendererRegistry<
    MetadataFieldKind,
    MetadataFieldRenderer
  >([
    {
      key: "text",
      renderer: stubRenderer,
      version: "0.9.0",
    },
  ]);
  const context = createMetadataRenderContext({
    rendererVersionConstraints: {
      "field:text": { min: "1.0.0" },
    },
  });

  const resolution = resolveMetadataFieldRenderer("text", registry, context);

  assert.equal(resolution.diagnostic?.code, "unsupported-renderer-version");
  assert.equal(resolution.diagnostic?.target, "text");

  const element = resolution.renderer({
    context,
    field: {
      key: "name",
      kind: "text",
      label: "Name",
    },
  }) as TestElement;

  assert.match(element.props.title as string, /Unsupported field/);
});

test("resolveMetadataFieldRenderer accepts matching exact version constraints", () => {
  const registry = createRendererRegistry<
    MetadataFieldKind,
    MetadataFieldRenderer
  >([
    {
      key: "text",
      renderer: stubRenderer,
      version: "1.0.0",
    },
  ]);
  const context = createMetadataRenderContext({
    rendererVersionConstraints: {
      "field:text": { exact: "1.0.0" },
    },
  });

  const resolution = resolveMetadataFieldRenderer("text", registry, context);

  assert.equal(resolution.diagnostic, undefined);
  assert.equal(resolution.renderer, stubRenderer);
});
