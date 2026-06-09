import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createRendererRegistry,
  MetadataRendererRegistryDuplicateError,
  MetadataRendererRegistryMissingError,
} from "../src/registry";

test("createRendererRegistry resolves, registers, and guards duplicates", () => {
  const noopRenderer = (): null => null;
  const registry = createRendererRegistry<string, typeof noopRenderer>([
    {
      key: "alpha",
      renderer: noopRenderer,
      version: "1.0.0",
    },
  ]);

  assert.equal(registry.has("alpha"), true);
  assert.equal(registry.resolve("alpha")?.renderer, noopRenderer);
  assert.equal(registry.get("alpha").renderer, noopRenderer);
  assert.throws(
    () => registry.get("beta"),
    MetadataRendererRegistryMissingError
  );
  assert.throws(
    () =>
      registry.register({
        key: "alpha",
        renderer: noopRenderer,
        version: "1.0.0",
      }),
    MetadataRendererRegistryDuplicateError
  );
});

test("createRendererRegistry preserves falsey renderer values", () => {
  const registry = createRendererRegistry<string, number | string>([
    { key: "zero", renderer: 0, version: "1.0.0" },
    { key: "empty", renderer: "", version: "1.0.0" },
  ]);

  assert.equal(registry.get("zero").renderer, 0);
  assert.equal(registry.get("empty").renderer, "");
  assert.equal(registry.resolve("zero")?.renderer, 0);
  assert.equal(registry.resolve("empty")?.renderer, "");
});

test("registry errors preserve instanceof and error names", () => {
  const missing = new MetadataRendererRegistryMissingError("beta");
  const duplicate = new MetadataRendererRegistryDuplicateError("alpha");

  assert.equal(missing instanceof Error, true);
  assert.equal(missing instanceof MetadataRendererRegistryMissingError, true);
  assert.equal(
    missing instanceof MetadataRendererRegistryDuplicateError,
    false
  );
  assert.equal(missing.name, "MetadataRendererRegistryMissingError");

  assert.equal(duplicate instanceof Error, true);
  assert.equal(
    duplicate instanceof MetadataRendererRegistryDuplicateError,
    true
  );
  assert.equal(
    duplicate instanceof MetadataRendererRegistryMissingError,
    false
  );
  assert.equal(duplicate.name, "MetadataRendererRegistryDuplicateError");
});
