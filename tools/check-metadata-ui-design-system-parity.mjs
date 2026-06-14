#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const DESIGN_SYSTEM_ROOT = resolve(REPO_ROOT, "packages/design-system");
const METADATA_UI_ROOT = resolve(REPO_ROOT, "packages/metadata-ui/src");

const violations = [];

function addViolation(message) {
  violations.push(message);
}

function readSource(relativePath) {
  return readFileSync(resolve(METADATA_UI_ROOT, relativePath), "utf8");
}

function readDesignSystemSource(relativePath) {
  return readFileSync(resolve(DESIGN_SYSTEM_ROOT, relativePath), "utf8");
}

function extractConstArray(source, exportName) {
  const pattern = new RegExp(
    `export const ${exportName} = \\[([\\s\\S]*?)\\] as const`,
    "m"
  );
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Could not extract ${exportName}`);
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((tokenMatch) => tokenMatch[1]);
}

function extractDensityUnion(source) {
  const match = source.match(
    /MetadataRenderDensity = "([^"]+)" \| "([^"]+)" \| "([^"]+)"/
  );

  if (!match) {
    throw new Error("Could not extract MetadataRenderDensity union");
  }

  return [match[1], match[2], match[3]].sort();
}

function extractAfendaDensityModes(source) {
  const match = source.match(
    /AFENDA_DENSITY_MODES = defineRegistry\(\[([\s\S]*?)\]\)/
  );

  if (!match) {
    throw new Error("Could not extract AFENDA_DENSITY_MODES");
  }

  return [...match[1].matchAll(/"([^"]+)"/g)]
    .map((tokenMatch) => tokenMatch[1])
    .sort();
}

function assertArraysEqual(label, left, right) {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();

  if (JSON.stringify(leftSorted) !== JSON.stringify(rightSorted)) {
    addViolation(`${label} drift: ${leftSorted.join(", ")} !== ${rightSorted.join(", ")}`);
  }
}

try {
  const metadataUiVisual = readSource("visualization/visual-token-contract.ts");
  const designSystemVisual = readDesignSystemSource(
    "src/contracts/afenda/visual-token.contract.ts"
  );
  const metadataUiDensity = readSource("visualization/density-visual-contract.ts");
  const metadataUiRenderContext = readSource(
    "contracts/render-context.contract.ts"
  );
  const designSystemDensity = readDesignSystemSource(
    "src/contracts/afenda/registries/density.registry.ts"
  );

  assertArraysEqual(
    "SEMANTIC_SURFACE_TOKENS",
    extractConstArray(metadataUiVisual, "SEMANTIC_SURFACE_TOKENS"),
    extractConstArray(designSystemVisual, "AFENDA_SEMANTIC_SURFACE_TOKENS")
  );
  assertArraysEqual(
    "LANE_ACCENT_TOKENS",
    extractConstArray(metadataUiVisual, "LANE_ACCENT_TOKENS"),
    extractConstArray(designSystemVisual, "AFENDA_LANE_ACCENT_TOKENS")
  );
  assertArraysEqual(
    "SEMANTIC_STATUS_TOKENS",
    extractConstArray(metadataUiVisual, "SEMANTIC_STATUS_TOKENS"),
    extractConstArray(designSystemVisual, "AFENDA_SEMANTIC_STATUS_TOKENS")
  );
  assertArraysEqual(
    "VISUAL_TOKEN_RULES",
    extractConstArray(metadataUiVisual, "VISUAL_TOKEN_RULES"),
    extractConstArray(designSystemVisual, "AFENDA_VISUAL_TOKEN_RULES")
  );
  assertArraysEqual(
    "LANE_ACCENT_USAGE_RULES",
    extractConstArray(metadataUiVisual, "LANE_ACCENT_USAGE_RULES"),
    extractConstArray(designSystemVisual, "AFENDA_LANE_ACCENT_USAGE_RULES")
  );
  assertArraysEqual(
    "MetadataRenderDensity",
    extractDensityUnion(metadataUiRenderContext),
    extractAfendaDensityModes(designSystemDensity)
  );

  for (const hook of [
    "--density-control-height",
    "control-density",
    "row-density",
  ]) {
    if (!metadataUiDensity.includes(hook)) {
      addViolation(`metadata-ui density contract missing required hook: ${hook}`);
    }
  }
} catch (error) {
  addViolation(error instanceof Error ? error.message : String(error));
}

if (violations.length > 0) {
  console.error("metadata-ui ↔ design-system parity violations:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("metadata-ui ↔ design-system parity OK");
