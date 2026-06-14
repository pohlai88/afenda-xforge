import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_TOUCH_LAYOUT,
  AFENDA_GOV_TYPOGRAPHY,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_DENSITY_REGISTRY_ID = "afenda.density-registry" as const;
export const AFENDA_DENSITY_REGISTRY_VERSION = "0.1.0" as const;
export const AFENDA_DENSITY_MODES = defineRegistry([
  "compact",
  "default",
  "comfortable",
]);

export const AFENDA_DENSITY_TOKEN_NAMES = defineRegistry([
  "density-control-height",
  "density-table-row-height",
]);

export const AFENDA_DENSITY_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_TOUCH_LAYOUT,
  AFENDA_GOV_TYPOGRAPHY,
  AFENDA_GOV_VISUAL_DESIGN,
  "WCAG:1.4.12",
]);

export type AfendaDensityRegistryMode = (typeof AFENDA_DENSITY_MODES)[number];
export type AfendaDensityTokenName = (typeof AFENDA_DENSITY_TOKEN_NAMES)[number];

export type AfendaDensityTokenBinding = {
  controlHeightToken: "density-control-height";
  mode: AfendaDensityRegistryMode;
  tableRowHeightToken: "density-table-row-height";
};

export const afendaDensityRegistryModeSchema = z.enum(AFENDA_DENSITY_MODES);
export const afendaDensityTokenNameSchema = z.enum(AFENDA_DENSITY_TOKEN_NAMES);

export const afendaDensityTokenBindingSchema = z
  .object({
    controlHeightToken: z.literal("density-control-height"),
    mode: afendaDensityRegistryModeSchema,
    tableRowHeightToken: z.literal("density-table-row-height"),
  })
  .strict();

export const AFENDA_DENSITY_TOKEN_BINDINGS: readonly AfendaDensityTokenBinding[] =
  AFENDA_DENSITY_MODES.map((mode) => ({
    mode,
    controlHeightToken: "density-control-height",
    tableRowHeightToken: "density-table-row-height",
  }));

export const afendaDensityRegistrySchema = z
  .object({
    bindings: z.array(afendaDensityTokenBindingSchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_DENSITY_REGISTRY_ID),
    modes: z.array(afendaDensityRegistryModeSchema).min(1).readonly(),
    tokenNames: z.array(afendaDensityTokenNameSchema).min(1).readonly(),
    version: z.literal(AFENDA_DENSITY_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.bindings.map((binding) => binding.mode).join("|") ===
      registry.modes.join("|"),
    "Afenda density token bindings must cover each density mode"
  );

export const afendaDensityRegistry = {
  id: AFENDA_DENSITY_REGISTRY_ID,
  version: AFENDA_DENSITY_REGISTRY_VERSION,
  modes: AFENDA_DENSITY_MODES,
  tokenNames: AFENDA_DENSITY_TOKEN_NAMES,
  bindings: AFENDA_DENSITY_TOKEN_BINDINGS,
  governanceReferences: AFENDA_DENSITY_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaDensityRegistry(): void {
  afendaDensityRegistrySchema.parse(afendaDensityRegistry);
}
