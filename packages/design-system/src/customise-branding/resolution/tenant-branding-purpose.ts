import type { AfendaColorTokenMode as ColorMode } from "../../contracts/afenda/registries/color-token.registry";
import type {
  AfendaPartialLaneColorModeScale as PartialLaneColorModeScale,
  AfendaTenantBrandingSettings as TenantBrandingSettings,
} from "../../contracts/afenda/customization/branding.contract";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS,
  validateAfendaTenantBrandingSettings as validateTenantBrandingSettings,
} from "../../contracts/afenda/customization/branding.contract";
import type {
  AfendaErpVisualLaneId as ErpVisualLaneId,
  AfendaLaneColorScale as LaneColorScale,
} from "../../contracts/afenda/registries/visual-lane.registry";
import {
  assertValidTenantBrandingColors,
  validateTenantBrandingColors,
  type BrandingColorValidationResult,
} from "./validate-branding-colors";
import {
  type CssVarMap,
  renderTenantBrandingStyleBlock,
  resolveActiveLaneCssVars,
  resolveLaneForFeature,
  resolveLaneScale,
  resolveTenantBrandCssVars,
  resolveTenantLaneOverrideCssVars,
} from "./resolve-tenant-branding";

export type TenantBrandingPatch = Partial<TenantBrandingSettings>;

export type TenantBrandingSummary = {
  affectedLaneIds: readonly ErpVisualLaneId[];
  density: TenantBrandingSettings["density"];
  featureColorOverrideCount: number;
  laneColorOverrideCount: number;
  moduleLaneOverrideCount: number;
  themePreset: TenantBrandingSettings["themePreset"];
};

export type TenantBrandingFeatureSnapshot = {
  cssVars: {
    dark: CssVarMap;
    light: CssVarMap;
  };
  featureId: string;
  laneId: ErpVisualLaneId;
  scale: {
    dark: LaneColorScale;
    light: LaneColorScale;
  };
};

export type TenantBrandingCssSnapshot = {
  dark: CssVarMap;
  light: CssVarMap;
  styleBlock: string;
};

export type TenantBrandingSnapshot = {
  css: TenantBrandingCssSnapshot;
  features: readonly TenantBrandingFeatureSnapshot[];
  settings: TenantBrandingSettings;
  summary: TenantBrandingSummary;
  validation: BrandingColorValidationResult;
};

function mergePartialLaneColorModeScale(
  current: PartialLaneColorModeScale | undefined,
  patch: PartialLaneColorModeScale | undefined
): PartialLaneColorModeScale | undefined {
  if (!patch) {
    return current;
  }

  return {
    light: patch.light
      ? { ...current?.light, ...patch.light }
      : current?.light,
    dark: patch.dark ? { ...current?.dark, ...patch.dark } : current?.dark,
  };
}

function mergeLaneColorRecord(
  current: Record<string, PartialLaneColorModeScale> | undefined,
  patch: Record<string, PartialLaneColorModeScale> | undefined
): Record<string, PartialLaneColorModeScale> | undefined {
  if (!patch) {
    return current;
  }

  const next = { ...(current ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    const merged = mergePartialLaneColorModeScale(next[key], value);
    if (merged) {
      next[key] = merged;
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

function collectAffectedLaneIds(
  settings: TenantBrandingSettings
): readonly ErpVisualLaneId[] {
  const lanes = new Set<ErpVisualLaneId>();

  for (const laneId of Object.values(settings.moduleLaneOverrides ?? {})) {
    lanes.add(laneId);
  }

  for (const laneId of Object.keys(
    settings.laneColorOverrides?.byLane ?? {}
  ) as ErpVisualLaneId[]) {
    lanes.add(laneId);
  }

  return [...lanes].sort();
}

export function applyTenantBrandingPatch(
  current: TenantBrandingSettings,
  patch: TenantBrandingPatch
): TenantBrandingSettings {
  const currentSettings = validateTenantBrandingSettings(current);
  const next = validateTenantBrandingSettings({
    ...currentSettings,
    ...patch,
    moduleLaneOverrides: patch.moduleLaneOverrides
      ? {
          ...currentSettings.moduleLaneOverrides,
          ...patch.moduleLaneOverrides,
        }
      : currentSettings.moduleLaneOverrides,
    laneColorOverrides: patch.laneColorOverrides
      ? {
          byLane: mergeLaneColorRecord(
            currentSettings.laneColorOverrides?.byLane,
            patch.laneColorOverrides.byLane
          ),
          byFeature: mergeLaneColorRecord(
            currentSettings.laneColorOverrides?.byFeature,
            patch.laneColorOverrides.byFeature
          ),
        }
      : currentSettings.laneColorOverrides,
  });

  assertValidTenantBrandingColors(next);

  return next;
}

export function createTenantBrandingSettings(
  patch: TenantBrandingPatch = {}
): TenantBrandingSettings {
  return applyTenantBrandingPatch(DEFAULT_TENANT_BRANDING_SETTINGS, patch);
}

export function summarizeTenantBranding(
  settings: TenantBrandingSettings
): TenantBrandingSummary {
  const parsed = validateTenantBrandingSettings(settings);

  return {
    themePreset: parsed.themePreset,
    density: parsed.density,
    moduleLaneOverrideCount: Object.keys(parsed.moduleLaneOverrides ?? {})
      .length,
    laneColorOverrideCount: Object.keys(parsed.laneColorOverrides?.byLane ?? {})
      .length,
    featureColorOverrideCount: Object.keys(
      parsed.laneColorOverrides?.byFeature ?? {}
    ).length,
    affectedLaneIds: collectAffectedLaneIds(parsed),
  };
}

export function resolveTenantBrandingCssSnapshot(
  settings: TenantBrandingSettings
): TenantBrandingCssSnapshot {
  const parsed = validateTenantBrandingSettings(settings);

  return {
    light: {
      ...resolveTenantBrandCssVars(parsed, "light"),
      ...resolveTenantLaneOverrideCssVars(parsed, "light"),
    },
    dark: {
      ...resolveTenantBrandCssVars(parsed, "dark"),
      ...resolveTenantLaneOverrideCssVars(parsed, "dark"),
    },
    styleBlock: renderTenantBrandingStyleBlock(parsed),
  };
}

export function resolveTenantBrandingFeatureSnapshot(
  settings: TenantBrandingSettings,
  featureId: string
): TenantBrandingFeatureSnapshot {
  const parsed = validateTenantBrandingSettings(settings);
  const laneId = resolveLaneForFeature(parsed, featureId);

  return {
    featureId,
    laneId,
    scale: {
      light: resolveLaneScale(parsed, laneId, featureId, "light"),
      dark: resolveLaneScale(parsed, laneId, featureId, "dark"),
    },
    cssVars: {
      light: resolveActiveLaneCssVars(parsed, featureId, "light"),
      dark: resolveActiveLaneCssVars(parsed, featureId, "dark"),
    },
  };
}

export function resolveTenantBrandingSnapshot(
  settings: TenantBrandingSettings,
  featureIds: readonly string[] = []
): TenantBrandingSnapshot {
  const parsed = validateTenantBrandingSettings(settings);
  assertValidTenantBrandingColors(parsed);

  return {
    settings: parsed,
    summary: summarizeTenantBranding(parsed),
    validation: validateTenantBrandingColors(parsed),
    css: resolveTenantBrandingCssSnapshot(parsed),
    features: featureIds.map((featureId) =>
      resolveTenantBrandingFeatureSnapshot(parsed, featureId)
    ),
  };
}

export function resolveTenantBrandingModeCssVars(
  settings: TenantBrandingSettings,
  mode: ColorMode
): CssVarMap {
  const parsed = validateTenantBrandingSettings(settings);

  return {
    ...resolveTenantBrandCssVars(parsed, mode),
    ...resolveTenantLaneOverrideCssVars(parsed, mode),
  };
}
