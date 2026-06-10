import assert from "node:assert/strict";

import {
  MetadataForm as ClientMetadataForm,
  renderMetadataField as renderClientField,
} from "@repo/metadata-ui/client";
import {
  createMetadataRenderContext,
  evaluateMetadataGovernance,
} from "@repo/metadata-ui/server";
import { test } from "./test-runtime";

test("server subpath excludes interactive client barrels", () => {
  assert.equal(typeof createMetadataRenderContext, "function");
  assert.equal(typeof evaluateMetadataGovernance, "function");
  assert.equal(
    Object.hasOwn(
      { createMetadataRenderContext, evaluateMetadataGovernance },
      "MetadataForm"
    ),
    false
  );
  assert.equal(
    Object.hasOwn(
      { createMetadataRenderContext, evaluateMetadataGovernance },
      "renderMetadataField"
    ),
    false
  );
});

test("client subpath exposes interactive render helpers only", () => {
  assert.equal(typeof renderClientField, "function");
  assert.equal(typeof ClientMetadataForm, "function");
  assert.equal(
    Object.hasOwn(
      { ClientMetadataForm, renderClientField },
      "evaluateMetadataGovernance"
    ),
    false
  );
});
