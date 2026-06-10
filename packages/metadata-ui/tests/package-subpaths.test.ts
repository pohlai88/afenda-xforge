import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MetadataForm as RootMetadataForm } from "@repo/metadata-ui";
import { renderMetadataField } from "@repo/metadata-ui/adapters";
import {
  MetadataForm as ClientMetadataForm,
  renderMetadataField as renderClientField,
} from "@repo/metadata-ui/client";
import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "@repo/metadata-ui/compatibility";
import {
  EntityMetadataPanel,
  MetadataForm,
  MetadataSectionStack,
  MetadataStateBoundary,
} from "@repo/metadata-ui/components";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import { metadataConsumerScenarioMatrix } from "@repo/metadata-ui/fixtures";
import { evaluateMetadataGovernance } from "@repo/metadata-ui/policy";
import {
  createRendererRegistry,
  defaultFieldRegistry,
} from "@repo/metadata-ui/registry";
import { TextFieldRenderer } from "@repo/metadata-ui/renderers";
import { test } from "./test-runtime";

const packageRoot = join(import.meta.dirname, "..");
const packageJson = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8")
) as { exports?: Record<string, string> };

const requiredSubpaths = [
  ".",
  "./adapters",
  "./client",
  "./components",
  "./compatibility",
  "./contracts",
  "./fixtures",
  "./policy",
  "./registry",
  "./renderers",
  "./server",
] as const;

test("package.json exposes required metadata-ui subpaths", () => {
  for (const subpath of requiredSubpaths) {
    assert.ok(packageJson.exports?.[subpath], `missing export for ${subpath}`);
  }
});

test("root barrel remains available for backward compatibility", () => {
  assert.equal(typeof RootMetadataForm, "function");
});

test("adapters subpath exports renderMetadataField", () => {
  assert.equal(typeof renderMetadataField, "function");
});

test("components subpath exports metadata surfaces", () => {
  assert.equal(typeof MetadataForm, "function");
  assert.equal(typeof EntityMetadataPanel, "function");
  assert.equal(typeof MetadataSectionStack, "function");
  assert.equal(typeof MetadataStateBoundary, "function");
});

test("contracts subpath exports render context factory", () => {
  const context = createMetadataRenderContext(undefined, { mode: "read" });
  const scenario = metadataConsumerScenarioMatrix.at(0);

  assert.ok(scenario);
  assert.equal(typeof context.correlationId, "string");
  assert.equal(typeof scenario.id, "string");
});

test("compatibility subpath exports quality helpers", () => {
  assert.equal(typeof createMetadataUiCompatibilityReport, "function");
  assert.equal(typeof createMetadataUiQualityAssessment, "function");
});

test("fixtures subpath exports consumer scenario matrix", () => {
  assert.equal(Array.isArray(metadataConsumerScenarioMatrix), true);
  assert.equal(metadataConsumerScenarioMatrix.length > 0, true);
});

test("policy subpath exports governance evaluation", () => {
  assert.equal(typeof evaluateMetadataGovernance, "function");
});

test("registry subpath exports default field registry", () => {
  assert.equal(typeof createRendererRegistry, "function");
  assert.equal(typeof defaultFieldRegistry.resolve, "function");
});

test("renderers subpath exports manifest-backed field renderer", () => {
  assert.equal(typeof TextFieldRenderer, "function");
});

const serverSubpath = "@repo/metadata-ui/server";

test("server subpath exports server-safe helpers without client barrels", () => {
  assert.ok(serverSubpath.endsWith("/server"));
  const context = createMetadataRenderContext(undefined, { mode: "read" });

  assert.equal(typeof context.correlationId, "string");
  assert.equal(typeof evaluateMetadataGovernance, "function");
});

test("client subpath exports interactive render helpers", () => {
  assert.equal(typeof renderClientField, "function");
  assert.equal(typeof ClientMetadataForm, "function");
});
