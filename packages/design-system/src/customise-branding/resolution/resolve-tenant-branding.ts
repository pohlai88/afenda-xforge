import { getAfendaDefaultLaneForFeature as getDefaultLaneForFeature } from "../../contracts/afenda/catalogs/module-lane.catalog";
import type {
  AfendaPartialLaneColorScale as PartialLaneColorScale,
  AfendaTenantBrandingSettings as TenantBrandingSettings,
} from "../../contracts/afenda/customization/branding.contract";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS,
  afendaMergeLaneScaleFields as mergeLaneScaleFields,
} from "../../contracts/afenda/customization/branding.contract";
import {
  AFENDA_ERP_VISUAL_LANE_BY_ID as ERP_VISUAL_LANE_BY_ID,
  AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS,
  afendaActiveLaneCssVarName as activeLaneCssVarName,
  afendaLaneCssVarName as laneCssVarName,
  afendaTenantLaneCssVarName as tenantLaneCssVarName,
  type AfendaColorTokenMode as ColorMode,
  type AfendaErpVisualLaneId as ErpVisualLaneId,
  type AfendaLaneColorScale as LaneColorScale,
  type AfendaLaneColorScaleField as LaneColorScaleField,
} from "../../contracts/afenda/registries";

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
  const preset = THEME_PRESETS.find(
    (entry) => entry.name === settings.themePreset
  );
  if (!preset) {
    throw new Error(`Unknown theme preset: ${settings.themePreset}`);
  }

  return preset;
}

export function resolveLaneForFeature(
  settings: TenantBrandingSettings,
  featureId: string
): ErpVisualLaneId {
  const directOverride = settings.moduleLaneOverrides?.[featureId];
  if (directOverride) {
    return directOverride;
  }

  const prefixOverrides = settings.moduleLaneOverrides;
  if (prefixOverrides) {
    for (const [key, laneId] of Object.entries(prefixOverrides)) {
      if (!key.endsWith("*")) {
        continue;
      }

      const prefix = key.slice(0, -1);
      if (
        featureId === prefix.replace(/\.$/, "") ||
        featureId.startsWith(prefix)
      ) {
        return laneId;
      }
    }
  }

  return getDefaultLaneForFeature(featureId);
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
    mergeOptionalLaneScale(
      base,
      laneModeScale?.light,
      laneModeScale?.dark,
      mode
    ),
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
    "--tenant-secondary-foreground": brand["secondary-foreground"],
    "--tenant-accent": brand.accent,
    "--tenant-accent-foreground": brand["accent-foreground"],
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

export function cssVarMapToInlineStyle(
  vars: CssVarMap
): Record<string, string> {
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

  return [renderBlock(":root", rootVars), renderBlock(".dark", darkVars)].join(
    "\n\n"
  );
}

export function resolveLaneCssVarReference(
  laneId: ErpVisualLaneId,
  field: LaneColorScaleField
): string {
  return `var(${laneCssVarName(laneId, field)})`;
}
