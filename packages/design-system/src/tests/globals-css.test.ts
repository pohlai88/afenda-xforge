import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compareGlobalsCss, renderGlobalsCss } from "../adapters";
import { validateGlobalsCssTokens } from "../tokens/css-theme";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..", "..");
const globalsCssPath = path.resolve(
  packageRoot,
  "..",
  "ui",
  "src",
  "styles",
  "globals.css"
);

test("globals.css renders from the design-system adapter", async () => {
  const generatedCss = renderGlobalsCss();
  const globalsCss = await readFile(globalsCssPath, "utf8");

  assert.equal(
    globalsCss.replace(/\r\n/g, "\n").trimEnd(),
    generatedCss.replace(/\r\n/g, "\n").trimEnd()
  );

  const comparison = compareGlobalsCss(globalsCss);

  assert.equal(
    comparison.equal,
    true,
    "globals.css should match the design-system token contract"
  );

  assert.match(globalsCss, /--lane-active:/);
  assert.match(globalsCss, /--color-lane-active:/);
  assert.match(globalsCss, /--lane-money:/);
});

test("validateGlobalsCssTokens passes for the current contract", () => {
  assert.doesNotThrow(() => validateGlobalsCssTokens());
});
