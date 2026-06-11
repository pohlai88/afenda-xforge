import { CHART_HUES } from "../contracts/chart.contract";
import type { HueReservationEntry } from "../contracts/hue-reservation.contract";
import {
  collectReservedStatusHueEntries,
  extractHue,
  xforgeColorSystemV3,
} from "../contracts/hue-reservation.contract";
import type { ThemePresetName } from "../contracts/theme-preset.contract";
import { THEME_PRESETS } from "../contracts/theme-preset.contract";
import { ERP_VISUAL_LANES } from "../contracts/visual-lane.contract";
import { CHART_LIGHT_DECLARATIONS } from "./chart-tokens";

function collectBrandHueEntries(
  presetName: ThemePresetName
): HueReservationEntry[] {
  const preset = THEME_PRESETS.find((entry) => entry.name === presetName);
  if (!preset) {
    throw new Error(`Unknown theme preset: ${presetName}`);
  }

  return [
    {
      family: `${presetName}-brand-primary`,
      category: "brand",
      hue: extractHue(preset.brand.light.primary) ?? 0,
      source: preset.brand.light.primary,
    },
    {
      family: `${presetName}-brand-secondary`,
      category: "brand",
      hue: extractHue(preset.brand.light.secondary) ?? 0,
      source: preset.brand.light.secondary,
    },
    {
      family: `${presetName}-brand-accent`,
      category: "brand",
      hue: extractHue(preset.brand.light.accent) ?? 0,
      source: preset.brand.light.accent,
    },
  ];
}

export function collectDefaultPlatformHueEntries(): HueReservationEntry[] {
  const brandEntries = collectBrandHueEntries("xforge").map((entry) => ({
    ...entry,
    family: entry.family.replace(/^xforge-/, ""),
  }));

  const laneEntries: HueReservationEntry[] = ERP_VISUAL_LANES.map((lane) => ({
    family: `lane-${lane.id}`,
    category: "lane",
    hue:
      extractHue(lane.scales.light.solid) ?? xforgeColorSystemV3.lanes[lane.id],
    source: lane.scales.light.solid,
  }));

  const chartEntries: HueReservationEntry[] = CHART_LIGHT_DECLARATIONS.map(
    ([tokenName, value]) => ({
      family: tokenName.replace(/^--/, ""),
      category: "chart",
      hue:
        extractHue(value) ??
        CHART_HUES[tokenName.replace(/^--/, "") as keyof typeof CHART_HUES],
      source: value,
    })
  );

  return [
    ...brandEntries,
    ...collectReservedStatusHueEntries(),
    ...laneEntries,
    ...chartEntries,
  ];
}

export function collectThemePresetHueEntries(
  presetName: ThemePresetName
): HueReservationEntry[] {
  return [
    ...collectBrandHueEntries(presetName),
    ...collectReservedStatusHueEntries(),
  ];
}

export function collectAllThemePresetHueEntries(): HueReservationEntry[] {
  return [
    ...THEME_PRESETS.flatMap((preset) => collectBrandHueEntries(preset.name)),
    ...collectReservedStatusHueEntries(),
  ];
}
