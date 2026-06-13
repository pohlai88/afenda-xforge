import { z } from "zod";

import { defineRegistry } from "../../registry.schema";

export const AFENDA_VISUAL_LANE_REGISTRY_ID =
  "afenda.visual-lane-registry" as const;
export const AFENDA_VISUAL_LANE_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_ERP_VISUAL_LANE_IDS = defineRegistry([
  "money",
  "people",
  "goods",
  "operations",
  "customer",
  "governance",
  "intelligence",
]);

export const AFENDA_LANE_COLOR_SCALE_FIELDS = defineRegistry([
  "solid",
  "foreground",
  "muted",
  "muted-foreground",
  "border",
  "glow",
]);

export const AFENDA_VISUAL_LANE_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theming-contract",
  "AFENDA:data-display-contract",
  "AFENDA:tenant-context-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:hue-reservation-contract",
] as const;

export type AfendaErpVisualLaneId =
  (typeof AFENDA_ERP_VISUAL_LANE_IDS)[number];
export type AfendaLaneColorScaleField =
  (typeof AFENDA_LANE_COLOR_SCALE_FIELDS)[number];

export type AfendaLaneColorScale = Record<AfendaLaneColorScaleField, string>;

export type AfendaLaneColorModeScale = {
  dark: AfendaLaneColorScale;
  light: AfendaLaneColorScale;
};

export type AfendaErpVisualLaneDefinition = {
  id: AfendaErpVisualLaneId;
  scales: AfendaLaneColorModeScale;
  title: string;
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

export const afendaLaneColorScaleSchema = z
  .object({
    border: cssColorValueSchema,
    foreground: cssColorValueSchema,
    glow: cssColorValueSchema,
    muted: cssColorValueSchema,
    "muted-foreground": cssColorValueSchema,
    solid: cssColorValueSchema,
  })
  .strict();

export const afendaLaneColorModeScaleSchema = z
  .object({
    dark: afendaLaneColorScaleSchema,
    light: afendaLaneColorScaleSchema,
  })
  .strict();

export const afendaErpVisualLaneIdSchema = z.enum(AFENDA_ERP_VISUAL_LANE_IDS);
export const afendaLaneColorScaleFieldSchema = z.enum(
  AFENDA_LANE_COLOR_SCALE_FIELDS
);

export function buildAfendaLaneScale(
  solid: string,
  hue: number,
  mode: "dark" | "light"
): AfendaLaneColorScale {
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

const AFENDA_LANE_SOLID_DEFINITIONS: Record<
  AfendaErpVisualLaneId,
  LaneSolidDefinition
> = {
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

export const AFENDA_ERP_VISUAL_LANES: readonly AfendaErpVisualLaneDefinition[] =
  AFENDA_ERP_VISUAL_LANE_IDS.map((id) => {
    const definition = AFENDA_LANE_SOLID_DEFINITIONS[id];

    return {
      id,
      title: definition.title,
      scales: {
        light: buildAfendaLaneScale(definition.light, definition.hue, "light"),
        dark: buildAfendaLaneScale(definition.dark, definition.hue, "dark"),
      },
    };
  });

export const AFENDA_ERP_VISUAL_LANE_BY_ID: Record<
  AfendaErpVisualLaneId,
  AfendaErpVisualLaneDefinition
> = Object.fromEntries(
  AFENDA_ERP_VISUAL_LANES.map((lane) => [lane.id, lane])
) as Record<AfendaErpVisualLaneId, AfendaErpVisualLaneDefinition>;

export const afendaVisualLaneRegistrySchema = z
  .object({
    colorScaleFields: z.array(afendaLaneColorScaleFieldSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_VISUAL_LANE_REGISTRY_ID),
    laneIds: z.array(afendaErpVisualLaneIdSchema).min(1).readonly(),
    lanes: z
      .array(
        z
          .object({
            id: afendaErpVisualLaneIdSchema,
            scales: afendaLaneColorModeScaleSchema,
            title: z.string().trim().min(1),
          })
          .strict()
      )
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_VISUAL_LANE_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.lanes.map((lane) => lane.id).join("|") ===
      registry.laneIds.join("|"),
    "Afenda visual lane registry lane definitions must align with lane IDs"
  );

export const afendaVisualLaneRegistry = {
  id: AFENDA_VISUAL_LANE_REGISTRY_ID,
  version: AFENDA_VISUAL_LANE_REGISTRY_VERSION,
  laneIds: AFENDA_ERP_VISUAL_LANE_IDS,
  colorScaleFields: AFENDA_LANE_COLOR_SCALE_FIELDS,
  lanes: AFENDA_ERP_VISUAL_LANES,
  governanceReferences: AFENDA_VISUAL_LANE_GOVERNANCE_REFERENCES,
} as const;

export function afendaLaneCssVarName(
  laneId: AfendaErpVisualLaneId,
  field: AfendaLaneColorScaleField
): string {
  if (field === "solid") {
    return `--lane-${laneId}`;
  }

  return `--lane-${laneId}-${field}`;
}

export function afendaActiveLaneCssVarName(
  field: AfendaLaneColorScaleField
): string {
  if (field === "solid") {
    return "--lane-active";
  }

  return `--lane-active-${field}`;
}

export function afendaTenantLaneCssVarName(
  laneId: AfendaErpVisualLaneId,
  field: AfendaLaneColorScaleField
): string {
  if (field === "solid") {
    return `--tenant-lane-${laneId}`;
  }

  return `--tenant-lane-${laneId}-${field}`;
}

export function validateAfendaVisualLaneRegistry(): void {
  afendaVisualLaneRegistrySchema.parse(afendaVisualLaneRegistry);
}

