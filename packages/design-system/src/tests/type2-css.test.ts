import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compareType2Css, renderType2Css } from "../adapters";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..", "..");
const type2CssPath = path.resolve(packageRoot, "src", "generated", "type2.css");
const globalsCssPath = path.resolve(
  packageRoot,
  "..",
  "ui",
  "src",
  "styles",
  "globals.css"
);

test("type2.css renders from the design-system adapter", async () => {
  const generatedCss = renderType2Css();
  const writtenCss = await readFile(type2CssPath, "utf8");
  const globalsCss = await readFile(globalsCssPath, "utf8");

  assert.equal(
    writtenCss.replace(/\r\n/g, "\n").trimEnd(),
    generatedCss.replace(/\r\n/g, "\n").trimEnd()
  );

  const comparison = compareType2Css(globalsCss);

  assert.equal(
    comparison.equal,
    true,
    "type2.css should match packages/ui/src/styles/globals.css"
  );
});
