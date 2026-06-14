import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compareGlobalsCss, renderGlobalsCss } from "../css/adapters/globals-css.adapter";
import { resolveGlobalsCssOutputPath } from "../css/adapters/globals-css.pipeline";
import { validateGlobalsCssTokens } from "../css/tokens/css-theme";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..", "..");
const globalsCssPath = resolveGlobalsCssOutputPath(
  path.resolve(packageRoot, "../..")
);
const cssRoot = path.resolve(packageRoot, "src", "css");

function listCssSourceFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return [...listCssSourceFiles(entryPath)];
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });
}

function extractStaticImportSpecifiers(source: string): readonly string[] {
  return [
    ...source.matchAll(
      /^\s*import\s+(?:type\s+)?(?:["']([^"']+)["']|[\s\S]*?\s+from\s+["']([^"']+)["'])/gm
    ),
  ].map((match) => {
    const moduleSpecifier = match[1] ?? match[2];

    assert.ok(moduleSpecifier, "CSS import match must contain a path");

    return moduleSpecifier;
  });
}

test("globals.css renders from the design-system adapter", async () => {
  const generatedCss = renderGlobalsCss();
  const globalsCss = await readFile(globalsCssPath, "utf8");

  assert.equal(
    globalsCss.replace(/\r\n/g, "\n").trimEnd(),
    generatedCss.replace(/\r\n/g, "\n").trimEnd()
  );

  const comparison = compareGlobalsCss(globalsCss, generatedCss);

  assert.equal(
    comparison.equal,
    true,
    "globals.css should match the design-system token contract"
  );

  assert.match(globalsCss, /--lane-active:/);
  assert.match(globalsCss, /--color-lane-active:/);
  assert.match(globalsCss, /--lane-money:/);
  assert.match(globalsCss, /--type-read-size:\s*0\.75rem;/);
  assert.match(globalsCss, /--type-label-size:\s*0\.375rem;/);
  assert.match(globalsCss, /--text-sm:\s*0\.75rem;/);
  assert.match(globalsCss, /@utility type-read/);
  assert.match(globalsCss, /@utility type-label/);
  assert.match(globalsCss, /--font-heading:/);
  assert.match(
    globalsCss,
    /border-color:\s*var\(--color-border\);/
  );
  assert.match(
    globalsCss,
    /outline-color:\s*color-mix\(in oklch, var\(--color-ring\) 50%, transparent\);/
  );
  assert.doesNotMatch(globalsCss, /@layer base[\s\S]*@apply/);
  assert.match(globalsCss, /background-color:\s*var\(--color-background\);/);
  assert.match(globalsCss, /font-size:\s*var\(--text-sm\);/);
});

test("validateGlobalsCssTokens passes for the current contract", () => {
  assert.doesNotThrow(() => validateGlobalsCssTokens());
});

test("css implementation preserves token adapter layering", () => {
  const violations = listCssSourceFiles(cssRoot).flatMap((filePath) => {
    const cssRelativePath = path.relative(cssRoot, filePath).replace(/\\/g, "/");
    const imports = extractStaticImportSpecifiers(readFileSync(filePath, "utf8"));

    return imports.flatMap((moduleSpecifier) => {
      const importsAdapter =
        moduleSpecifier.includes("/adapters") ||
        moduleSpecifier.startsWith("../adapters");

      if (cssRelativePath.startsWith("tokens/") && importsAdapter) {
        return [
          `${cssRelativePath} imports higher CSS layer: ${moduleSpecifier}`,
        ];
      }

      return [];
    });
  });

  assert.deepEqual(violations, []);
});
