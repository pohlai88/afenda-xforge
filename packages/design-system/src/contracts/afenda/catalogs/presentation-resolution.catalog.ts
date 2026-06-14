import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_BADGE_VARIANTS,
  AFENDA_BUTTON_VARIANTS,
  AFENDA_CARD_VARIANTS,
  AFENDA_FIELD_VARIANTS,
  AFENDA_TABLE_VARIANTS,
  type AfendaBadgeVariant,
  type AfendaButtonVariant,
  type AfendaCardVariant,
  type AfendaFieldVariant,
  type AfendaTableVariant,
} from "../registries/component-variant.registry";
import {
  AFENDA_DENSITY_MODES,
  type AfendaDensityRegistryMode,
} from "../registries/density.registry";
import {
  AFENDA_CONTROL_SIZES,
  type AfendaControlSize,
} from "../registries/component-size.registry";
import {
  AFENDA_STATUS_TONES,
  type AfendaStatusTone,
} from "../registries/status-tone.registry";
import type { AfendaPresentationVariantFamily } from "../presentation-metadata.contract";

export const AFENDA_PRESENTATION_RESOLUTION_CATALOG_ID =
  "afenda.presentation-resolution-catalog" as const;
export const AFENDA_PRESENTATION_RESOLUTION_CATALOG_VERSION = "0.1.0" as const;

export const AFENDA_PRESENTATION_RESOLUTION_CATALOG_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    "afenda.presentation-resolution-catalog",
    "afenda.component-token-registry",
    "afenda.density-registry",
    "afenda.status-tone-registry",
    "afenda.visual-lane-registry",
  ]);

export const AFENDA_DENSITY_DATA_ATTRIBUTES: Readonly<
  Record<Exclude<AfendaDensityRegistryMode, "default">, string>
> = {
  compact: "compact",
  comfortable: "comfortable",
};

export const AFENDA_CONTROL_SIZE_TAILWIND_CLASSES: Readonly<
  Record<AfendaControlSize, readonly string[]>
> = {
  sm: ["h-8", "px-3", "text-sm"],
  md: ["h-9", "px-4", "text-sm"],
  lg: ["h-10", "px-6", "text-base"],
  icon: ["h-9", "w-9", "p-0"],
};

export const AFENDA_BUTTON_VARIANT_TAILWIND: Readonly<
  Record<AfendaButtonVariant, readonly string[]>
> = {
  default: ["bg-primary", "text-primary-foreground", "hover:bg-primary/90"],
  secondary: [
    "bg-secondary",
    "text-secondary-foreground",
    "hover:bg-secondary/80",
  ],
  outline: [
    "border",
    "border-input",
    "bg-background",
    "hover:bg-accent",
    "hover:text-accent-foreground",
  ],
  ghost: ["hover:bg-accent", "hover:text-accent-foreground"],
  link: ["text-primary", "underline-offset-4", "hover:underline"],
  destructive: [
    "bg-destructive",
    "text-destructive-foreground",
    "hover:bg-destructive/90",
  ],
  success: ["bg-success", "text-success-foreground"],
  warning: ["bg-warning", "text-warning-foreground"],
  info: ["bg-info", "text-info-foreground"],
};

export const AFENDA_BADGE_VARIANT_TAILWIND: Readonly<
  Record<AfendaBadgeVariant, readonly string[]>
> = {
  default: ["bg-primary", "text-primary-foreground"],
  secondary: ["bg-secondary", "text-secondary-foreground"],
  outline: ["border", "border-border", "text-foreground"],
  muted: ["bg-muted", "text-muted-foreground"],
  lane: [
    "bg-lane-active-muted",
    "text-lane-active-foreground",
    "border-lane-active-border",
  ],
  success: ["bg-success-muted", "text-success-muted-foreground"],
  warning: ["bg-warning-muted", "text-warning-muted-foreground"],
  destructive: ["bg-destructive-muted", "text-destructive-muted-foreground"],
  info: ["bg-info-muted", "text-info-muted-foreground"],
};

export const AFENDA_CARD_VARIANT_TAILWIND: Readonly<
  Record<AfendaCardVariant, readonly string[]>
> = {
  default: ["bg-card", "text-card-foreground", "border-border"],
  surface: ["bg-surface", "text-surface-foreground"],
  muted: ["bg-muted", "text-muted-foreground"],
  accent: ["bg-accent", "text-accent-foreground"],
  danger: ["bg-destructive-muted", "text-destructive-muted-foreground"],
};

export const AFENDA_FIELD_VARIANT_TAILWIND: Readonly<
  Record<AfendaFieldVariant, readonly string[]>
> = {
  default: ["border-input", "bg-background"],
  invalid: ["border-destructive", "ring-destructive/20"],
  readonly: ["bg-muted", "text-muted-foreground", "cursor-default"],
  disabled: ["opacity-50", "cursor-not-allowed"],
};

export const AFENDA_TABLE_VARIANT_TAILWIND: Readonly<
  Record<AfendaTableVariant, readonly string[]>
> = {
  default: ["bg-background"],
  bordered: ["border", "border-border"],
  surface: ["bg-card"],
  dense: ["row-density"],
};

export const AFENDA_STATUS_TONE_TAILWIND: Readonly<
  Record<AfendaStatusTone, readonly string[]>
> = {
  neutral: ["text-muted-foreground"],
  success: ["text-success", "bg-success-muted"],
  warning: ["text-warning", "bg-warning-muted"],
  destructive: ["text-destructive", "bg-destructive-muted"],
  info: ["text-info", "bg-info-muted"],
};

export const AFENDA_LANE_ACCENT_TAILWIND_CLASSES = [
  "text-lane-active",
  "text-lane-active-foreground",
  "text-lane-active-muted-foreground",
  "bg-lane-active",
  "bg-lane-active-muted",
  "border-lane-active-border",
  "shadow-lane-active-glow",
] as const;

export type AfendaPresentationVariantTailwindMap = {
  badge: typeof AFENDA_BADGE_VARIANT_TAILWIND;
  button: typeof AFENDA_BUTTON_VARIANT_TAILWIND;
  card: typeof AFENDA_CARD_VARIANT_TAILWIND;
  field: typeof AFENDA_FIELD_VARIANT_TAILWIND;
  table: typeof AFENDA_TABLE_VARIANT_TAILWIND;
};

export const AFENDA_PRESENTATION_VARIANT_TAILWIND_MAP: AfendaPresentationVariantTailwindMap =
  {
    button: AFENDA_BUTTON_VARIANT_TAILWIND,
    badge: AFENDA_BADGE_VARIANT_TAILWIND,
    card: AFENDA_CARD_VARIANT_TAILWIND,
    field: AFENDA_FIELD_VARIANT_TAILWIND,
    table: AFENDA_TABLE_VARIANT_TAILWIND,
  };

export function resolveVariantTailwindClasses(
  family: AfendaPresentationVariantFamily,
  variant: string
): readonly string[] {
  const map = AFENDA_PRESENTATION_VARIANT_TAILWIND_MAP[family] as Readonly<
    Record<string, readonly string[]>
  >;
  const classes = map[variant];

  if (!classes) {
    throw new Error(
      `Unknown presentation variant "${variant}" for family "${family}"`
    );
  }

  return classes;
}

export function resolveDensityDataAttribute(
  density: AfendaDensityRegistryMode
): Readonly<Record<string, string>> {
  if (density === "default") {
    return {};
  }

  return { "data-density": AFENDA_DENSITY_DATA_ATTRIBUTES[density] };
}

export const afendaPresentationResolutionCatalogSchema = z
  .object({
    densityModes: z.array(z.enum(AFENDA_DENSITY_MODES)).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_PRESENTATION_RESOLUTION_CATALOG_ID),
    statusTones: z.array(z.enum(AFENDA_STATUS_TONES)).min(1).readonly(),
    variantFamilies: z
      .array(
        z.enum(["button", "badge", "card", "field", "table"] as const)
      )
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_PRESENTATION_RESOLUTION_CATALOG_VERSION),
  })
  .strict()
  .refine(
    (catalog) =>
      catalog.variantFamilies.includes("button") &&
      catalog.statusTones.includes("destructive"),
    "Presentation resolution catalog must cover button variants and destructive tone"
  );

export const afendaPresentationResolutionCatalog = {
  id: AFENDA_PRESENTATION_RESOLUTION_CATALOG_ID,
  version: AFENDA_PRESENTATION_RESOLUTION_CATALOG_VERSION,
  densityModes: AFENDA_DENSITY_MODES,
  variantFamilies: [
    "button",
    "badge",
    "card",
    "field",
    "table",
  ] as const satisfies readonly AfendaPresentationVariantFamily[],
  statusTones: AFENDA_STATUS_TONES,
  governanceReferences:
    AFENDA_PRESENTATION_RESOLUTION_CATALOG_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaPresentationResolutionCatalog(): void {
  afendaPresentationResolutionCatalogSchema.parse(
    afendaPresentationResolutionCatalog
  );

  for (const variant of AFENDA_BUTTON_VARIANTS) {
    resolveVariantTailwindClasses("button", variant);
  }
  for (const variant of AFENDA_BADGE_VARIANTS) {
    resolveVariantTailwindClasses("badge", variant);
  }
  for (const variant of AFENDA_CARD_VARIANTS) {
    resolveVariantTailwindClasses("card", variant);
  }
  for (const variant of AFENDA_FIELD_VARIANTS) {
    resolveVariantTailwindClasses("field", variant);
  }
  for (const variant of AFENDA_TABLE_VARIANTS) {
    resolveVariantTailwindClasses("table", variant);
  }
}
