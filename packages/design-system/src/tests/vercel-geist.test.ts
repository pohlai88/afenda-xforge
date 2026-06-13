import assert from "node:assert/strict";
import test from "node:test";

import {
  getVercelGeistColor,
  resolveGeistBrandScale,
  resolveGeistSemanticCssVars,
  VERCEL_GEIST_COLORS,
  VERCEL_GEIST_FOCUS,
  VERCEL_GEIST_FONT_PRESET_NAMES,
  VERCEL_GEIST_GLOBALS_CSS_CONFLICTS,
  VERCEL_GEIST_IMPLEMENTATION_RULES,
  VERCEL_GEIST_MATERIALS,
  VERCEL_GEIST_NEUTRAL_SCALE,
  VERCEL_GEIST_SOURCES,
  VERCEL_GEIST_THEME_PRESET_NAME,
  VERCEL_GEIST_TYPOGRAPHY_STYLES,
  validateVercelGeistRegistry,
} from "../contracts/afenda/references/vercel-geist.contract";
import {
  AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS,
  validateAfendaThemePresetRegistry as validateThemePresetRegistry,
} from "../contracts/afenda/registries";

test("vercel geist color registry is valid and audited", () => {
  validateVercelGeistRegistry();

  assert.equal(VERCEL_GEIST_COLORS.length, 18);
  assert.equal(getVercelGeistColor("ink").hex, "#171717");
  assert.equal(getVercelGeistColor("link").hex, "#0072F5");
  assert.equal(getVercelGeistColor("focus").hex, "#005FCC");
  assert.equal(getVercelGeistColor("mute").hex, "#8F8F8F");
  assert.notEqual(
    getVercelGeistColor("success").hex,
    getVercelGeistColor("link").hex
  );
});

test("vercel geist references official documentation sources", () => {
  assert.match(VERCEL_GEIST_SOURCES.colors, /^https:\/\/vercel\.com\//);
  assert.match(VERCEL_GEIST_SOURCES.typography, /^https:\/\/vercel\.com\//);
  assert.match(VERCEL_GEIST_SOURCES.materials, /^https:\/\/vercel\.com\//);
  assert.match(VERCEL_GEIST_SOURCES.guidelines, /^https:\/\/vercel\.com\//);
});

test("vercel geist font presets align with font registry names", () => {
  assert.deepEqual(VERCEL_GEIST_FONT_PRESET_NAMES, ["geist", "geist-mono"]);
});

test("vercel geist implementation rules cover color, type, elevation, and interaction", () => {
  assert.ok(VERCEL_GEIST_IMPLEMENTATION_RULES.color.length >= 3);
  assert.ok(VERCEL_GEIST_IMPLEMENTATION_RULES.typography.length >= 3);
  assert.ok(VERCEL_GEIST_IMPLEMENTATION_RULES.elevation.length >= 2);
  assert.ok(VERCEL_GEIST_IMPLEMENTATION_RULES.interaction.length >= 2);
});

test("vercel geist materials and focus patterns match Geist docs", () => {
  assert.equal(VERCEL_GEIST_MATERIALS.base.radius, "6px");
  assert.equal(VERCEL_GEIST_MATERIALS.modal.radius, "12px");
  assert.match(VERCEL_GEIST_FOCUS.ring, /0072F5/);
  assert.equal(VERCEL_GEIST_FOCUS.inputOutline, "#005FCC");
});

test("vercel geist neutral scale aligns with canonical gray steps", () => {
  assert.equal(
    VERCEL_GEIST_NEUTRAL_SCALE[50],
    getVercelGeistColor("canvas-soft").hex
  );
  assert.equal(VERCEL_GEIST_NEUTRAL_SCALE[900], getVercelGeistColor("ink").hex);
});

test("vercel geist typography caps display weight at 600", () => {
  for (const style of Object.values(VERCEL_GEIST_TYPOGRAPHY_STYLES)) {
    assert.ok(Number(style.fontWeight) <= 600);
  }
});

test("vercel geist semantic css separates accent wash from link blue", () => {
  const light = resolveGeistSemanticCssVars("light");

  assert.equal(light["--accent"], getVercelGeistColor("hairline").oklch);
  assert.equal(light["--geist-link"], getVercelGeistColor("link").oklch);
  assert.notEqual(light["--accent"], light["--geist-link"]);
  assert.equal(light["--radius"], "6px");
});

test("vercel geist documents globals.css conflicts with afenda", () => {
  assert.ok(VERCEL_GEIST_GLOBALS_CSS_CONFLICTS.length >= 8);
  assert.ok(
    VERCEL_GEIST_GLOBALS_CSS_CONFLICTS.some(
      (entry) => entry.token === "--accent"
    )
  );
  assert.ok(
    VERCEL_GEIST_GLOBALS_CSS_CONFLICTS.some((entry) =>
      entry.token.includes("--text-3xl")
    )
  );
});

test("vercel-geist theme preset derives brand scale from geist contract", () => {
  validateThemePresetRegistry();

  const vercelPreset = THEME_PRESETS.find(
    (preset) => preset.name === VERCEL_GEIST_THEME_PRESET_NAME
  );
  assert.ok(vercelPreset, "vercel-geist theme preset should exist");

  assert.deepEqual(vercelPreset.brand.light, resolveGeistBrandScale("light"));
  assert.deepEqual(vercelPreset.brand.dark, resolveGeistBrandScale("dark"));
  assert.equal(
    vercelPreset.brand.light.primary,
    getVercelGeistColor("ink").oklch
  );
  assert.equal(
    vercelPreset.brand.light.accent,
    getVercelGeistColor("link").oklch
  );
  assert.equal(
    vercelPreset.brand.light.secondary,
    getVercelGeistColor("body").oklch
  );
});
