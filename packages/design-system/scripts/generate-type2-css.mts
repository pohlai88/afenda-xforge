import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compareType2Css, renderType2Css } from "../src/adapters";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const type2CssPath = path.resolve(packageRoot, "src", "generated", "type2.css");
const uiGlobalsCssPath = path.resolve(
  packageRoot,
  "..",
  "ui",
  "src",
  "styles",
  "globals.css"
);

async function main() {
  const writeOnly = !(
    process.argv.includes("--check") || process.argv.includes("--compare")
  );
  const generatedCss = renderType2Css();

  if (process.argv.includes("--compare")) {
    const actualCss = await readFile(uiGlobalsCssPath, "utf8");
    const comparison = compareType2Css(actualCss);

    if (!comparison.equal) {
      console.error(
        "type2.css does not match packages/ui/src/styles/globals.css"
      );
      process.exitCode = 1;
      return;
    }

    console.log("type2.css matches packages/ui/src/styles/globals.css");
    return;
  }

  if (process.argv.includes("--check")) {
    const existing = await readFile(type2CssPath, "utf8").catch(() => "");

    if (
      existing.replace(/\r\n/g, "\n").trimEnd() !==
      generatedCss.replace(/\r\n/g, "\n").trimEnd()
    ) {
      console.error(
        "type2.css is out of date. Run `pnpm --filter @repo/design-system type2:css`."
      );
      process.exitCode = 1;
      return;
    }

    return;
  }

  if (writeOnly) {
    await mkdir(path.dirname(type2CssPath), { recursive: true });
    await writeFile(type2CssPath, generatedCss, "utf8");
  }
}

await main();
