import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { AFENDA_DENSITY_MODES } from "../contracts/afenda/registries/density.registry";
import {
  resolveDensityDataAttribute,
} from "../contracts/afenda/catalogs/presentation-resolution.catalog";
import {
  AFENDA_METADATA_UI_MIRROR,
  AFENDA_LANE_ACCENT_TOKENS,
  AFENDA_LANE_ACCENT_USAGE_RULES,
  AFENDA_SEMANTIC_STATUS_TOKENS,
  AFENDA_SEMANTIC_SURFACE_TOKENS,
  AFENDA_VISUAL_TOKEN_RULES,
} from "../contracts/afenda/visual-token.contract";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(TEST_DIR, "../../../..");
const METADATA_UI_ROOT = resolve(REPO_ROOT, "packages/metadata-ui/src");

function readMetadataUiSource(relativePath: string): string {
  return readFileSync(resolve(METADATA_UI_ROOT, relativePath), "utf8");
}

function extractConstArray(source: string, exportName: string): string[] {
  const pattern = new RegExp(
    `export const ${exportName} = \\[([\\s\\S]*?)\\] as const`,
    "m"
  );
  const match = source.match(pattern);

  if (!match?.[1]) {
    throw new Error(`Could not extract ${exportName} from metadata-ui source`);
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((tokenMatch) => {
    const value = tokenMatch[1];
    if (!value) {
      throw new Error(`Empty token in ${exportName}`);
    }
    return value;
  });
}

function extractDensityUnion(source: string): string[] {
  const match = source.match(
    /MetadataRenderDensity = "([^"]+)" \| "([^"]+)" \| "([^"]+)"/
  );

  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error("Could not extract MetadataRenderDensity union");
  }

  return [match[1], match[2], match[3]];
}

test("metadata-ui mirror: semantic surface tokens stay aligned", () => {
  const source = readMetadataUiSource("visualization/visual-token-contract.ts");
  const mirror = extractConstArray(source, "SEMANTIC_SURFACE_TOKENS");

  assert.deepEqual([...mirror], [...AFENDA_SEMANTIC_SURFACE_TOKENS]);
  assert.deepEqual(
    [...AFENDA_METADATA_UI_MIRROR.semanticSurfaceTokens],
    [...AFENDA_SEMANTIC_SURFACE_TOKENS]
  );
});

test("metadata-ui mirror: lane and status tokens stay aligned", () => {
  const source = readMetadataUiSource("visualization/visual-token-contract.ts");

  assert.deepEqual(
    [...extractConstArray(source, "LANE_ACCENT_TOKENS")],
    [...AFENDA_LANE_ACCENT_TOKENS]
  );
  assert.deepEqual(
    [...extractConstArray(source, "SEMANTIC_STATUS_TOKENS")],
    [...AFENDA_SEMANTIC_STATUS_TOKENS]
  );
  assert.deepEqual(
    [...extractConstArray(source, "VISUAL_TOKEN_RULES")],
    [...AFENDA_VISUAL_TOKEN_RULES]
  );
  assert.deepEqual(
    [...extractConstArray(source, "LANE_ACCENT_USAGE_RULES")],
    [...AFENDA_LANE_ACCENT_USAGE_RULES]
  );
});

test("metadata-ui mirror: density modes and data-density behavior stay aligned", () => {
  const renderContextSource = readMetadataUiSource(
    "contracts/render-context.contract.ts"
  );
  const densitySource = readMetadataUiSource(
    "visualization/density-visual-contract.ts"
  );

  const metadataUiDensityModes = extractDensityUnion(renderContextSource).sort();
  const afendaDensityModes = [...AFENDA_DENSITY_MODES].sort();

  assert.deepEqual(metadataUiDensityModes, afendaDensityModes);
  assert.deepEqual(
    [...AFENDA_METADATA_UI_MIRROR.densityModes].sort(),
    afendaDensityModes
  );

  assert.match(densitySource, /--density-control-height/);
  assert.match(densitySource, /control-density/);
  assert.match(densitySource, /row-density/);

  for (const mode of AFENDA_DENSITY_MODES) {
    const afendaAttrs = resolveDensityDataAttribute(mode);

    if (mode === "default") {
      assert.deepEqual(afendaAttrs, {});
    } else {
      assert.equal(afendaAttrs["data-density"], mode);
    }
  }
});
