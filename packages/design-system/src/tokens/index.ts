import { CHART_COLOR_TOKENS as chartColorTokensValue } from "./chart-tokens";
import {
  BASE_COLOR_TOKENS as baseColorTokensValue,
  BRAND_COLOR_TOKENS as brandColorTokensValue,
  SIDEBAR_COLOR_TOKENS as sidebarColorTokensValue,
  STATUS_COLOR_TOKENS as statusColorTokensValue,
  SURFACE_COLOR_TOKENS as surfaceColorTokensValue,
} from "./color-tokens";
import {
  DENSITY_MODES as densityModesValue,
  DENSITY_TOKENS as densityTokensValue,
} from "./density-tokens";
import {
  FONT_PRESET_NAMES as fontPresetNamesValue,
  FONT_PRESETS as fontPresetsValue,
  FONT_ROLES as fontRolesValue,
} from "./font-tokens";
import {
  ANIMATION_TOKENS as animationTokensValue,
  MOTION_PREFERENCES as motionPreferencesValue,
} from "./motion-tokens";
import {
  RADIUS_SOURCE_TOKENS as radiusSourceTokensValue,
  RADIUS_TOKENS as radiusTokensValue,
} from "./radius-tokens";
import { SHADOW_TOKENS as shadowTokensValue } from "./shadow-tokens";
import {
  THEME_BRAND_COLOR_TOKENS as themeBrandColorTokensValue,
  THEME_PRESET_NAMES as themePresetNamesValue,
  THEME_PRESETS as themePresetsValue,
} from "./theme-preset-tokens";
import {
  FONT_FAMILY_TOKENS as fontFamilyTokensValue,
  FONT_FEATURE_TOKENS as fontFeatureTokensValue,
  TEXT_UTILITY_TOKENS as textUtilityTokensValue,
} from "./typography-tokens";

export const animationTokens: typeof animationTokensValue =
  animationTokensValue;
export const baseColorTokens: typeof baseColorTokensValue =
  baseColorTokensValue;
export const brandColorTokens: typeof brandColorTokensValue =
  brandColorTokensValue;
export const chartColorTokens: typeof chartColorTokensValue =
  chartColorTokensValue;
export const densityModes: typeof densityModesValue = densityModesValue;
export const densityTokens: typeof densityTokensValue = densityTokensValue;
export const fontFeatureTokens: typeof fontFeatureTokensValue =
  fontFeatureTokensValue;
export const fontFamilyTokens: typeof fontFamilyTokensValue =
  fontFamilyTokensValue;
export const fontPresetNames: typeof fontPresetNamesValue =
  fontPresetNamesValue;
export const fontPresets: typeof fontPresetsValue = fontPresetsValue;
export const fontRoles: typeof fontRolesValue = fontRolesValue;
export const motionPreferences: typeof motionPreferencesValue =
  motionPreferencesValue;
export const radiusSourceTokens: typeof radiusSourceTokensValue =
  radiusSourceTokensValue;
export const radiusTokens: typeof radiusTokensValue = radiusTokensValue;
export const shadowTokens: typeof shadowTokensValue = shadowTokensValue;
export const sidebarColorTokens: typeof sidebarColorTokensValue =
  sidebarColorTokensValue;
export const surfaceColorTokens: typeof surfaceColorTokensValue =
  surfaceColorTokensValue;
export const statusColorTokens: typeof statusColorTokensValue =
  statusColorTokensValue;
export const textUtilityTokens: typeof textUtilityTokensValue =
  textUtilityTokensValue;
export const themeBrandColorTokens: typeof themeBrandColorTokensValue =
  themeBrandColorTokensValue;
export const themePresetNames: typeof themePresetNamesValue =
  themePresetNamesValue;
export const themePresets: typeof themePresetsValue = themePresetsValue;

export const designSystemTokenGroups = {
  color: {
    base: baseColorTokensValue,
    brand: brandColorTokensValue,
    chart: chartColorTokensValue,
    sidebar: sidebarColorTokensValue,
    surface: surfaceColorTokensValue,
    status: statusColorTokensValue,
  },
  density: {
    modes: densityModesValue,
    tokens: densityTokensValue,
  },
  motion: {
    animations: animationTokensValue,
    preferences: motionPreferencesValue,
  },
  radius: {
    source: radiusSourceTokensValue,
    tokens: radiusTokensValue,
  },
  shadow: shadowTokensValue,
  typography: {
    fontFeatures: fontFeatureTokensValue,
    fontFamilies: fontFamilyTokensValue,
    fontPresetNames: fontPresetNamesValue,
    fontPresets: fontPresetsValue,
    fontRoles: fontRolesValue,
    textUtilities: textUtilityTokensValue,
  },
  theme: {
    brandColorTokens: themeBrandColorTokensValue,
    presetNames: themePresetNamesValue,
    presets: themePresetsValue,
  },
} as const;

export type DesignSystemTokenGroups = typeof designSystemTokenGroups;
