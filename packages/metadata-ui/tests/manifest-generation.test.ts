import assert from "node:assert/strict";

import type { MetadataUiManifestEntry } from "../metadata-ui.manifest";
import {
  resolveFromModule,
  resolveModuleFilename,
} from "../scripts/module-location.mts";
import { validateManifestEntries } from "../scripts/validate-manifest.mts";
import { test } from "./test-runtime";

const baseEntry: MetadataUiManifestEntry = {
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

test("validateManifestEntries rejects duplicate registry keys within a renderer family", () => {
  assert.throws(
    () => validateManifestEntries([baseEntry, { ...baseEntry }]),
    /Duplicate manifest registry key/
  );
});

test("validateManifestEntries rejects blank required manifest fields", () => {
  assert.throws(
    () => validateManifestEntries([{ ...baseEntry, registryKey: "   " }]),
    /missing a registryKey/
  );
  assert.throws(
    () => validateManifestEntries([{ ...baseEntry, rendererPath: "   " }]),
    /missing a rendererPath/
  );
  assert.throws(
    () => validateManifestEntries([{ ...baseEntry, rendererExport: "   " }]),
    /missing a rendererExport/
  );
});

test("validateManifestEntries rejects missing renderer paths", () => {
  assert.throws(
    () =>
      validateManifestEntries([
        {
          ...baseEntry,
          rendererPath: "../renderers/fields/missing-field.renderer",
        },
      ]),
    /missing renderer path/
  );
});

test("validateManifestEntries rejects missing renderer exports", () => {
  assert.throws(
    () =>
      validateManifestEntries([
        {
          ...baseEntry,
          rendererExport: "MissingFieldRenderer",
        },
      ]),
    /references missing export/
  );
});

test("module location utilities resolve both file URLs and plain paths", () => {
  const manifestPath = resolveModuleFilename(import.meta.url);

  assert.equal(
    resolveFromModule(import.meta.url, "..", "src"),
    resolveFromModule(manifestPath, "..", "src")
  );
  assert.equal(manifestPath.endsWith("manifest-generation.test.ts"), true);
});
