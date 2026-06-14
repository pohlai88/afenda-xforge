import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_TOKEN_UI,
  AFENDA_GOV_VERCEL_GEIST,
} from "./catalogs/governance-reference.catalog";
import { AFENDA_THEME_PRESET_NAMES } from "./registries";

export const AFENDA_GLOBALS_CSS_CONTRACT_ID =
  "afenda.globals-css-contract" as const;
export const AFENDA_GLOBALS_CSS_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_GLOBALS_CSS_OUTPUT = {
  consumerPackage: "@repo/ui",
  relativePath: "src/styles/globals.css",
} as const;

export const AFENDA_GLOBALS_CSS_COMMANDS = {
  check: "pnpm --filter @repo/design-system globals:css:check",
  generate: "pnpm --filter @repo/design-system globals:css",
  verify: "pnpm --filter @repo/design-system verify:globals-css",
} as const;

/** Theme preset whose brand fallbacks are baked into generated `:root` / `.dark` — CSS spine, not platform or tenant default authority. */
export const AFENDA_GLOBALS_CSS_BASE_THEME_PRESET = "afenda" as const;

export const AFENDA_GLOBALS_CSS_DENSITY_SELECTORS = [
  '[data-density="compact"]',
  '[data-density="comfortable"]',
] as const;

export const AFENDA_GLOBALS_CSS_PIPELINE_LAYERS = {
  compare: "src/css/adapters/globals-css.compare.ts",
  generator: "scripts/generate-globals-css.mts",
  renderer: "src/css/adapters/globals-css.render.ts",
  tokenAssembly: "src/css/tokens/css-theme.ts",
} as const;

export const AFENDA_GLOBALS_CSS_KNOWN_LIMITATIONS = [
  "Generated CSS encodes Afenda surface semantics; vercel-geist surface overrides remain runtime (Geist Studio / resolveGeistSemanticCssVars).",
  "baseThemePreset afenda supplies generated brand fallbacks only; platform default themePreset is vercel-geist and tenant default is afenda on their respective contracts.",
  "Brand tokens resolve through tenant CSS variables with afenda preset fallbacks only.",
  "Tailwind @source globs scan @repo/ui — not app or metadata-ui paths.",
] as const;

export const AFENDA_GLOBALS_CSS_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_TOKEN_UI,
  AFENDA_GOV_VERCEL_GEIST,
]);

export type AfendaGlobalsCssContract = {
  baseThemePreset: typeof AFENDA_GLOBALS_CSS_BASE_THEME_PRESET;
  commands: typeof AFENDA_GLOBALS_CSS_COMMANDS;
  densitySelectors: typeof AFENDA_GLOBALS_CSS_DENSITY_SELECTORS;
  description: string;
  governanceReferences: typeof AFENDA_GLOBALS_CSS_GOVERNANCE_REFERENCES;
  id: typeof AFENDA_GLOBALS_CSS_CONTRACT_ID;
  knownLimitations: typeof AFENDA_GLOBALS_CSS_KNOWN_LIMITATIONS;
  output: typeof AFENDA_GLOBALS_CSS_OUTPUT;
  pipelineLayers: typeof AFENDA_GLOBALS_CSS_PIPELINE_LAYERS;
  supportedThemePresets: readonly (typeof AFENDA_THEME_PRESET_NAMES)[number][];
  version: typeof AFENDA_GLOBALS_CSS_CONTRACT_VERSION;
};

export const afendaGlobalsCssContract = {
  id: AFENDA_GLOBALS_CSS_CONTRACT_ID,
  version: AFENDA_GLOBALS_CSS_CONTRACT_VERSION,
  description:
    "Authority for globals.css generation: token assembly, adapter render, and @repo/ui artifact output. baseThemePreset afenda is the generated brand fallback spine; it does not override platform (vercel-geist) or tenant (afenda) themePreset defaults.",
  output: AFENDA_GLOBALS_CSS_OUTPUT,
  commands: AFENDA_GLOBALS_CSS_COMMANDS,
  baseThemePreset: AFENDA_GLOBALS_CSS_BASE_THEME_PRESET,
  supportedThemePresets: AFENDA_THEME_PRESET_NAMES,
  densitySelectors: AFENDA_GLOBALS_CSS_DENSITY_SELECTORS,
  pipelineLayers: AFENDA_GLOBALS_CSS_PIPELINE_LAYERS,
  knownLimitations: AFENDA_GLOBALS_CSS_KNOWN_LIMITATIONS,
  governanceReferences: AFENDA_GLOBALS_CSS_GOVERNANCE_REFERENCES,
} as const satisfies AfendaGlobalsCssContract;

export const afendaGlobalsCssContractSchema = z
  .object({
    baseThemePreset: z.literal(AFENDA_GLOBALS_CSS_BASE_THEME_PRESET),
    commands: z
      .object({
        check: z.literal(AFENDA_GLOBALS_CSS_COMMANDS.check),
        generate: z.literal(AFENDA_GLOBALS_CSS_COMMANDS.generate),
        verify: z.literal(AFENDA_GLOBALS_CSS_COMMANDS.verify),
      })
      .strict(),
    densitySelectors: z
      .tuple([
        z.literal(AFENDA_GLOBALS_CSS_DENSITY_SELECTORS[0]),
        z.literal(AFENDA_GLOBALS_CSS_DENSITY_SELECTORS[1]),
      ])
      .readonly(),
    description: z.string().trim().min(1),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_GLOBALS_CSS_CONTRACT_ID),
    knownLimitations: z.array(z.string().trim().min(1)).min(1).readonly(),
    output: z
      .object({
        consumerPackage: z.literal(AFENDA_GLOBALS_CSS_OUTPUT.consumerPackage),
        relativePath: z.literal(AFENDA_GLOBALS_CSS_OUTPUT.relativePath),
      })
      .strict(),
    pipelineLayers: z
      .object({
        compare: z.literal(AFENDA_GLOBALS_CSS_PIPELINE_LAYERS.compare),
        generator: z.literal(AFENDA_GLOBALS_CSS_PIPELINE_LAYERS.generator),
        renderer: z.literal(AFENDA_GLOBALS_CSS_PIPELINE_LAYERS.renderer),
        tokenAssembly: z.literal(AFENDA_GLOBALS_CSS_PIPELINE_LAYERS.tokenAssembly),
      })
      .strict(),
    supportedThemePresets: z
      .array(z.enum(AFENDA_THEME_PRESET_NAMES))
      .length(AFENDA_THEME_PRESET_NAMES.length),
    version: z.literal(AFENDA_GLOBALS_CSS_CONTRACT_VERSION),
  })
  .strict();

export function validateAfendaGlobalsCssContract(): void {
  const contract = afendaGlobalsCssContractSchema.parse(afendaGlobalsCssContract);

  if (!contract.supportedThemePresets.includes(contract.baseThemePreset)) {
    throw new Error(
      "globals CSS base theme preset must be listed in supportedThemePresets"
    );
  }
}
