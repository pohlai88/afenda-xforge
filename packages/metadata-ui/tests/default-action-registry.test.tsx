import assert from "node:assert/strict";

import { resolveMetadataActionSurface } from "../src/contracts";
import { defaultActionRegistry } from "../src/registry";
import {
  ButtonActionRenderer,
  DestructiveActionRenderer,
  MenuActionRenderer,
} from "../src/renderers/actions";
import { test } from "./test-runtime";

test("defaultActionRegistry resolves the concrete action renderers", () => {
  assert.equal(
    defaultActionRegistry.get("button").renderer,
    ButtonActionRenderer
  );
  assert.equal(
    defaultActionRegistry.get("destructive").renderer,
    DestructiveActionRenderer
  );
  assert.equal(defaultActionRegistry.get("menu").renderer, MenuActionRenderer);
});

test("resolveMetadataActionSurface infers the expected renderer surface", () => {
  assert.equal(
    resolveMetadataActionSurface({
      key: "archive",
      kind: "archive",
      label: "Archive",
    }),
    "destructive"
  );
  assert.equal(
    resolveMetadataActionSurface({
      key: "custom-overflow",
      kind: "custom",
      label: "More",
      placement: "overflow",
    }),
    "menu"
  );
  assert.equal(
    resolveMetadataActionSurface({
      key: "create",
      kind: "create",
      label: "Create",
    }),
    "button"
  );
});
