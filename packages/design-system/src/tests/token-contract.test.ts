import assert from "node:assert/strict";
import test from "node:test";

import { designSystemTokenGroups } from "..";
import {
  BASE_COLOR_TOKENS,
  BRAND_COLOR_TOKENS,
  CHART_COLOR_TOKENS,
  DENSITY_MODES,
  DENSITY_TOKEN_NAMES,
  FONT_PRESET_NAMES,
  FONT_PRESETS,
  FONT_ROLES,
  RADIUS_SOURCE_TOKENS,
  RADIUS_TOKENS,
  SIDEBAR_COLOR_TOKENS,
  STATUS_COLOR_TOKENS,
  SURFACE_COLOR_TOKENS,
  THEME_BRAND_COLOR_TOKENS,
  THEME_PRESET_NAMES,
  THEME_PRESETS,
  validateFontPresetRegistry,
  validateThemePresetRegistry,
  validateVisualLaneRegistry,
} from "../contracts";
import { ERP_VISUAL_LANE_IDS, ERP_VISUAL_LANES } from "../contracts/visual-lane.contract";

const tokenGroups: Record<string, readonly unknown[]> = {
  animation: designSystemTokenGroups.motion.animations,
  base: designSystemTokenGroups.color.base,
  brand: designSystemTokenGroups.color.brand,
  chart: designSystemTokenGroups.color.chart,
  densityModes: designSystemTokenGroups.density.modes,
  densityTokens: designSystemTokenGroups.density.tokens,
  fontFamilies: designSystemTokenGroups.typography.fontFamilies,
  fontFeatures: designSystemTokenGroups.typography.fontFeatures,
  fontPresetNames: designSystemTokenGroups.typography.fontPresetNames,
  fontRoles: designSystemTokenGroups.typography.fontRoles,
  motionPreferences: designSystemTokenGroups.motion.preferences,
  radiusSource: designSystemTokenGroups.radius.source,
  radiusTokens: designSystemTokenGroups.radius.tokens,
  shadow: designSystemTokenGroups.shadow,
  sidebar: designSystemTokenGroups.color.sidebar,
  status: designSystemTokenGroups.color.status,
  surface: designSystemTokenGroups.color.surface,
  textUtilities: designSystemTokenGroups.typography.textUtilities,
  themeBrandColorTokens: designSystemTokenGroups.theme.brandColorTokens,
  themePresetNames: designSystemTokenGroups.theme.presetNames,
  visualLaneIds: designSystemTokenGroups.visualLanes.ids,
  visualLanes: designSystemTokenGroups.visualLanes.lanes,
} as const;

test("token groups are non-empty", () => {
  for (const [groupName, tokens] of Object.entries(tokenGroups)) {
    assert.ok(tokens.length > 0, `${groupName} should not be empty`);
  }
});

test("token groups do not contain duplicates", () => {
  for (const [groupName, tokens] of Object.entries(tokenGroups)) {
    assert.equal(
      new Set(tokens).size,
      tokens.length,
      `${groupName} contains duplicate tokens`
    );
  }
});

test("token registries stay aligned with the contract source of truth", () => {
  assert.deepEqual(designSystemTokenGroups.color.base, BASE_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.color.brand, BRAND_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.color.chart, CHART_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.color.sidebar, SIDEBAR_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.color.surface, SURFACE_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.color.status, STATUS_COLOR_TOKENS);
  assert.deepEqual(designSystemTokenGroups.density.modes, DENSITY_MODES);
  assert.deepEqual(designSystemTokenGroups.density.tokens, DENSITY_TOKEN_NAMES);
  assert.deepEqual(designSystemTokenGroups.radius.source, RADIUS_SOURCE_TOKENS);
  assert.deepEqual(designSystemTokenGroups.radius.tokens, RADIUS_TOKENS);
  assert.deepEqual(designSystemTokenGroups.typography.fontRoles, FONT_ROLES);
  assert.deepEqual(
    designSystemTokenGroups.typography.fontPresetNames,
    FONT_PRESET_NAMES
  );
  assert.deepEqual(designSystemTokenGroups.theme.presets, THEME_PRESETS);
  assert.deepEqual(
    designSystemTokenGroups.theme.presetNames,
    THEME_PRESET_NAMES
  );
  assert.deepEqual(
    designSystemTokenGroups.theme.brandColorTokens,
    THEME_BRAND_COLOR_TOKENS
  );
});

test("font preset registry is valid and aligned by name", () => {
  validateFontPresetRegistry();

  assert.deepEqual(
    FONT_PRESETS.map((preset) => preset.name),
    FONT_PRESET_NAMES
  );
  assert.equal(
    new Set(FONT_PRESETS.map((preset) => preset.name)).size,
    FONT_PRESETS.length
  );
});

test("theme preset registry is valid and aligned by name", () => {
  validateThemePresetRegistry();

  assert.deepEqual(
    THEME_PRESETS.map((preset) => preset.name),
    THEME_PRESET_NAMES
  );
  assert.equal(
    new Set(THEME_PRESETS.map((preset) => preset.name)).size,
    THEME_PRESETS.length
  );
});

test("visual lane registry is valid and aligned with token groups", () => {
  validateVisualLaneRegistry();

  assert.deepEqual(designSystemTokenGroups.visualLanes.ids, ERP_VISUAL_LANE_IDS);
  assert.deepEqual(designSystemTokenGroups.visualLanes.lanes, ERP_VISUAL_LANES);
  assert.equal(ERP_VISUAL_LANE_IDS.length, 7);
});
