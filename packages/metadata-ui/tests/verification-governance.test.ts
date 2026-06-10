import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { MetadataUiManifestEntry } from "../metadata-ui.manifest.ts";
import { checkVerificationGovernance } from "../scripts/check-verification-governance.mts";
import { validateManifestEntries } from "../scripts/validate-manifest.mts";
import {
  createRendererRegistry,
  MetadataRendererRegistryDuplicateError,
} from "../src/registry";
import { test } from "./test-runtime";

const packageRoot = join(import.meta.dirname, "..");
const declarationSnapshotPath = join(
  packageRoot,
  "snapshots",
  "declaration-snapshot.json"
);
const exportsPath = join(
  packageRoot,
  "src",
  "generated",
  "exports.generated.ts"
);

const baseManifestEntry: MetadataUiManifestEntry = {
  composeGroup: "field",
  fixture: true,
  kind: "field",
  publicExport: true,
  registryKey: "text",
  rendererExport: "TextFieldRenderer",
  rendererPath: "../renderers/fields/text-field.renderer",
  smokeTest: true,
  title: "Text field renderer",
};

test("Enterprise AC #7 verification governance gate passes", () => {
  checkVerificationGovernance();
});

test("manifest validation rejects duplicate registry keys", () => {
  assert.throws(
    () =>
      validateManifestEntries([baseManifestEntry, { ...baseManifestEntry }]),
    /Duplicate manifest registry key/
  );
});

test("renderer registries reject duplicate keys at registration time", () => {
  const noopRenderer = (): null => null;

  assert.throws(
    () =>
      createRendererRegistry<string, typeof noopRenderer>([
        { key: "alpha", renderer: noopRenderer, version: "1.0.0" },
      ]).register({
        key: "alpha",
        renderer: noopRenderer,
        version: "1.0.0",
      }),
    MetadataRendererRegistryDuplicateError
  );
});

test("declaration snapshot tracks hashed public declaration outputs", () => {
  const snapshot = JSON.parse(
    readFileSync(declarationSnapshotPath, "utf8")
  ) as { files: Record<string, string> };

  assert.equal(typeof snapshot.files, "object");
  assert.equal(Object.keys(snapshot.files).length > 0, true);
  assert.equal(typeof snapshot.files["dist/index.d.ts"], "string");
  assert.match(snapshot.files["dist/index.d.ts"] ?? "", /^[a-f0-9]{64}$/);
});

test("generated exports remain aligned with manifest public exports", () => {
  const exportsSource = readFileSync(exportsPath, "utf8");

  assert.match(exportsSource, /export \{ TextFieldRenderer \} from/);
  assert.match(exportsSource, /renderers\/fields\/text-field\.renderer/);
});
