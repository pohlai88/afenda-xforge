import { z } from "zod";

import {
  defineRegistry,
  designSystemRegistryEntrySchema,
} from "../../registry.schema";

export const AFENDA_FONT_REGISTRY_ID = "afenda.font-registry" as const;
export const AFENDA_FONT_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_FONT_ROLES = defineRegistry([
  "sans",
  "mono",
  "serif",
  "heading",
]);

export const AFENDA_FONT_PRESET_NAMES = defineRegistry([
  "system-sans",
  "geist",
  "inter",
  "public-sans",
  "noto-sans",
  "manrope",
  "jetbrains-mono",
  "geist-mono",
  "noto-serif",
  "instrument-serif",
]);

export const AFENDA_FONT_PROVIDERS = ["system", "fontsource"] as const;

export const AFENDA_FONT_REGISTRY_VARIABLES = [
  "--font-heading",
  "--font-mono",
  "--font-sans",
  "--font-serif",
] as const;

export const AFENDA_FONT_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:typography-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:performance-contract",
  "AFENDA:locale-contract",
  "WCAG:1.4.4",
  "WCAG:1.4.12",
] as const;

export type AfendaFontRole = (typeof AFENDA_FONT_ROLES)[number];
export type AfendaFontPresetName = (typeof AFENDA_FONT_PRESET_NAMES)[number];
export type AfendaFontProvider = (typeof AFENDA_FONT_PROVIDERS)[number];
export type AfendaFontRegistryVariable =
  (typeof AFENDA_FONT_REGISTRY_VARIABLES)[number];

export type AfendaFontPreset = {
  cssVariable: AfendaFontRegistryVariable;
  family: string;
  governanceReferences: readonly string[];
  name: AfendaFontPresetName;
  packageName?: string;
  provider: AfendaFontProvider;
  role: AfendaFontRole;
  title: string;
};

export const afendaFontRoleSchema = z.enum(AFENDA_FONT_ROLES);
export const afendaFontPresetNameSchema = z.enum(AFENDA_FONT_PRESET_NAMES);
export const afendaFontProviderSchema = z.enum(AFENDA_FONT_PROVIDERS);
export const afendaFontRegistryVariableSchema = z.enum(
  AFENDA_FONT_REGISTRY_VARIABLES
);

export const afendaFontPresetSchema = z
  .object({
    cssVariable: afendaFontRegistryVariableSchema,
    family: z.string().trim().min(1),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    name: afendaFontPresetNameSchema,
    packageName: z.string().trim().min(1).optional(),
    provider: afendaFontProviderSchema,
    role: afendaFontRoleSchema,
    title: z.string().trim().min(1),
  })
  .strict()
  .superRefine((preset, ctx) => {
    const expectedVariable: Record<AfendaFontRole, AfendaFontRegistryVariable> = {
      heading: "--font-heading",
      mono: "--font-mono",
      sans: "--font-sans",
      serif: "--font-serif",
    };

    if (preset.cssVariable !== expectedVariable[preset.role]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${preset.name} uses ${preset.cssVariable} for ${preset.role}`,
        path: ["cssVariable"],
      });
    }

    if (preset.provider === "fontsource" && !preset.packageName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${preset.name} requires a fontsource packageName`,
        path: ["packageName"],
      });
    }
  });

export const AFENDA_FONT_PRESETS: readonly AfendaFontPreset[] = [
  {
    name: "system-sans",
    title: "System Sans",
    role: "sans",
    family: "ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "system",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "geist",
    title: "Geist",
    role: "sans",
    family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/geist",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "inter",
    title: "Inter",
    role: "sans",
    family: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/inter",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "public-sans",
    title: "Public Sans",
    role: "sans",
    family: "'Public Sans Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/public-sans",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    role: "sans",
    family: "'Noto Sans Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/noto-sans",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "manrope",
    title: "Manrope",
    role: "heading",
    family: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-heading",
    provider: "fontsource",
    packageName: "@fontsource-variable/manrope",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    role: "mono",
    family: "'JetBrains Mono Variable', ui-monospace, monospace",
    cssVariable: "--font-mono",
    provider: "fontsource",
    packageName: "@fontsource-variable/jetbrains-mono",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    role: "mono",
    family: "'Geist Mono Variable', ui-monospace, monospace",
    cssVariable: "--font-mono",
    provider: "fontsource",
    packageName: "@fontsource-variable/geist-mono",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    role: "serif",
    family: "'Noto Serif Variable', ui-serif, Georgia, serif",
    cssVariable: "--font-serif",
    provider: "fontsource",
    packageName: "@fontsource-variable/noto-serif",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    role: "serif",
    family: "'Instrument Serif', ui-serif, Georgia, serif",
    cssVariable: "--font-serif",
    provider: "fontsource",
    packageName: "@fontsource/instrument-serif",
    governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
  },
] as const satisfies readonly AfendaFontPreset[];

export const afendaFontRegistrySchema = z
  .object({
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_FONT_REGISTRY_ID),
    presetNames: z.array(afendaFontPresetNameSchema).min(1).readonly(),
    presets: z.array(afendaFontPresetSchema).min(1).readonly(),
    roles: z.array(afendaFontRoleSchema).min(1).readonly(),
    variables: z.array(afendaFontRegistryVariableSchema).min(1).readonly(),
    version: z.literal(AFENDA_FONT_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.presets.map((preset) => preset.name).join("|") ===
      registry.presetNames.join("|"),
    "Afenda font preset names must align with preset definitions"
  );

export const afendaFontRegistry = {
  id: AFENDA_FONT_REGISTRY_ID,
  version: AFENDA_FONT_REGISTRY_VERSION,
  roles: AFENDA_FONT_ROLES,
  presetNames: AFENDA_FONT_PRESET_NAMES,
  presets: AFENDA_FONT_PRESETS,
  variables: AFENDA_FONT_REGISTRY_VARIABLES,
  governanceReferences: AFENDA_FONT_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaFontRegistry(): void {
  afendaFontRegistrySchema.parse(afendaFontRegistry);

  for (const preset of AFENDA_FONT_PRESETS) {
    afendaFontPresetSchema.parse(preset);
    designSystemRegistryEntrySchema.parse(preset.name);
  }

  const names = AFENDA_FONT_PRESETS.map((preset) => preset.name);
  if (new Set(names).size !== names.length) {
    throw new Error("AFENDA_FONT_PRESETS contains duplicate names");
  }
}

export const AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_ID =
  "afenda.typography-token-registry" as const;
export const AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_TYPE_SCALE_ROLES = defineRegistry([
  "read",
  "head",
  "caption",
  "micro",
  "label",
]);

export const AFENDA_TYPE_UTILITY_TOKENS = defineRegistry([
  "type-read",
  "type-head",
  "type-caption",
  "type-micro",
  "type-label",
]);

export const AFENDA_FONT_FEATURE_TOKENS = defineRegistry([
  "rlig",
  "calt",
  "tnum",
]);

export const AFENDA_TEXT_UTILITY_TOKENS = defineRegistry(["text-tabular"]);

export const AFENDA_TYPOGRAPHY_TOKEN_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:typography-contract",
  "AFENDA:content-contract",
  "AFENDA:locale-contract",
  "WCAG:1.4.4",
  "WCAG:1.4.12",
] as const;

export type AfendaTypeScaleRole = (typeof AFENDA_TYPE_SCALE_ROLES)[number];
export type AfendaTypeUtilityToken =
  (typeof AFENDA_TYPE_UTILITY_TOKENS)[number];
export type AfendaFontFeatureToken =
  (typeof AFENDA_FONT_FEATURE_TOKENS)[number];
export type AfendaTextUtilityToken =
  (typeof AFENDA_TEXT_UTILITY_TOKENS)[number];

export const afendaTypeScaleRoleSchema = z.enum(AFENDA_TYPE_SCALE_ROLES);
export const afendaTypeUtilityTokenSchema = z.enum(AFENDA_TYPE_UTILITY_TOKENS);
export const afendaFontFeatureTokenSchema = z.enum(AFENDA_FONT_FEATURE_TOKENS);
export const afendaTextUtilityTokenSchema = z.enum(AFENDA_TEXT_UTILITY_TOKENS);

export const afendaTypographyTokenRegistrySchema = z
  .object({
    fontFeatureTokens: z
      .array(afendaFontFeatureTokenSchema)
      .min(1)
      .readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_ID),
    textUtilityTokens: z
      .array(afendaTextUtilityTokenSchema)
      .min(1)
      .readonly(),
    typeScaleRoles: z.array(afendaTypeScaleRoleSchema).min(1).readonly(),
    typeUtilityTokens: z.array(afendaTypeUtilityTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.typeUtilityTokens.join("|") ===
        registry.typeScaleRoles.map((role) => `type-${role}`).join("|") &&
      registry.fontFeatureTokens.includes("rlig") &&
      registry.fontFeatureTokens.includes("calt") &&
      registry.textUtilityTokens.includes("text-tabular"),
    "Afenda typography token registry must preserve the governed role, utility, and font feature vocabulary"
  );

export const afendaTypographyTokenRegistry = {
  id: AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_ID,
  version: AFENDA_TYPOGRAPHY_TOKEN_REGISTRY_VERSION,
  typeScaleRoles: AFENDA_TYPE_SCALE_ROLES,
  typeUtilityTokens: AFENDA_TYPE_UTILITY_TOKENS,
  fontFeatureTokens: AFENDA_FONT_FEATURE_TOKENS,
  textUtilityTokens: AFENDA_TEXT_UTILITY_TOKENS,
  governanceReferences: AFENDA_TYPOGRAPHY_TOKEN_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaTypographyTokenRegistry(): void {
  afendaTypographyTokenRegistrySchema.parse(afendaTypographyTokenRegistry);
}
