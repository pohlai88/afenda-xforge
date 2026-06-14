import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_HUE_RESERVATION,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";
import { AFENDA_COLOR_MODES, type AfendaColorMode } from "../design-system.contract";

export const AFENDA_PRIMITIVE_COLOR_REGISTRY_ID =
  "afenda.primitive-color-registry" as const;
export const AFENDA_PRIMITIVE_COLOR_REGISTRY_VERSION = "0.1.0" as const;

/** Layer-1 neutral ramp — warm-tinted OKLCH, hue aligned to semantic surfaces. */
export const AFENDA_NEUTRAL_RAMP_STEPS = defineRegistry([
  "gray-50",
  "gray-100",
  "gray-200",
  "gray-300",
  "gray-400",
  "gray-500",
  "gray-600",
  "gray-700",
  "gray-800",
  "gray-900",
  "gray-950",
]);

export const AFENDA_ACCENT_HUE_SLOTS = defineRegistry([
  "brand-primary",
  "brand-secondary",
  "brand-accent",
]);

export const AFENDA_PRIMITIVE_COLOR_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_HUE_RESERVATION,
]);

const NEUTRAL_HUE = 258 as const;

export const AFENDA_NEUTRAL_RAMP_VALUES: Readonly<
  Record<(typeof AFENDA_NEUTRAL_RAMP_STEPS)[number], string>
> = {
  "gray-50": `oklch(0.985 0.003 ${NEUTRAL_HUE})`,
  "gray-100": `oklch(0.965 0.006 ${NEUTRAL_HUE})`,
  "gray-200": `oklch(0.905 0.010 ${NEUTRAL_HUE})`,
  "gray-300": `oklch(0.82 0.012 ${NEUTRAL_HUE})`,
  "gray-400": `oklch(0.70 0.016 ${NEUTRAL_HUE})`,
  "gray-500": `oklch(0.58 0.016 ${NEUTRAL_HUE})`,
  "gray-600": `oklch(0.46 0.015 ${NEUTRAL_HUE})`,
  "gray-700": `oklch(0.36 0.013 ${NEUTRAL_HUE})`,
  "gray-800": `oklch(0.26 0.010 ${NEUTRAL_HUE})`,
  "gray-900": `oklch(0.20 0.015 ${NEUTRAL_HUE})`,
  "gray-950": `oklch(0.155 0.012 ${NEUTRAL_HUE})`,
};

/** DS-006 brand hue slots — keep aligned with hue-reservation.contract.ts */
export const AFENDA_ACCENT_HUE_SLOT_VALUES: Readonly<
  Record<(typeof AFENDA_ACCENT_HUE_SLOTS)[number], number>
> = {
  "brand-primary": 198,
  "brand-secondary": 250,
  "brand-accent": 68,
};

export type AfendaSurfaceNeutralValues = {
  readonly accent: string;
  readonly accentForeground: string;
  readonly background: string;
  readonly border: string;
  readonly card: string;
  readonly cardForeground: string;
  readonly elevationMd: string;
  readonly elevationSm: string;
  readonly elevationXs: string;
  readonly foreground: string;
  readonly input: string;
  readonly muted: string;
  readonly mutedForeground: string;
  readonly popover: string;
  readonly popoverForeground: string;
  readonly ring: string;
  readonly secondary: string;
  readonly secondaryForeground: string;
  readonly surface: string;
  readonly surfaceAccent: string;
  readonly surfaceForeground: string;
  readonly surfaceMuted: string;
};

export const AFENDA_SURFACE_NEUTRAL_VALUES: Readonly<
  Record<AfendaColorMode, AfendaSurfaceNeutralValues>
> = {
  light: {
    background: AFENDA_NEUTRAL_RAMP_VALUES["gray-50"],
    foreground: AFENDA_NEUTRAL_RAMP_VALUES["gray-900"],
    card: "oklch(0.995 0.002 258)",
    cardForeground: AFENDA_NEUTRAL_RAMP_VALUES["gray-900"],
    popover: "oklch(0.995 0.002 258)",
    popoverForeground: AFENDA_NEUTRAL_RAMP_VALUES["gray-900"],
    surface: "oklch(0.988 0.004 258)",
    surfaceForeground: "oklch(0.22 0.016 258)",
    surfaceMuted: AFENDA_NEUTRAL_RAMP_VALUES["gray-100"],
    surfaceAccent: "oklch(0.948 0.012 198)",
    secondary: "oklch(0.955 0.008 258)",
    secondaryForeground: "oklch(0.28 0.018 258)",
    muted: "oklch(0.944 0.006 258)",
    mutedForeground: "oklch(0.45 0.020 258)",
    accent: "oklch(0.952 0.012 198)",
    accentForeground: "oklch(0.22 0.025 198)",
    border: AFENDA_NEUTRAL_RAMP_VALUES["gray-200"],
    input: AFENDA_NEUTRAL_RAMP_VALUES["gray-200"],
    ring: "oklch(0.50 0.018 258)",
    elevationXs: "0 1px 1px oklch(0.1 0.01 260 / 0.05)",
    elevationSm: "0 1px 2px oklch(0.1 0.01 260 / 0.07)",
    elevationMd: "0 10px 28px oklch(0.1 0.01 260 / 0.08)",
  },
  dark: {
    background: AFENDA_NEUTRAL_RAMP_VALUES["gray-950"],
    foreground: "oklch(0.935 0.006 258)",
    card: "oklch(0.195 0.013 258)",
    cardForeground: "oklch(0.935 0.006 258)",
    popover: "oklch(0.195 0.013 258)",
    popoverForeground: "oklch(0.935 0.006 258)",
    surface: "oklch(0.205 0.013 258)",
    surfaceForeground: "oklch(0.92 0.006 258)",
    surfaceMuted: "oklch(0.255 0.013 258)",
    surfaceAccent: "oklch(0.28 0.022 198)",
    secondary: "oklch(0.26 0.014 258)",
    secondaryForeground: "oklch(0.935 0.006 258)",
    muted: "oklch(0.25 0.013 258)",
    mutedForeground: "oklch(0.77 0.012 258)",
    accent: "oklch(0.28 0.020 198)",
    accentForeground: "oklch(0.935 0.006 258)",
    border: "oklch(0.30 0.014 258)",
    input: "oklch(0.30 0.014 258)",
    ring: "oklch(0.68 0.015 258)",
    elevationXs: "0 1px 1px oklch(0 0 0 / 0.2)",
    elevationSm: "0 1px 2px oklch(0 0 0 / 0.24)",
    elevationMd: "0 18px 48px oklch(0 0 0 / 0.26)",
  },
};

const oklchValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("oklch("), "Primitive colors must use OKLCH");

export const afendaPrimitiveColorRegistrySchema = z
  .object({
    accentHueSlots: z.array(z.enum(AFENDA_ACCENT_HUE_SLOTS)).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_PRIMITIVE_COLOR_REGISTRY_ID),
    neutralRampSteps: z.array(z.enum(AFENDA_NEUTRAL_RAMP_STEPS)).min(1).readonly(),
    version: z.literal(AFENDA_PRIMITIVE_COLOR_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.neutralRampSteps.includes("gray-50") &&
      registry.neutralRampSteps.includes("gray-950"),
    "Afenda primitive color registry must span the full neutral ramp"
  );

export const afendaPrimitiveColorRegistry = {
  id: AFENDA_PRIMITIVE_COLOR_REGISTRY_ID,
  version: AFENDA_PRIMITIVE_COLOR_REGISTRY_VERSION,
  neutralRampSteps: AFENDA_NEUTRAL_RAMP_STEPS,
  accentHueSlots: AFENDA_ACCENT_HUE_SLOTS,
  governanceReferences: AFENDA_PRIMITIVE_COLOR_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaPrimitiveColorRegistry(): void {
  afendaPrimitiveColorRegistrySchema.parse(afendaPrimitiveColorRegistry);

  for (const step of AFENDA_NEUTRAL_RAMP_STEPS) {
    oklchValueSchema.parse(AFENDA_NEUTRAL_RAMP_VALUES[step]);
  }

  for (const mode of AFENDA_COLOR_MODES) {
    const values = AFENDA_SURFACE_NEUTRAL_VALUES[mode];
    for (const value of Object.values(values)) {
      if (value.startsWith("oklch(")) {
        oklchValueSchema.parse(value);
      }
    }
  }
}
