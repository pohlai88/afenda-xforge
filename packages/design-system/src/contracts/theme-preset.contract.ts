import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const THEME_PRESET_NAMES = defineRegistry([
  "xforge",
  "teal",
  "indigo",
  "emerald",
  "amber",
  "rose",
]);

export const THEME_BRAND_COLOR_TOKENS = defineRegistry([
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
]);

export type ThemePresetName = (typeof THEME_PRESET_NAMES)[number];
export type ThemeBrandColorToken = (typeof THEME_BRAND_COLOR_TOKENS)[number];
export type ThemeBrandScale = Record<ThemeBrandColorToken, string>;

export type ThemePreset = {
  brand: {
    dark: ThemeBrandScale;
    light: ThemeBrandScale;
  };
  description: string;
  name: ThemePresetName;
  title: string;
};

const cssColorValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => value.startsWith("oklch(") || value.startsWith("var("),
    "Theme preset color values must be OKLCH values or CSS variables"
  );

export const themeBrandScaleSchema = z
  .object({
    accent: cssColorValueSchema,
    "accent-foreground": cssColorValueSchema,
    primary: cssColorValueSchema,
    "primary-foreground": cssColorValueSchema,
    secondary: cssColorValueSchema,
    "secondary-foreground": cssColorValueSchema,
  })
  .strict();

export const themePresetNameSchema = z.enum(THEME_PRESET_NAMES);
export const themePresetSchema = z
  .object({
    brand: z
      .object({
        dark: themeBrandScaleSchema,
        light: themeBrandScaleSchema,
      })
      .strict(),
    description: z.string().trim().min(1),
    name: themePresetNameSchema,
    title: z.string().trim().min(1),
  })
  .strict();

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    name: "xforge",
    title: "XForge",
    description:
      "Editorial enterprise palette — authoritative teal, quiet indigo, champagne accent.",
    brand: {
      light: {
        primary: "oklch(0.47 0.10 198)",
        "primary-foreground": "oklch(0.98 0.003 258)",
        secondary: "oklch(0.48 0.07 250)",
        "secondary-foreground": "oklch(0.98 0.003 258)",
        accent: "oklch(0.65 0.08 68)",
        "accent-foreground": "oklch(0.22 0.02 68)",
      },
      dark: {
        primary: "oklch(0.70 0.10 198)",
        "primary-foreground": "oklch(0.155 0.012 258)",
        secondary: "oklch(0.72 0.075 250)",
        "secondary-foreground": "oklch(0.155 0.012 258)",
        accent: "oklch(0.78 0.085 68)",
        "accent-foreground": "oklch(0.18 0.014 68)",
      },
    },
  },
  {
    name: "teal",
    title: "Teal",
    description: "Operational palette for calm, dense workflow interfaces.",
    brand: {
      light: {
        primary: "oklch(0.52 0.112 190)",
        "primary-foreground": "oklch(0.985 0.004 258)",
        secondary: "oklch(0.56 0.07 165)",
        "secondary-foreground": "oklch(0.985 0.004 258)",
        accent: "oklch(0.67 0.1 92)",
        "accent-foreground": "oklch(0.18 0.02 92)",
      },
      dark: {
        primary: "oklch(0.72 0.105 190)",
        "primary-foreground": "oklch(0.17 0.014 264)",
        secondary: "oklch(0.76 0.095 165)",
        "secondary-foreground": "oklch(0.17 0.014 264)",
        accent: "oklch(0.8 0.105 92)",
        "accent-foreground": "oklch(0.18 0.014 92)",
      },
    },
  },
  {
    name: "indigo",
    title: "Indigo",
    description: "Executive palette for analytics and approval surfaces.",
    brand: {
      light: {
        primary: "oklch(0.49 0.14 265)",
        "primary-foreground": "oklch(0.985 0.004 258)",
        secondary: "oklch(0.55 0.09 215)",
        "secondary-foreground": "oklch(0.985 0.004 258)",
        accent: "oklch(0.66 0.12 310)",
        "accent-foreground": "oklch(0.985 0.004 258)",
      },
      dark: {
        primary: "oklch(0.72 0.11 265)",
        "primary-foreground": "oklch(0.17 0.014 264)",
        secondary: "oklch(0.76 0.085 215)",
        "secondary-foreground": "oklch(0.17 0.014 264)",
        accent: "oklch(0.78 0.105 310)",
        "accent-foreground": "oklch(0.17 0.014 264)",
      },
    },
  },
  {
    name: "emerald",
    title: "Emerald",
    description: "Finance and growth palette with strong positive status fit.",
    brand: {
      light: {
        primary: "oklch(0.49 0.13 158)",
        "primary-foreground": "oklch(0.985 0.004 258)",
        secondary: "oklch(0.58 0.085 185)",
        "secondary-foreground": "oklch(0.985 0.004 258)",
        accent: "oklch(0.7 0.115 78)",
        "accent-foreground": "oklch(0.18 0.02 78)",
      },
      dark: {
        primary: "oklch(0.72 0.12 158)",
        "primary-foreground": "oklch(0.17 0.014 264)",
        secondary: "oklch(0.76 0.09 185)",
        "secondary-foreground": "oklch(0.17 0.014 264)",
        accent: "oklch(0.82 0.105 78)",
        "accent-foreground": "oklch(0.18 0.014 78)",
      },
    },
  },
  {
    name: "amber",
    title: "Amber",
    description: "Supply-chain palette for review, exception, and planning UI.",
    brand: {
      light: {
        primary: "oklch(0.6 0.12 70)",
        "primary-foreground": "oklch(0.18 0.02 70)",
        secondary: "oklch(0.53 0.08 160)",
        "secondary-foreground": "oklch(0.985 0.004 258)",
        accent: "oklch(0.58 0.12 40)",
        "accent-foreground": "oklch(0.985 0.004 258)",
      },
      dark: {
        primary: "oklch(0.78 0.11 70)",
        "primary-foreground": "oklch(0.18 0.014 70)",
        secondary: "oklch(0.74 0.085 160)",
        "secondary-foreground": "oklch(0.17 0.014 264)",
        accent: "oklch(0.75 0.115 40)",
        "accent-foreground": "oklch(0.17 0.014 264)",
      },
    },
  },
  {
    name: "rose",
    title: "Rose",
    description: "People and service palette for HR, CRM, and support modules.",
    brand: {
      light: {
        primary: "oklch(0.52 0.14 12)",
        "primary-foreground": "oklch(0.985 0.004 258)",
        secondary: "oklch(0.54 0.075 250)",
        "secondary-foreground": "oklch(0.985 0.004 258)",
        accent: "oklch(0.66 0.12 330)",
        "accent-foreground": "oklch(0.985 0.004 258)",
      },
      dark: {
        primary: "oklch(0.72 0.12 12)",
        "primary-foreground": "oklch(0.17 0.014 264)",
        secondary: "oklch(0.76 0.08 250)",
        "secondary-foreground": "oklch(0.17 0.014 264)",
        accent: "oklch(0.78 0.105 330)",
        "accent-foreground": "oklch(0.17 0.014 264)",
      },
    },
  },
] as const satisfies readonly ThemePreset[];

export function validateThemePresetRegistry(): void {
  for (const preset of THEME_PRESETS) {
    themePresetSchema.parse(preset);
  }
}
