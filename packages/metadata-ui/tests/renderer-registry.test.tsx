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
    ["alpha", noopRenderer],
  ]);

  assert.equal(registry.has("alpha"), true);
  assert.equal(registry.resolve("alpha"), noopRenderer);
  assert.equal(registry.get("alpha"), noopRenderer);
  assert.throws(
    () => registry.get("beta"),
    MetadataRendererRegistryMissingError
  );
  assert.throws(
    () => registry.register("alpha", noopRenderer),
    MetadataRendererRegistryDuplicateError
  );
});
