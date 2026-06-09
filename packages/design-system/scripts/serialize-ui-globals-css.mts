import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CssVariableMap = Record<string, string>;

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
const generatedSnapshotPath = path.resolve(
  packageRoot,
  "src",
  "generated",
  "ui-globals-css.ts"
);

function normalizeValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractBalancedBlock(css: string, marker: string): string {
  const start = css.indexOf(`${marker} {`);

  if (start === -1) {
    throw new Error(`Could not find block marker: ${marker}`);
  }

  const openBrace = start + marker.length + 1;

  let depth = 0;

  for (let index = openBrace; index < css.length; index += 1) {
    const char = css[index];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return css.slice(openBrace + 1, index);
      }
    }
  }

  throw new Error(`Could not find closing brace for block marker: ${marker}`);
}

function extractCustomProperties(block: string): CssVariableMap {
  const entries: Array<[string, string]> = [];
  const declarationRegex = /(--[a-z0-9-]+):\s*([^;]+);/g;

  for (const match of block.matchAll(declarationRegex)) {
    entries.push([match[1], normalizeValue(match[2] ?? "")]);
  }

  return Object.fromEntries(entries);
}

function extractSources(css: string): string[] {
  return [...css.matchAll(/^@source\s+"([^"]+)";$/gm)].map((match) => match[1]);
}

function extractUtilities(css: string): string[] {
  return [...css.matchAll(/^@utility\s+([a-z0-9-]+)\s*\{/gm)].map(
    (match) => match[1]
  );
}

function extractKeyframes(block: string): string[] {
  return [...block.matchAll(/@keyframes\s+([a-z0-9-]+)\s*\{/g)].map(
    (match) => match[1]
  );
}

function buildSnapshot(css: string) {
  const themeBlock = extractBalancedBlock(css, "@theme inline");

  return {
    sources: extractSources(css),
    utilities: extractUtilities(css),
    keyframes: extractKeyframes(themeBlock),
    variables: {
      root: extractCustomProperties(extractBalancedBlock(css, ":root")),
      dark: extractCustomProperties(extractBalancedBlock(css, ".dark")),
      density: {
        compact: extractCustomProperties(
          extractBalancedBlock(css, '[data-density="compact"]')
        ),
        comfortable: extractCustomProperties(
          extractBalancedBlock(css, '[data-density="comfortable"]')
        ),
      },
      theme: extractCustomProperties(themeBlock),
    },
  } as const;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const css = await readFile(uiGlobalsCssPath, "utf8");
  const snapshot = buildSnapshot(css);
  const fileContents = `/* eslint-disable */\n/* biome-ignore lint/style/useConst: generated file */\nexport const uiGlobalsCssSnapshot = ${JSON.stringify(snapshot, null, 2)} as const;\n`;

  if (checkOnly) {
    const existing = await readFile(generatedSnapshotPath, "utf8").catch(
      () => ""
    );

    if (existing !== fileContents) {
      console.error(
        "ui-globals snapshot is out of date. Run `pnpm --filter @repo/design-system serialize:css`."
      );
      process.exitCode = 1;
      return;
    }

    return;
  }

  await mkdir(path.dirname(generatedSnapshotPath), { recursive: true });
  await writeFile(generatedSnapshotPath, fileContents, "utf8");
}

await main();
