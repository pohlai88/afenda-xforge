import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const ERP_VISUAL_LANE_IDS = defineRegistry([
  "money",
  "people",
  "goods",
  "operations",
  "customer",
  "governance",
  "intelligence",
]);

export const LANE_COLOR_SCALE_FIELDS = defineRegistry([
  "solid",
  "foreground",
  "muted",
  "muted-foreground",
  "border",
  "glow",
]);

export type ErpVisualLaneId = (typeof ERP_VISUAL_LANE_IDS)[number];
export type LaneColorScaleField = (typeof LANE_COLOR_SCALE_FIELDS)[number];

export type LaneColorScale = Record<LaneColorScaleField, string>;

export type LaneColorModeScale = {
  light: LaneColorScale;
  dark: LaneColorScale;
};

export type ErpVisualLaneDefinition = {
  id: ErpVisualLaneId;
  title: string;
  scales: LaneColorModeScale;
};

const cssColorValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("oklch(") ||
      value.startsWith("var(") ||
      value.startsWith("color-mix("),
    "Lane color values must be oklch(), var(), or color-mix()"
  );

export const laneColorScaleSchema = z
  .object({
    solid: cssColorValueSchema,
    foreground: cssColorValueSchema,
    muted: cssColorValueSchema,
    "muted-foreground": cssColorValueSchema,
    border: cssColorValueSchema,
    glow: cssColorValueSchema,
  })
  .strict();

export const laneColorModeScaleSchema = z
  .object({
    light: laneColorScaleSchema,
    dark: laneColorScaleSchema,
  })
  .strict();

export function buildLaneScale(
  solid: string,
  hue: number,
  mode: "dark" | "light"
): LaneColorScale {
  if (mode === "light") {
    return {
      solid,
      foreground: `oklch(0.14 0.02 ${hue})`,
      muted: `color-mix(in oklab, ${solid} 12%, transparent)`,
      "muted-foreground": `oklch(0.42 0.06 ${hue})`,
      border: `color-mix(in oklab, ${solid} 35%, transparent)`,
      glow: `color-mix(in oklab, ${solid} 24%, transparent)`,
    };
  }

  return {
    solid,
    foreground: `oklch(0.17 0.014 ${hue})`,
    muted: `color-mix(in oklab, ${solid} 18%, transparent)`,
    "muted-foreground": `oklch(0.86 0.06 ${hue})`,
    border: `color-mix(in oklab, ${solid} 40%, transparent)`,
    glow: `color-mix(in oklab, ${solid} 28%, transparent)`,
  };
}

type LaneSolidDefinition = {
  dark: string;
  hue: number;
  light: string;
  title: string;
};

const LANE_SOLID_DEFINITIONS: Record<ErpVisualLaneId, LaneSolidDefinition> = {
  money: {
    title: "Money",
    light: "oklch(0.68 0.11 160)",
    dark: "oklch(0.72 0.12 160)",
    hue: 160,
  },
  people: {
    title: "People",
    light: "oklch(0.72 0.12 330)",
    dark: "oklch(0.76 0.11 330)",
    hue: 330,
  },
  goods: {
    title: "Goods",
    light: "oklch(0.72 0.11 95)",
    dark: "oklch(0.78 0.10 95)",
    hue: 95,
  },
  operations: {
    title: "Operations",
    light: "oklch(0.70 0.10 212)",
    dark: "oklch(0.74 0.095 212)",
    hue: 212,
  },
  customer: {
    title: "Customer",
    light: "oklch(0.70 0.12 272)",
    dark: "oklch(0.74 0.11 272)",
    hue: 272,
  },
  governance: {
    title: "Governance",
    light: "oklch(0.66 0.07 305)",
    dark: "oklch(0.7 0.065 305)",
    hue: 305,
  },
  intelligence: {
    title: "Intelligence",
    light: "oklch(0.74 0.10 184)",
    dark: "oklch(0.78 0.095 184)",
    hue: 184,
  },
};

export const ERP_VISUAL_LANES: readonly ErpVisualLaneDefinition[] =
  ERP_VISUAL_LANE_IDS.map((id) => {
    const definition = LANE_SOLID_DEFINITIONS[id];

    return {
      id,
      title: definition.title,
      scales: {
        light: buildLaneScale(definition.light, definition.hue, "light"),
        dark: buildLaneScale(definition.dark, definition.hue, "dark"),
      },
    };
  });

export const ERP_VISUAL_LANE_BY_ID: Record<
  ErpVisualLaneId,
  ErpVisualLaneDefinition
> = Object.fromEntries(
  ERP_VISUAL_LANES.map((lane) => [lane.id, lane])
) as Record<ErpVisualLaneId, ErpVisualLaneDefinition>;

export function laneCssVarName(
  laneId: ErpVisualLaneId,
  field: LaneColorScaleField
): string {
  if (field === "solid") {
    return `--lane-${laneId}`;
  }

  return `--lane-${laneId}-${field}`;
}

export function activeLaneCssVarName(field: LaneColorScaleField): string {
  if (field === "solid") {
    return "--lane-active";
  }

  return `--lane-active-${field}`;
}

export function tenantLaneCssVarName(
  laneId: ErpVisualLaneId,
  field: LaneColorScaleField
): string {
  if (field === "solid") {
    return `--tenant-lane-${laneId}`;
  }

  return `--tenant-lane-${laneId}-${field}`;
}

export function validateVisualLaneRegistry(): void {
  for (const lane of ERP_VISUAL_LANES) {
    laneColorModeScaleSchema.parse(lane.scales);
  }
}
