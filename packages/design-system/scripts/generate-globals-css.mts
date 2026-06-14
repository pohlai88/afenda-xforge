import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  compareGlobalsCss,
  renderGlobalsCss,
} from "../src/css/adapters/globals-css.adapter";
import { resolveGlobalsCssOutputPath } from "../src/css/adapters/globals-css.pipeline";
import {
  AFENDA_GLOBALS_CSS_COMMANDS,
  validateAfendaGlobalsCssContract,
} from "../src/contracts/afenda/globals-css.contract";

const uiGlobalsCssPath = resolveGlobalsCssOutputPath();

function normalizeCss(value: string): string {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

async function main(): Promise<void> {
  validateAfendaGlobalsCssContract();

  const checkOnly = process.argv.includes("--check");
  const generatedCss = renderGlobalsCss();

  if (checkOnly) {
    const existing = await readFile(uiGlobalsCssPath, "utf8").catch(() => "");

    if (normalizeCss(existing) !== normalizeCss(generatedCss)) {
      const comparison = compareGlobalsCss(existing, generatedCss);

      console.error(
        `${uiGlobalsCssPath} is out of date.\nRun: ${AFENDA_GLOBALS_CSS_COMMANDS.generate}`
      );

      if (!comparison.equal) {
        console.error("Structural token snapshot differs from the adapter.");
      }

      process.exitCode = 1;
      return;
    }

    console.log("globals.css is up to date.");
    return;
  }

  await mkdir(path.dirname(uiGlobalsCssPath), { recursive: true });
  await writeFile(uiGlobalsCssPath, generatedCss, "utf8");

  const lineCount = normalizeCss(generatedCss).split("\n").length;
  console.log(
    `Wrote ${uiGlobalsCssPath} (${lineCount} lines). Verify: ${AFENDA_GLOBALS_CSS_COMMANDS.verify}`
  );
}

await main();
