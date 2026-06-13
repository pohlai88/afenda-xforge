import { z } from "zod";

import { defineRegistry } from "../../registry.schema";
import { resolveGeistBrandScale } from "../references/vercel-geist.contract";

export const AFENDA_THEME_PRESET_REGISTRY_ID =
  "afenda.theme-preset-registry" as const;
export const AFENDA_THEME_PRESET_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_THEME_PRESET_NAMES = defineRegistry([
  "afenda",
  "vercel-geist",
]);

export const AFENDA_THEME_BRAND_COLOR_TOKENS = defineRegistry([
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
]);

export const AFENDA_THEME_PRESET_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theming-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:quality-gate-contract",
] as const;

export type AfendaThemePresetName = (typeof AFENDA_THEME_PRESET_NAMES)[number];
export type AfendaThemeBrandColorToken =
  (typeof AFENDA_THEME_BRAND_COLOR_TOKENS)[number];
export type AfendaThemeBrandScale = Record<AfendaThemeBrandColorToken, string>;

export type AfendaThemePresetDefinition = {
  brand: {
    dark: AfendaThemeBrandScale;
    light: AfendaThemeBrandScale;
  };
  description: string;
  governanceReferences: readonly string[];
  name: AfendaThemePresetName;
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
    "Afenda theme preset color values must be OKLCH values, CSS variables, or color-mix values"
  );

export const afendaThemePresetBrandScaleSchema = z
  .object({
    accent: cssColorValueSchema,
    "accent-foreground": cssColorValueSchema,
    primary: cssColorValueSchema,
    "primary-foreground": cssColorValueSchema,
    secondary: cssColorValueSchema,
    "secondary-foreground": cssColorValueSchema,
  })
  .strict();

export const afendaThemePresetRegistryNameSchema = z.enum(
  AFENDA_THEME_PRESET_NAMES
);

export const afendaThemePresetDefinitionSchema = z
  .object({
    brand: z
      .object({
        dark: afendaThemePresetBrandScaleSchema,
        light: afendaThemePresetBrandScaleSchema,
      })
      .strict(),
    description: z.string().trim().min(1),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    name: afendaThemePresetRegistryNameSchema,
    title: z.string().trim().min(1),
  })
  .strict();

export const AFENDA_THEME_PRESET_REGISTRY: readonly AfendaThemePresetDefinition[] = [
  {
    name: "afenda",
    title: "Afenda",
    description:
      "Canonical Afenda enterprise palette: authoritative teal, quiet indigo, and restrained champagne accent.",
    governanceReferences: AFENDA_THEME_PRESET_GOVERNANCE_REFERENCES,
    brand: {
      light: {
        primary: "oklch(0.47 0.10 198)",
        "primary-foreground": "oklch(0.98 0.003 258)",
        secondary: "oklch(0.48 0.07 250)",
        "secondary-foreground": "oklch(0.98 0.003 258)",
        accent: "oklch(0.78 0.06 68)",
        "accent-foreground": "oklch(0.22 0.02 68)",
      },
      dark: {
        primary: "oklch(0.74 0.10 198)",
        "primary-foreground": "oklch(0.155 0.012 258)",
        secondary: "oklch(0.76 0.075 250)",
        "secondary-foreground": "oklch(0.155 0.012 258)",
        accent: "oklch(0.78 0.085 68)",
        "accent-foreground": "oklch(0.18 0.014 68)",
      },
    },
  },
  {
    name: "vercel-geist",
    title: "Vercel Geist",
    description:
      "Canonical Geist-aligned preset: ink-first UI, restrained link blue accent, and governed neutral surfaces.",
    governanceReferences: AFENDA_THEME_PRESET_GOVERNANCE_REFERENCES,
    brand: {
      light: resolveGeistBrandScale("light"),
      dark: resolveGeistBrandScale("dark"),
    },
  },
] as const satisfies readonly AfendaThemePresetDefinition[];

export function getAfendaThemePreset(
  name: AfendaThemePresetName
): AfendaThemePresetDefinition {
  const preset = AFENDA_THEME_PRESET_REGISTRY.find((entry) => entry.name === name);
  if (!preset) {
    throw new Error(`Unknown Afenda theme preset: ${name}`);
  }

  return preset;
}

export function validateAfendaThemePresetRegistry(): void {
  for (const preset of AFENDA_THEME_PRESET_REGISTRY) {
    afendaThemePresetDefinitionSchema.parse(preset);
  }

  const names = AFENDA_THEME_PRESET_REGISTRY.map((preset) => preset.name);
  if (new Set(names).size !== names.length) {
    throw new Error("AFENDA_THEME_PRESET_REGISTRY contains duplicate names");
  }

  if (names.join("|") !== AFENDA_THEME_PRESET_NAMES.join("|")) {
    throw new Error("AFENDA_THEME_PRESETS must align with AFENDA_THEME_PRESET_NAMES");
  }
}
