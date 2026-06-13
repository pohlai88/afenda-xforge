import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderGlobalsCss } from "../src/css/adapters/globals-css.adapter";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const uiGlobalsCssPath = path.resolve(
  packageRoot,
  "..",
  "ui",
  "src",
  "styles",
  "globals.css"
);

async function main(): Promise<void> {
  const checkOnly = process.argv.includes("--check");
  const generatedCss = renderGlobalsCss();

  if (checkOnly) {
    const existing = await readFile(uiGlobalsCssPath, "utf8").catch(() => "");

    if (
      existing.replace(/\r\n/g, "\n").trimEnd() !==
      generatedCss.replace(/\r\n/g, "\n").trimEnd()
    ) {
      console.error(
        "packages/ui/src/styles/globals.css is out of date. Run `pnpm --filter @repo/design-system globals:css`."
      );
      process.exitCode = 1;
      return;
    }

    return;
  }

  await mkdir(path.dirname(uiGlobalsCssPath), { recursive: true });
  await writeFile(uiGlobalsCssPath, generatedCss, "utf8");
}

await main();
