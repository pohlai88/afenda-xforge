import { CHART_HUES } from "../contracts/chart.contract";
import {
  collectReservedStatusHueEntries,
  extractHue,
  validateHueReservation,
  type HueReservationEntry,
  type HueValidationResult,
} from "../contracts/hue-reservation.contract";
import { THEME_PRESETS } from "../contracts/theme-preset.contract";
import type { TenantBrandingSettings } from "../contracts/tenant-branding.contract";
import type { UserBrandingPreferences } from "../contracts/user-branding.contract";
import {
  ERP_VISUAL_LANE_BY_ID,
  type ErpVisualLaneId,
} from "../contracts/visual-lane.contract";
import { resolveLaneScale } from "./resolve-tenant-branding";

export type BrandingColorValidationError = {
  conflictingFamily: string;
  distance: number;
  family: string;
  hue: number;
  minimumRequired: number;
  rule: string;
  severity: "error" | "warning";
};

export type BrandingColorValidationResult = {
  errors: BrandingColorValidationError[];
  valid: boolean;
  warnings: BrandingColorValidationError[];
};

function mapCollisions(
  result: HueValidationResult
): BrandingColorValidationResult {
  const mapEntry = (collision: HueValidationResult["collisions"][number]) => ({
    family: collision.a.family,
    hue: collision.a.hue,
    conflictingFamily: collision.b.family,
    distance: collision.distance,
    minimumRequired: collision.minimumRequired,
    rule: collision.rule,
    severity: collision.severity,
  });

  return {
    valid: result.valid,
    errors: result.collisions.map(mapEntry),
    warnings: result.warnings.map(mapEntry),
  };
}

function collectBrandHueEntries(
  settings: TenantBrandingSettings
): HueReservationEntry[] {
  const preset = THEME_PRESETS.find((entry) => entry.name === settings.themePreset);
  if (!preset) {
    throw new Error(`Unknown theme preset: ${settings.themePreset}`);
  }

  return [
    {
      family: "brand-primary",
      category: "brand",
      hue: extractHue(preset.brand.light.primary) ?? 0,
      source: preset.brand.light.primary,
    },
    {
      family: "brand-secondary",
      category: "brand",
      hue: extractHue(preset.brand.light.secondary) ?? 0,
      source: preset.brand.light.secondary,
    },
    {
      family: "brand-accent",
      category: "brand",
      hue: extractHue(preset.brand.light.accent) ?? 0,
      source: preset.brand.light.accent,
    },
  ];
}

function collectLaneHueEntries(
  settings: TenantBrandingSettings
): HueReservationEntry[] {
  const laneIds = new Set<ErpVisualLaneId>();

  for (const laneId of Object.keys(ERP_VISUAL_LANE_BY_ID) as ErpVisualLaneId[]) {
    laneIds.add(laneId);
  }

  for (const laneId of Object.values(settings.moduleLaneOverrides ?? {})) {
    laneIds.add(laneId);
  }

  for (const laneId of Object.keys(settings.laneColorOverrides?.byLane ?? {}) as ErpVisualLaneId[]) {
    laneIds.add(laneId);
  }

  return [...laneIds].map((laneId) => {
    const scale = resolveLaneScale(settings, laneId, undefined, "light");
    return {
      family: `lane-${laneId}`,
      category: "lane",
      hue: extractHue(scale.solid) ?? 0,
      source: scale.solid,
    };
  });
}

export function validateTenantBrandingColors(
  settings: TenantBrandingSettings
): BrandingColorValidationResult {
  const entries = [
    ...collectBrandHueEntries(settings),
    ...collectLaneHueEntries(settings),
    ...collectReservedStatusHueEntries(),
  ];

  return mapCollisions(validateHueReservation(entries));
}

export function validateUserBrandingColors(
  preferences: UserBrandingPreferences
): BrandingColorValidationResult {
  if (
    !preferences.themePreset &&
    !preferences.laneColorOverrides &&
    !preferences.moduleLaneOverrides
  ) {
    return { valid: true, errors: [], warnings: [] };
  }

  const settings: TenantBrandingSettings = {
    themePreset: preferences.themePreset ?? "xforge",
    moduleLaneOverrides: preferences.moduleLaneOverrides,
    laneColorOverrides: preferences.laneColorOverrides,
  };

  return validateTenantBrandingColors(settings);
}

export class BrandingColorValidationFailure extends Error {
  readonly result: BrandingColorValidationResult;

  constructor(result: BrandingColorValidationResult) {
    const firstError = result.errors[0];
    const message = firstError
      ? `Branding color validation failed (${firstError.rule}): ${firstError.family} (${firstError.hue}°) conflicts with ${firstError.conflictingFamily} (${firstError.distance.toFixed(1)}° < ${firstError.minimumRequired}°)`
      : "Branding color validation failed";
    super(message);
    this.name = "BrandingColorValidationFailure";
    this.result = result;
  }
}

export function assertValidTenantBrandingColors(
  settings: TenantBrandingSettings
): void {
  const result = validateTenantBrandingColors(settings);
  if (!result.valid) {
    throw new BrandingColorValidationFailure(result);
  }
}

export function assertValidUserBrandingColors(
  preferences: UserBrandingPreferences
): void {
  const result = validateUserBrandingColors(preferences);
  if (!result.valid) {
    throw new BrandingColorValidationFailure(result);
  }
}

export function collectChartHueEntries(): HueReservationEntry[] {
  return Object.entries(CHART_HUES).map(([family, hue]) => ({
    family,
    category: "chart",
    hue,
  }));
}
