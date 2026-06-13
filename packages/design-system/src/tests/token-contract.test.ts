import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveAfendaRuntimeToken,
  resolveAfendaRuntimeTokenSnapshot,
  groupAfendaRuntimeTokensByDisplayComponent,
} from "..";
import {
  afendaDesignTokenCatalogExport,
  afendaTokenCatalog,
  afendaTokenUiCatalog,
  type AfendaTokenizedToken,
  validateAfendaTokenCatalog,
} from "../css/tokens";
import { CHART_COLOR_TOKENS as chartColorTokens } from "../css/tokens/color-tokens";
import {
  BASE_COLOR_TOKENS as baseColorTokens,
  BRAND_COLOR_TOKENS as brandColorTokens,
  SIDEBAR_COLOR_TOKENS as sidebarColorTokens,
  STATUS_COLOR_TOKENS as statusColorTokens,
  SURFACE_COLOR_TOKENS as surfaceColorTokens,
} from "../css/tokens/color-tokens";
import {
  DENSITY_MODES as densityModes,
  DENSITY_TOKENS as densityTokens,
  ANIMATION_TOKENS as animationTokens,
  MOTION_PREFERENCES as motionPreferences,
  ORDER_TOKENS as orderTokens,
  RADIUS_TOKENS as radiusTokens,
  SHADOW_TOKENS as shadowTokens,
} from "../css/tokens/registry-token-specs";
import {
  FONT_FEATURE_TOKENS as fontFeatureTokens,
  FONT_FAMILY_TOKENS as fontFamilyTokens,
  TEXT_UTILITY_TOKENS as textUtilityTokens,
  TYPE_SCALE_ROLES as typeScaleRoles,
  TYPE_UTILITY_TOKENS as typeUtilityTokens,
} from "../css/tokens/typography-tokens";
import {
  AFENDA_BASE_COLOR_TOKENS as BASE_COLOR_TOKENS,
  AFENDA_BRAND_COLOR_TOKENS as BRAND_COLOR_TOKENS,
  AFENDA_CHART_COLOR_TOKENS as CHART_COLOR_TOKENS,
  AFENDA_DENSITY_MODES as DENSITY_MODES,
  AFENDA_DENSITY_TOKEN_NAMES as DENSITY_TOKEN_NAMES,
  AFENDA_FONT_FEATURE_TOKENS as FONT_FEATURE_TOKENS,
  AFENDA_FONT_PRESET_NAMES as FONT_PRESET_NAMES,
  AFENDA_FONT_PRESETS as FONT_PRESETS,
  AFENDA_FONT_ROLES as FONT_ROLES,
  AFENDA_MOTION_ANIMATION_TOKENS as MOTION_ANIMATION_TOKENS,
  AFENDA_MOTION_PREFERENCE_TOKENS as MOTION_PREFERENCE_TOKENS,
  AFENDA_ORDER_TOKENS as ORDER_TOKENS,
  AFENDA_RADIUS_TOKENS as RADIUS_TOKENS,
  AFENDA_SHADOW_TOKENS as SHADOW_TOKENS,
  AFENDA_SIDEBAR_COLOR_TOKENS as SIDEBAR_COLOR_TOKENS,
  AFENDA_STATUS_COLOR_TOKENS as STATUS_COLOR_TOKENS,
  AFENDA_SURFACE_COLOR_TOKENS as SURFACE_COLOR_TOKENS,
  AFENDA_TOKENIZED_TOKEN_TYPES,
  AFENDA_TEXT_UTILITY_TOKENS as TEXT_UTILITY_TOKENS,
  AFENDA_THEME_BRAND_COLOR_TOKENS as THEME_BRAND_COLOR_TOKENS,
  AFENDA_THEME_PRESET_NAMES as THEME_PRESET_NAMES,
  AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS,
  AFENDA_TYPE_SCALE_ROLES as TYPE_SCALE_ROLES,
  AFENDA_TYPE_UTILITY_TOKENS as TYPE_UTILITY_TOKENS,
  validateAfendaFontRegistry as validateFontPresetRegistry,
  validateAfendaMotionRegistry,
  validateAfendaOrderRegistry,
  validateAfendaShadowRegistry,
  validateAfendaThemePresetRegistry as validateThemePresetRegistry,
  validateAfendaTypographyTokenRegistry,
  validateAfendaVisualLaneRegistry as validateVisualLaneRegistry,
} from "../contracts/afenda";
import {
  AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES,
  AFENDA_TOKEN_UI_COMPONENT_NAV,
  validateAfendaRuntimeTokenResolutionContract,
  validateAfendaTokenUiContract,
} from "../contracts/afenda/token-ui.contract";
import { resolveTenantBrandingModeCssVars } from "../customise-branding/resolution";
import {
  GLOBALS_CSS_COMFORTABLE_DENSITY_DECLARATIONS,
  GLOBALS_CSS_COMPACT_DENSITY_DECLARATIONS,
  GLOBALS_CSS_DARK_DECLARATIONS,
  GLOBALS_CSS_ROOT_DECLARATIONS,
  GLOBALS_CSS_THEME_DECLARATIONS,
} from "../css/tokens/css-theme";
import {
  AFENDA_ERP_VISUAL_LANE_IDS as ERP_VISUAL_LANE_IDS,
  AFENDA_ERP_VISUAL_LANES as ERP_VISUAL_LANES,
} from "../contracts/afenda";

const fontRoles = FONT_ROLES;
const fontPresetNames = FONT_PRESET_NAMES;
const fontPresets = FONT_PRESETS;
const themePresetNames = THEME_PRESET_NAMES;
const themePresets = THEME_PRESETS;
const themeBrandColorTokens = THEME_BRAND_COLOR_TOKENS;

const tokenGroups: Record<string, readonly unknown[]> = {
  animation: animationTokens,
  base: baseColorTokens,
  brand: brandColorTokens,
  chart: chartColorTokens,
  densityModes,
  densityTokens,
  fontFamilies: fontFamilyTokens,
  fontFeatures: fontFeatureTokens,
  fontPresetNames,
  fontRoles,
  motionPreferences,
  orderTokens,
  radiusTokens,
  shadow: shadowTokens,
  sidebar: sidebarColorTokens,
  status: statusColorTokens,
  surface: surfaceColorTokens,
  textUtilities: textUtilityTokens,
  typeScaleRoles,
  typeUtilities: typeUtilityTokens,
  themeBrandColorTokens,
  themePresetNames,
  visualLaneIds: ERP_VISUAL_LANE_IDS,
  visualLanes: ERP_VISUAL_LANES,
} as const;

function hasCssVariable(
  token: AfendaTokenizedToken
): token is AfendaTokenizedToken & { readonly cssVariable: `--${string}` } {
  return "cssVariable" in token && Boolean(token.cssVariable);
}

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
  assert.deepEqual(baseColorTokens, BASE_COLOR_TOKENS);
  assert.deepEqual(brandColorTokens, BRAND_COLOR_TOKENS);
  assert.deepEqual(chartColorTokens, CHART_COLOR_TOKENS);
  assert.deepEqual(sidebarColorTokens, SIDEBAR_COLOR_TOKENS);
  assert.deepEqual(surfaceColorTokens, SURFACE_COLOR_TOKENS);
  assert.deepEqual(statusColorTokens, STATUS_COLOR_TOKENS);
  assert.deepEqual(densityModes, DENSITY_MODES);
  assert.deepEqual(densityTokens, DENSITY_TOKEN_NAMES);
  assert.deepEqual(radiusTokens, RADIUS_TOKENS);
  assert.deepEqual(fontRoles, FONT_ROLES);
  assert.deepEqual(fontPresetNames, FONT_PRESET_NAMES);
  assert.deepEqual(animationTokens, MOTION_ANIMATION_TOKENS);
  assert.deepEqual(motionPreferences, MOTION_PREFERENCE_TOKENS);
  assert.deepEqual(orderTokens, ORDER_TOKENS);
  assert.deepEqual(shadowTokens, SHADOW_TOKENS);
  assert.deepEqual(fontFeatureTokens, FONT_FEATURE_TOKENS);
  assert.deepEqual(textUtilityTokens, TEXT_UTILITY_TOKENS);
  assert.deepEqual(typeScaleRoles, TYPE_SCALE_ROLES);
  assert.deepEqual(typeUtilityTokens, TYPE_UTILITY_TOKENS);
  assert.deepEqual(themePresets, THEME_PRESETS);
  assert.deepEqual(themePresetNames, THEME_PRESET_NAMES);
  assert.deepEqual(themeBrandColorTokens, THEME_BRAND_COLOR_TOKENS);
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

  assert.deepEqual(ERP_VISUAL_LANES.map((lane) => lane.id), ERP_VISUAL_LANE_IDS);
  assert.equal(ERP_VISUAL_LANE_IDS.length, 7);
});

test("motion, order, shadow, and typography registries are valid and aligned", () => {
  validateAfendaMotionRegistry();
  validateAfendaOrderRegistry();
  validateAfendaShadowRegistry();
  validateAfendaTypographyTokenRegistry();

  assert.deepEqual(animationTokens, MOTION_ANIMATION_TOKENS);
  assert.deepEqual(motionPreferences, MOTION_PREFERENCE_TOKENS);
  assert.deepEqual(orderTokens, ORDER_TOKENS);
  assert.deepEqual(shadowTokens, SHADOW_TOKENS);
  assert.deepEqual(fontFeatureTokens, FONT_FEATURE_TOKENS);
  assert.deepEqual(textUtilityTokens, TEXT_UTILITY_TOKENS);
  assert.deepEqual(typeScaleRoles, TYPE_SCALE_ROLES);
  assert.deepEqual(typeUtilityTokens, TYPE_UTILITY_TOKENS);
});

test("token ui contract validates as catalog governance anchor", () => {
  validateAfendaTokenUiContract();
  validateAfendaRuntimeTokenResolutionContract();
  assert.equal(
    AFENDA_TOKEN_UI_COMPONENT_NAV.length,
    AFENDA_TOKENIZED_TOKEN_TYPES.length
  );
});

test("token catalog exposes Token UI documentation hints", () => {
  validateAfendaTokenCatalog();

  const configuredTypes = new Set(AFENDA_TOKENIZED_TOKEN_TYPES);
  const tokenTypes = new Set(afendaTokenCatalog.map((token) => token.type));
  const displayTypes = new Set(afendaTokenUiCatalog.map((token) => token.type));
  const tokenNames = afendaTokenCatalog.map((token) => token.name);

  assert.ok(afendaTokenCatalog.length > 0);
  assert.equal(new Set(tokenNames).size, tokenNames.length);
  assert.deepEqual([...tokenTypes].sort(), [...configuredTypes].sort());
  assert.deepEqual([...displayTypes].sort(), [...tokenTypes].sort());
  assert.ok(
    afendaTokenUiCatalog.every((token) => token.displayComponent.endsWith("Token"))
  );
});

test("token catalog DTCG export includes required token metadata", () => {
  for (const token of afendaTokenCatalog) {
    const exportedToken = afendaDesignTokenCatalogExport[token.name];

    assert.ok(exportedToken, `${token.name} must be present in DTCG export`);
    assert.equal(exportedToken.$type, token.type);
    assert.equal(exportedToken.$value, token.value);
    assert.equal(exportedToken.$description, token.description);
    assert.equal(exportedToken.$extensions.afenda.group, token.group);
    assert.equal(
      exportedToken.$extensions.afenda.displayComponent,
      afendaTokenUiCatalog.find((entry) => entry.name === token.name)?.displayComponent
    );
  }
});

test("token catalog CSS variables exist in generated globals declarations", () => {
  const generatedVariables = new Set(
    [
      ...GLOBALS_CSS_ROOT_DECLARATIONS,
      ...GLOBALS_CSS_DARK_DECLARATIONS,
      ...GLOBALS_CSS_COMPACT_DENSITY_DECLARATIONS,
      ...GLOBALS_CSS_COMFORTABLE_DENSITY_DECLARATIONS,
      ...GLOBALS_CSS_THEME_DECLARATIONS,
    ].map(([name]) => name)
  );

  const tokenCatalog: readonly AfendaTokenizedToken[] = afendaTokenCatalog;
  const missingVariables = tokenCatalog
    .filter(hasCssVariable)
    .filter((token) => !generatedVariables.has(token.cssVariable))
    .map((token) => `${token.name}: ${token.cssVariable}`);

  assert.deepEqual(missingVariables, []);
});

test("token catalog names follow Token UI component prefixes", () => {
  validateAfendaTokenCatalog();
});

test("runtime token groups align with Token UI component nav", () => {
  const snapshot = resolveAfendaRuntimeTokenSnapshot(undefined, "light");
  const groups = groupAfendaRuntimeTokensByDisplayComponent(snapshot);
  const allowedSources = new Set(AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES);

  assert.equal(groups.length, AFENDA_TOKEN_UI_COMPONENT_NAV.length);
  assert.equal(groups.length, 10);
  assert.equal(groups[0]?.component, "ColorToken");
  assert.equal(groups.at(-1)?.component, "OrderToken");
  assert.equal(
    groups.reduce((total, group) => total + group.tokens.length, 0),
    snapshot.tokens.length
  );
  for (const token of snapshot.tokens) {
    assert.ok(
      allowedSources.has(token.resolutionSource),
      `token ${token.name} uses ungoverned resolution source ${token.resolutionSource}`
    );
  }
});

test("runtime token snapshot resolves tenant-aware token values by mode", () => {
  const settings = { themePreset: "vercel-geist" } as const;
  const lightSnapshot = resolveAfendaRuntimeTokenSnapshot(settings, "light");
  const darkSnapshot = resolveAfendaRuntimeTokenSnapshot(settings, "dark");
  const lightCssVars = resolveTenantBrandingModeCssVars(settings, "light");
  const darkCssVars = resolveTenantBrandingModeCssVars(settings, "dark");

  assert.equal(
    lightSnapshot.tokenMap["color-brand-primary"]?.resolvedValue,
    lightCssVars["--tenant-primary"]
  );
  assert.equal(
    darkSnapshot.tokenMap["color-brand-primary"]?.resolvedValue,
    darkCssVars["--tenant-primary"]
  );
  assert.equal(
    lightSnapshot.tokenMap["color-brand-primary"]?.resolutionSource,
    "reference-variable"
  );
  assert.equal(
    darkSnapshot.tokenMap["color-brand-primary"]?.resolutionSource,
    "reference-variable"
  );
});

test("runtime token resolution preserves literal tokens when no runtime css var exists", () => {
  const token = resolveAfendaRuntimeToken("color-background");

  assert.ok(token);
  assert.equal(token.resolutionSource, "literal");
  assert.equal(token.resolvedValue, "oklch(0.985 0.003 258)");
});
