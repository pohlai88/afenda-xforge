import type { ColorMode } from "../contracts/color.contract";
import { getDefaultLaneForFeature } from "../contracts/module-lane.catalog";
import { THEME_PRESETS } from "../contracts/theme-preset.contract";
import {
  DEFAULT_TENANT_BRANDING_SETTINGS,
  mergeLaneScaleFields,
  type PartialLaneColorScale,
  type TenantBrandingSettings,
} from "../contracts/tenant-branding.contract";
import {
  activeLaneCssVarName,
  ERP_VISUAL_LANE_BY_ID,
  laneCssVarName,
  tenantLaneCssVarName,
  type ErpVisualLaneId,
  type LaneColorScale,
  type LaneColorScaleField,
} from "../contracts/visual-lane.contract";

export type CssVarMap = Record<string, string>;

function mergeOptionalLaneScale(
  base: LaneColorScale,
  light?: PartialLaneColorScale,
  dark?: PartialLaneColorScale,
  mode?: ColorMode
): LaneColorScale {
  if (!mode) {
    return base;
  }

  const override = mode === "dark" ? dark : light;
  return mergeLaneScaleFields(base, override);
}

function getThemePreset(settings: TenantBrandingSettings) {
  const preset = THEME_PRESETS.find((entry) => entry.name === settings.themePreset);
  if (!preset) {
    throw new Error(`Unknown theme preset: ${settings.themePreset}`);
  }

  return preset;
}

export function resolveLaneForFeature(
  settings: TenantBrandingSettings,
  featureId: string
): ErpVisualLaneId {
  return settings.moduleLaneOverrides?.[featureId] ?? getDefaultLaneForFeature(featureId);
}

export function resolveLaneScale(
  settings: TenantBrandingSettings,
  laneId: ErpVisualLaneId,
  featureId: string | undefined,
  mode: ColorMode
): LaneColorScale {
  const base = ERP_VISUAL_LANE_BY_ID[laneId].scales[mode];
  const featureModeScale = featureId
    ? settings.laneColorOverrides?.byFeature?.[featureId]
    : undefined;
  const laneModeScale = settings.laneColorOverrides?.byLane?.[laneId];

  return mergeOptionalLaneScale(
    mergeOptionalLaneScale(base, laneModeScale?.light, laneModeScale?.dark, mode),
    featureModeScale?.light,
    featureModeScale?.dark,
    mode
  );
}

export function resolveTenantBrandCssVars(
  settings: TenantBrandingSettings,
  mode: ColorMode
): CssVarMap {
  const preset = getThemePreset(settings);
  const brand = preset.brand[mode];

  return {
    "--tenant-primary": brand.primary,
    "--tenant-primary-foreground": brand["primary-foreground"],
    "--tenant-secondary": brand.secondary,
    "--tenant-accent": brand.accent,
  };
}

export function resolveTenantLaneOverrideCssVars(
  settings: TenantBrandingSettings,
  mode: ColorMode
): CssVarMap {
  const vars: CssVarMap = {};
  const byLane = settings.laneColorOverrides?.byLane;

  if (!byLane) {
    return vars;
  }

  for (const [laneId, modeScale] of Object.entries(byLane)) {
    const lane = laneId as ErpVisualLaneId;
    const scale = modeScale[mode];
    if (!scale) {
      continue;
    }

    for (const [field, value] of Object.entries(scale)) {
      if (value) {
        vars[tenantLaneCssVarName(lane, field as LaneColorScaleField)] = value;
      }
    }
  }

  return vars;
}

export function resolveActiveLaneCssVars(
  settings: TenantBrandingSettings,
  featureId: string,
  mode: ColorMode
): CssVarMap {
  const laneId = resolveLaneForFeature(settings, featureId);
  const scale = resolveLaneScale(settings, laneId, featureId, mode);
  const vars: CssVarMap = {};

  for (const field of Object.keys(scale) as LaneColorScaleField[]) {
    vars[activeLaneCssVarName(field)] = scale[field];
  }

  vars["--lane-active-id"] = laneId;

  return vars;
}

export function cssVarMapToInlineStyle(vars: CssVarMap): Record<string, string> {
  return { ...vars };
}

export function renderTenantBrandingStyleBlock(
  settings: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS
): string {
  const rootVars = {
    ...resolveTenantBrandCssVars(settings, "light"),
    ...resolveTenantLaneOverrideCssVars(settings, "light"),
  };
  const darkVars = {
    ...resolveTenantBrandCssVars(settings, "dark"),
    ...resolveTenantLaneOverrideCssVars(settings, "dark"),
  };

  const renderBlock = (selector: string, vars: CssVarMap) =>
    `${selector} {\n${Object.entries(vars)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n")}\n}`;

  return [renderBlock(":root", rootVars), renderBlock(".dark", darkVars)].join("\n\n");
}

export function resolveLaneCssVarReference(
  laneId: ErpVisualLaneId,
  field: LaneColorScaleField
): string {
  return `var(${laneCssVarName(laneId, field)})`;
}
