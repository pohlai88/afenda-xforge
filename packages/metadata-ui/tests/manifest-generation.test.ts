import assert from "node:assert/strict";
import { test } from "node:test";

import type { MetadataUiManifestEntry } from "../metadata-ui.manifest";
import { validateManifestEntries } from "../scripts/validate-manifest.mts";

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
