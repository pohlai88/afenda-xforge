import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  AFENDA_GLOBALS_CSS_BASE_THEME_PRESET,
  AFENDA_GLOBALS_CSS_COMMANDS,
  AFENDA_GLOBALS_CSS_DENSITY_SELECTORS,
  afendaGlobalsCssContract,
  validateAfendaGlobalsCssContract,
} from "../contracts/afenda/globals-css.contract";
import { GLOBALS_CSS_UI_SOURCE_GLOBS } from "../css/adapters/globals-css.pipeline";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

test("globals CSS contract validates and documents the pipeline", () => {
  assert.doesNotThrow(() => validateAfendaGlobalsCssContract());

  assert.equal(afendaGlobalsCssContract.baseThemePreset, "afenda");
  assert.equal(
    afendaGlobalsCssContract.output.relativePath,
    "src/styles/globals.css"
  );
  assert.equal(
    afendaGlobalsCssContract.commands.verify,
    AFENDA_GLOBALS_CSS_COMMANDS.verify
  );
  assert.deepEqual(
    [...afendaGlobalsCssContract.densitySelectors],
    [...AFENDA_GLOBALS_CSS_DENSITY_SELECTORS]
  );
  assert.equal(AFENDA_GLOBALS_CSS_BASE_THEME_PRESET, "afenda");
  assert.ok(
    afendaGlobalsCssContract.knownLimitations.some((limitation) =>
      limitation.includes("vercel-geist") && limitation.includes("afenda")
    )
  );
  assert.ok(GLOBALS_CSS_UI_SOURCE_GLOBS.length >= 3);
  assert.equal(
    afendaGlobalsCssContract.pipelineLayers.renderer,
    "src/css/adapters/globals-css.render.ts"
  );
  assert.equal(
    afendaGlobalsCssContract.pipelineLayers.compare,
    "src/css/adapters/globals-css.compare.ts"
  );

  for (const relativePath of Object.values(
    afendaGlobalsCssContract.pipelineLayers
  )) {
    assert.ok(
      existsSync(path.resolve(packageRoot, relativePath)),
      `pipeline layer file must exist: ${relativePath}`
    );
  }
});
