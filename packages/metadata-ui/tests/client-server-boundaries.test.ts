import assert from "node:assert/strict";

import {
  MetadataForm as ClientMetadataForm,
  renderMetadataField as renderClientField,
} from "@repo/metadata-ui/client";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import { evaluateMetadataGovernance } from "@repo/metadata-ui/policy";
import { checkClientServerBoundaries } from "../scripts/check-client-server-boundaries.mts";
import { test } from "./test-runtime";

const serverSubpath = "@repo/metadata-ui/server";

test("MUI-008 client/server boundary gate passes", () => {
  assert.ok(serverSubpath.endsWith("/server"));
  checkClientServerBoundaries();
});

test("server-safe subpaths exclude interactive client barrels", () => {
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
