import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { metadataUiManifest } from "../metadata-ui.manifest.ts";
import { test } from "./test-runtime";

const exportsPath = fileURLToPath(
  new URL("../src/generated/exports.generated.ts", import.meta.url)
);

test("manifest publicExport entries align with exports.generated.ts", () => {
  const exportsSource = readFileSync(exportsPath, "utf8");
  const uniqueExports = new Map(
    metadataUiManifest.renderers
      .filter((entry) => entry.publicExport)
      .map((entry) => [entry.rendererExport, entry.rendererPath])
  );

  assert.equal(uniqueExports.size > 0, true);

  for (const [rendererExport, rendererPath] of uniqueExports) {
    assert.match(
      exportsSource,
      new RegExp(`export \\{ ${rendererExport} \\} from "${rendererPath}";`),
      `exports.generated.ts must export ${rendererExport} from ${rendererPath}`
    );
  }
});
