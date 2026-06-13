import { z } from "zod";

import { defineRegistry } from "../registry.schema";
import {
  AFENDA_CHART_COLOR_TOKENS,
  AFENDA_CHART_HUES as CHART_HUES,
} from "./registries/chart.registry";
import type { AfendaThemePresetName as ThemePresetName } from "./registries/theme-preset.registry";
import { AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS } from "./registries/theme-preset.registry";
import { AFENDA_ERP_VISUAL_LANES as ERP_VISUAL_LANES } from "./registries/visual-lane.registry";

export const AFENDA_HUE_RESERVATION_CONTRACT_ID =
  "afenda.hue-reservation-contract" as const;
export const AFENDA_HUE_RESERVATION_POLICY_ID =
  AFENDA_HUE_RESERVATION_CONTRACT_ID;
export const AFENDA_HUE_RESERVATION_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_COLOR_HUE_SYSTEM = {
  brand: { primary: 198, secondary: 250, accent: 68 },
  status: { success: 145, warning: 50, destructive: 27, info: 230 },
  lanes: {
    money: 160,
    people: 330,
    goods: 95,
    operations: 212,
    customer: 272,
    governance: 305,
    intelligence: 184,
  },
  charts: {
    chart1: 198,
    chart2: 250,
    chart3: 160,
    chart4: 68,
    chart5: 285,
    chart6: 212,
    chart7: 330,
  },
} as const;

export const AFENDA_MIN_HUE_SEPARATION = {
  brandVsStatus: 10,
  laneVsStatus: 10,
  laneVsLane: 15,
  laneVsLaneTinyUi: 18,
} as const;

export const AFENDA_COLOR_HUE_FAMILIES = defineRegistry([
  "brand-primary",
  "brand-secondary",
  "brand-accent",
  "status-success",
  "status-warning",
  "status-destructive",
  "status-info",
  "lane-money",
  "lane-people",
  "lane-goods",
  "lane-operations",
  "lane-customer",
  "lane-governance",
  "lane-intelligence",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
]);

export const AFENDA_HUE_RESERVATION_CATEGORIES = defineRegistry([
  "brand",
  "status",
  "lane",
  "chart",
]);

export const AFENDA_HUE_RESERVATION_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theming-contract",
  "AFENDA:visual-design-contract",
] as const;

export type AfendaColorHueFamily =
  (typeof AFENDA_COLOR_HUE_FAMILIES)[number];

export type AfendaHueFamilyCategory =
  (typeof AFENDA_HUE_RESERVATION_CATEGORIES)[number];

export type AfendaHueReservationEntry = {
  category: AfendaHueFamilyCategory;
  family: AfendaColorHueFamily | string;
  hue: number;
  source?: string;
};

export type AfendaHueCollision = {
  a: AfendaHueReservationEntry;
  b: AfendaHueReservationEntry;
  distance: number;
  minimumRequired: number;
  rule: string;
  severity: "error" | "warning";
};

export type AfendaHueValidationResult = {
  collisions: AfendaHueCollision[];
  valid: boolean;
  warnings: AfendaHueCollision[];
};

export type AfendaParsedOklch = {
  alpha: number | undefined;
  c: number;
  h: number;
  l: number;
};

export type AfendaHueReservationContract = {
  categories: readonly AfendaHueFamilyCategory[];
  families: readonly AfendaColorHueFamily[];
  governanceReferences: readonly string[];
  id: typeof AFENDA_HUE_RESERVATION_CONTRACT_ID;
  minimumSeparation: typeof AFENDA_MIN_HUE_SEPARATION;
  reservedHues: typeof AFENDA_COLOR_HUE_SYSTEM;
  version: typeof AFENDA_HUE_RESERVATION_CONTRACT_VERSION;
};

export const afendaHueFamilyCategorySchema = z.enum(
  AFENDA_HUE_RESERVATION_CATEGORIES
);

export const afendaColorHueFamilySchema = z.enum(AFENDA_COLOR_HUE_FAMILIES);

export const afendaHueReservationEntrySchema = z
  .object({
    category: afendaHueFamilyCategorySchema,
    family: z.string().trim().min(1),
    hue: z.number().min(0).max(360),
    source: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaHueReservationContractSchema = z
  .object({
    categories: z.array(afendaHueFamilyCategorySchema).min(1).readonly(),
    families: z.array(afendaColorHueFamilySchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_HUE_RESERVATION_CONTRACT_ID),
    minimumSeparation: z
      .object({
        brandVsStatus: z.number().positive(),
        laneVsStatus: z.number().positive(),
        laneVsLane: z.number().positive(),
        laneVsLaneTinyUi: z.number().positive(),
      })
      .strict(),
    reservedHues: z
      .object({
        brand: z.record(z.string().trim().min(1), z.number().min(0).max(360)),
        charts: z.record(z.string().trim().min(1), z.number().min(0).max(360)),
        lanes: z.record(z.string().trim().min(1), z.number().min(0).max(360)),
        status: z.record(z.string().trim().min(1), z.number().min(0).max(360)),
      })
      .strict(),
    version: z.literal(AFENDA_HUE_RESERVATION_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.minimumSeparation.laneVsLaneTinyUi >
      contract.minimumSeparation.laneVsLane,
    "Tiny UI lane separation warning threshold must exceed the lane collision threshold"
  );

export const afendaHueReservationContract = {
  id: AFENDA_HUE_RESERVATION_CONTRACT_ID,
  version: AFENDA_HUE_RESERVATION_CONTRACT_VERSION,
  categories: AFENDA_HUE_RESERVATION_CATEGORIES,
  families: AFENDA_COLOR_HUE_FAMILIES,
  reservedHues: AFENDA_COLOR_HUE_SYSTEM,
  minimumSeparation: AFENDA_MIN_HUE_SEPARATION,
  governanceReferences: AFENDA_HUE_RESERVATION_GOVERNANCE_REFERENCES,
} as const satisfies AfendaHueReservationContract;

export function validateAfendaHueReservationContract(): void {
  afendaHueReservationContractSchema.parse(afendaHueReservationContract);
}

const OKLCH_PATTERN =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;

export function parseAfendaOklch(value: string): AfendaParsedOklch | null {
  const match = value.trim().match(OKLCH_PATTERN);
  if (!match) {
    return null;
  }

  const lightness = match[1];
  const chroma = match[2];
  const hue = match[3];
  const alpha = match[4];
  if (!lightness || !chroma || !hue) {
    return null;
  }

  let alphaValue: number | undefined;
  if (alpha) {
    alphaValue = alpha.endsWith("%")
      ? Number.parseFloat(alpha) / 100
      : Number.parseFloat(alpha);
  }

  return {
    l: Number.parseFloat(lightness),
    c: Number.parseFloat(chroma),
    h: Number.parseFloat(hue),
    alpha: alphaValue,
  };
}

export function extractAfendaHue(tokenValue: string): number | null {
  const trimmed = tokenValue.trim();

  if (trimmed.startsWith("oklch(")) {
    return parseAfendaOklch(trimmed)?.h ?? null;
  }

  const embeddedOklch = trimmed.match(/oklch\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/i);
  const embeddedHue = embeddedOklch?.[1];
  if (embeddedHue) {
    return Number.parseFloat(embeddedHue);
  }

  const hueSuffix = trimmed.match(/\s([\d.]+)\)$/);
  const suffixHue = hueSuffix?.[1];
  if (suffixHue) {
    return Number.parseFloat(suffixHue);
  }

  return null;
}

export function afendaHueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);

  return Math.min(diff, 360 - diff);
}

function isStatusCategory(category: AfendaHueFamilyCategory): boolean {
  return category === "status";
}

function minimumAfendaHueSeparation(
  left: AfendaHueReservationEntry,
  right: AfendaHueReservationEntry
): { minimum: number; rule: string } | null {
  const leftCategory = left.category;
  const rightCategory = right.category;

  if (leftCategory === "chart" || rightCategory === "chart") {
    return null;
  }

  if (
    (leftCategory === "brand" && isStatusCategory(rightCategory)) ||
    (rightCategory === "brand" && isStatusCategory(leftCategory))
  ) {
    return {
      minimum: AFENDA_MIN_HUE_SEPARATION.brandVsStatus,
      rule: "brand-vs-status",
    };
  }

  if (
    (leftCategory === "lane" && isStatusCategory(rightCategory)) ||
    (rightCategory === "lane" && isStatusCategory(leftCategory))
  ) {
    return {
      minimum: AFENDA_MIN_HUE_SEPARATION.laneVsStatus,
      rule: "lane-vs-status",
    };
  }

  if (leftCategory === "lane" && rightCategory === "lane") {
    return {
      minimum: AFENDA_MIN_HUE_SEPARATION.laneVsLane,
      rule: "lane-vs-lane",
    };
  }

  return null;
}

export function validateAfendaHueReservation(
  entries: readonly AfendaHueReservationEntry[]
): AfendaHueValidationResult {
  const collisions: AfendaHueCollision[] = [];
  const warnings: AfendaHueCollision[] = [];

  for (const [index, left] of entries.entries()) {
    for (const right of entries.slice(index + 1)) {
      const rule = minimumAfendaHueSeparation(left, right);

      if (!rule) {
        continue;
      }

      const distance = afendaHueDistance(left.hue, right.hue);
      if (distance >= rule.minimum) {
        if (
          rule.rule === "lane-vs-lane" &&
          distance < AFENDA_MIN_HUE_SEPARATION.laneVsLaneTinyUi
        ) {
          warnings.push({
            a: left,
            b: right,
            distance,
            minimumRequired: AFENDA_MIN_HUE_SEPARATION.laneVsLaneTinyUi,
            rule: "lane-vs-lane-tiny-ui",
            severity: "warning",
          });
        }
        continue;
      }

      collisions.push({
        a: left,
        b: right,
        distance,
        minimumRequired: rule.minimum,
        rule: rule.rule,
        severity: "error",
      });
    }
  }

  return {
    valid: collisions.length === 0,
    collisions,
    warnings,
  };
}

export function collectAfendaReservedStatusHueEntries(): AfendaHueReservationEntry[] {
  return [
    {
      family: "status-success",
      category: "status",
      hue: AFENDA_COLOR_HUE_SYSTEM.status.success,
    },
    {
      family: "status-warning",
      category: "status",
      hue: AFENDA_COLOR_HUE_SYSTEM.status.warning,
    },
    {
      family: "status-destructive",
      category: "status",
      hue: AFENDA_COLOR_HUE_SYSTEM.status.destructive,
    },
    {
      family: "status-info",
      category: "status",
      hue: AFENDA_COLOR_HUE_SYSTEM.status.info,
    },
  ];
}

export function formatAfendaHueValidationReport(
  result: AfendaHueValidationResult
): string {
  const lines: string[] = [];

  for (const collision of result.collisions) {
    lines.push(
      `[error] ${collision.rule}: ${collision.a.family} (${collision.a.hue}deg) vs ${collision.b.family} (${collision.b.hue}deg) - ${collision.distance.toFixed(1)}deg < ${collision.minimumRequired}deg`
    );
  }

  for (const warning of result.warnings) {
    lines.push(
      `[warn] ${warning.rule}: ${warning.a.family} (${warning.a.hue}deg) vs ${warning.b.family} (${warning.b.hue}deg) - ${warning.distance.toFixed(1)}deg < ${warning.minimumRequired}deg`
    );
  }

  return lines.join("\n");
}

function collectBrandHueEntries(
  presetName: ThemePresetName
): AfendaHueReservationEntry[] {
  const preset = THEME_PRESETS.find((entry) => entry.name === presetName);
  if (!preset) {
    throw new Error(`Unknown theme preset: ${presetName}`);
  }

  return [
    {
      family: `${presetName}-brand-primary`,
      category: "brand",
      hue: extractAfendaHue(preset.brand.light.primary) ?? 0,
      source: preset.brand.light.primary,
    },
    {
      family: `${presetName}-brand-secondary`,
      category: "brand",
      hue: extractAfendaHue(preset.brand.light.secondary) ?? 0,
      source: preset.brand.light.secondary,
    },
    {
      family: `${presetName}-brand-accent`,
      category: "brand",
      hue: extractAfendaHue(preset.brand.light.accent) ?? 0,
      source: preset.brand.light.accent,
    },
  ];
}

export function collectDefaultPlatformHueEntries(): AfendaHueReservationEntry[] {
  const brandEntries = collectBrandHueEntries("afenda").map((entry) => ({
    ...entry,
    family: entry.family.replace(/^afenda-/, ""),
  }));

  const laneEntries: AfendaHueReservationEntry[] = ERP_VISUAL_LANES.map((lane) => ({
    family: `lane-${lane.id}`,
    category: "lane",
    hue:
      extractAfendaHue(lane.scales.light.solid) ??
      AFENDA_COLOR_HUE_SYSTEM.lanes[lane.id],
    source: lane.scales.light.solid,
  }));

  const chartEntries: AfendaHueReservationEntry[] = AFENDA_CHART_COLOR_TOKENS.map(
    (token) => ({
      family: token,
      category: "chart",
      hue: CHART_HUES[token],
      source: `registry:${token}`,
    })
  );

  return [
    ...brandEntries,
    ...collectAfendaReservedStatusHueEntries(),
    ...laneEntries,
    ...chartEntries,
  ];
}

export function collectThemePresetHueEntries(
  presetName: ThemePresetName
): AfendaHueReservationEntry[] {
  return [
    ...collectBrandHueEntries(presetName),
    ...collectAfendaReservedStatusHueEntries(),
  ];
}

export function collectAllThemePresetHueEntries(): AfendaHueReservationEntry[] {
  return [
    ...THEME_PRESETS.flatMap((preset) => collectBrandHueEntries(preset.name)),
    ...collectAfendaReservedStatusHueEntries(),
  ];
}
