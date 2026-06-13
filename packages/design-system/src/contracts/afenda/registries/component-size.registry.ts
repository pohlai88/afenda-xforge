import { z } from "zod";

import { defineRegistry } from "../../registry.schema";
import { AFENDA_DENSITY_MODES } from "./dimension-token.registry";

export const AFENDA_COMPONENT_SIZE_REGISTRY_ID =
  "afenda.component-size-registry" as const;
export const AFENDA_COMPONENT_SIZE_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_COMPONENT_SIZES = defineRegistry([
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
]);

export const AFENDA_CONTROL_SIZES = defineRegistry([
  "sm",
  "md",
  "lg",
  "icon",
]);

export const AFENDA_TABLE_SIZES: typeof AFENDA_DENSITY_MODES =
  AFENDA_DENSITY_MODES;

export const AFENDA_COMPONENT_SIZE_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:density-registry",
  "AFENDA:layout-contract",
  "AFENDA:touch-layout-contract",
  "AFENDA:forms-contract",
  "AFENDA:component-variant-contract",
] as const;

export type AfendaComponentSize = (typeof AFENDA_COMPONENT_SIZES)[number];
export type AfendaControlSize = (typeof AFENDA_CONTROL_SIZES)[number];
export type AfendaTableSize = (typeof AFENDA_TABLE_SIZES)[number];

export const afendaComponentSizeSchema = z.enum(AFENDA_COMPONENT_SIZES);
export const afendaControlSizeSchema = z.enum(AFENDA_CONTROL_SIZES);
export const afendaTableSizeSchema = z.enum(AFENDA_TABLE_SIZES);

export const afendaComponentSizeRegistrySchema = z
  .object({
    componentSizes: z.array(afendaComponentSizeSchema).min(1).readonly(),
    controlSizes: z.array(afendaControlSizeSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_COMPONENT_SIZE_REGISTRY_ID),
    tableSizes: z.array(afendaTableSizeSchema).min(1).readonly(),
    version: z.literal(AFENDA_COMPONENT_SIZE_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.controlSizes.includes("icon") &&
      registry.tableSizes.join("|") === AFENDA_DENSITY_MODES.join("|"),
    "Afenda component size registry must include icon controls and density-aligned table sizes"
  );

export const afendaComponentSizeRegistry = {
  id: AFENDA_COMPONENT_SIZE_REGISTRY_ID,
  version: AFENDA_COMPONENT_SIZE_REGISTRY_VERSION,
  componentSizes: AFENDA_COMPONENT_SIZES,
  controlSizes: AFENDA_CONTROL_SIZES,
  tableSizes: AFENDA_TABLE_SIZES,
  governanceReferences: AFENDA_COMPONENT_SIZE_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaComponentSizeRegistry(): void {
  afendaComponentSizeRegistrySchema.parse(afendaComponentSizeRegistry);
}
