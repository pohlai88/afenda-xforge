import { z } from "zod";

import {
  defineRegistry,
  designSystemRegistryEntrySchema,
} from "./registry.schema";

export const FONT_ROLES = defineRegistry(["sans", "mono", "serif", "heading"]);

export const FONT_PRESET_NAMES = defineRegistry([
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

export type FontRole = (typeof FONT_ROLES)[number];
export type FontPresetName = (typeof FONT_PRESET_NAMES)[number];
export type FontProvider = "system" | "fontsource";
export type FontRegistryVariable =
  | "--font-heading"
  | "--font-mono"
  | "--font-sans"
  | "--font-serif";

export type FontPreset = {
  cssVariable: FontRegistryVariable;
  family: string;
  name: FontPresetName;
  packageName?: string;
  provider: FontProvider;
  role: FontRole;
  title: string;
};

export const fontRoleSchema = z.enum(FONT_ROLES);
export const fontPresetNameSchema = z.enum(FONT_PRESET_NAMES);
export const fontProviderSchema = z.enum(["system", "fontsource"]);
export const fontRegistryVariableSchema = z.enum([
  "--font-heading",
  "--font-mono",
  "--font-sans",
  "--font-serif",
]);

export const fontPresetSchema = z
  .object({
    cssVariable: fontRegistryVariableSchema,
    family: z.string().trim().min(1),
    name: fontPresetNameSchema,
    packageName: z.string().trim().min(1).optional(),
    provider: fontProviderSchema,
    role: fontRoleSchema,
    title: z.string().trim().min(1),
  })
  .strict()
  .superRefine((preset, ctx) => {
    const expectedVariable: Record<FontRole, FontRegistryVariable> = {
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

export const FONT_PRESETS: readonly FontPreset[] = [
  {
    name: "system-sans",
    title: "System Sans",
    role: "sans",
    family: "ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "system",
  },
  {
    name: "geist",
    title: "Geist",
    role: "sans",
    family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/geist",
  },
  {
    name: "inter",
    title: "Inter",
    role: "sans",
    family: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/inter",
  },
  {
    name: "public-sans",
    title: "Public Sans",
    role: "sans",
    family: "'Public Sans Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/public-sans",
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    role: "sans",
    family: "'Noto Sans Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-sans",
    provider: "fontsource",
    packageName: "@fontsource-variable/noto-sans",
  },
  {
    name: "manrope",
    title: "Manrope",
    role: "heading",
    family: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif",
    cssVariable: "--font-heading",
    provider: "fontsource",
    packageName: "@fontsource-variable/manrope",
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    role: "mono",
    family: "'JetBrains Mono Variable', ui-monospace, monospace",
    cssVariable: "--font-mono",
    provider: "fontsource",
    packageName: "@fontsource-variable/jetbrains-mono",
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    role: "mono",
    family: "'Geist Mono Variable', ui-monospace, monospace",
    cssVariable: "--font-mono",
    provider: "fontsource",
    packageName: "@fontsource-variable/geist-mono",
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    role: "serif",
    family: "'Noto Serif Variable', ui-serif, Georgia, serif",
    cssVariable: "--font-serif",
    provider: "fontsource",
    packageName: "@fontsource-variable/noto-serif",
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    role: "serif",
    family: "'Instrument Serif', ui-serif, Georgia, serif",
    cssVariable: "--font-serif",
    provider: "fontsource",
    packageName: "@fontsource/instrument-serif",
  },
] as const satisfies readonly FontPreset[];

export function validateFontPresetRegistry(): void {
  for (const preset of FONT_PRESETS) {
    fontPresetSchema.parse(preset);
    designSystemRegistryEntrySchema.parse(preset.name);
  }
}
