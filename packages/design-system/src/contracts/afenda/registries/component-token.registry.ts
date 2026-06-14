import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_COMPONENT_VARIANT_REGISTRY,
  AFENDA_GOV_DENSITY_REGISTRY,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_LAYOUT,
} from "../catalogs/governance-reference.catalog";
import {
  AFENDA_DENSITY_MODES,
  type AfendaDensityRegistryMode,
} from "./density.registry";
import {
  AFENDA_CONTROL_SIZES,
  type AfendaControlSize,
} from "./component-size.registry";

export const AFENDA_COMPONENT_TOKEN_REGISTRY_ID =
  "afenda.component-token-registry" as const;
export const AFENDA_COMPONENT_TOKEN_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_COMPONENT_TOKEN_FAMILIES = defineRegistry([
  "button",
  "badge",
  "card",
  "field",
  "table",
]);

export const AFENDA_COMPONENT_TOKEN_PROPERTIES = defineRegistry([
  "control-height",
  "table-row-height",
  "radius-control",
  "radius-panel",
  "padding",
]);

export const AFENDA_COMPONENT_TOKEN_RESOLVE_SOURCES = defineRegistry([
  "density",
  "size",
  "static",
]);

export const AFENDA_COMPONENT_TOKEN_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_DENSITY_REGISTRY,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_COMPONENT_VARIANT_REGISTRY,
]);

export type AfendaComponentTokenFamily =
  (typeof AFENDA_COMPONENT_TOKEN_FAMILIES)[number];
export type AfendaComponentTokenProperty =
  (typeof AFENDA_COMPONENT_TOKEN_PROPERTIES)[number];
export type AfendaComponentTokenResolveSource =
  (typeof AFENDA_COMPONENT_TOKEN_RESOLVE_SOURCES)[number];

export type AfendaComponentTokenBinding = {
  cssVariable: `--${string}`;
  densityMode?: AfendaDensityRegistryMode;
  family: AfendaComponentTokenFamily;
  property: AfendaComponentTokenProperty;
  resolveFrom: AfendaComponentTokenResolveSource;
  size?: AfendaControlSize;
};

export const AFENDA_COMPONENT_TOKEN_BINDINGS: readonly AfendaComponentTokenBinding[] =
  [
    {
      family: "button",
      property: "control-height",
      cssVariable: "--density-control-height",
      resolveFrom: "density",
    },
    {
      family: "field",
      property: "control-height",
      cssVariable: "--density-control-height",
      resolveFrom: "density",
    },
    {
      family: "badge",
      property: "control-height",
      cssVariable: "--density-control-height",
      resolveFrom: "density",
    },
    {
      family: "table",
      property: "table-row-height",
      cssVariable: "--density-table-row-height",
      resolveFrom: "density",
    },
    {
      family: "button",
      property: "radius-control",
      cssVariable: "--radius-control",
      resolveFrom: "density",
      densityMode: "compact",
    },
    {
      family: "field",
      property: "radius-control",
      cssVariable: "--radius-control",
      resolveFrom: "static",
    },
    {
      family: "button",
      property: "radius-control",
      cssVariable: "--radius-control",
      resolveFrom: "static",
    },
    {
      family: "card",
      property: "radius-panel",
      cssVariable: "--radius-panel",
      resolveFrom: "static",
    },
    {
      family: "table",
      property: "radius-panel",
      cssVariable: "--radius-panel",
      resolveFrom: "static",
    },
  ] as const;

export const afendaComponentTokenFamilySchema = z.enum(
  AFENDA_COMPONENT_TOKEN_FAMILIES
);
export const afendaComponentTokenPropertySchema = z.enum(
  AFENDA_COMPONENT_TOKEN_PROPERTIES
);
export const afendaComponentTokenResolveSourceSchema = z.enum(
  AFENDA_COMPONENT_TOKEN_RESOLVE_SOURCES
);

export const afendaComponentTokenBindingSchema = z
  .object({
    cssVariable: z
      .string()
      .regex(/^--[a-z0-9-]+$/, "Component token CSS variables must be kebab-case"),
    densityMode: z.enum(AFENDA_DENSITY_MODES).optional(),
    family: afendaComponentTokenFamilySchema,
    property: afendaComponentTokenPropertySchema,
    resolveFrom: afendaComponentTokenResolveSourceSchema,
    size: z.enum(AFENDA_CONTROL_SIZES).optional(),
  })
  .strict();

export const afendaComponentTokenRegistrySchema = z
  .object({
    bindings: z.array(afendaComponentTokenBindingSchema).min(1).readonly(),
    families: z.array(afendaComponentTokenFamilySchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_COMPONENT_TOKEN_REGISTRY_ID),
    properties: z.array(afendaComponentTokenPropertySchema).min(1).readonly(),
    resolveSources: z
      .array(afendaComponentTokenResolveSourceSchema)
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_COMPONENT_TOKEN_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.families.includes("button") &&
      registry.families.includes("table") &&
      registry.bindings.some(
        (binding) =>
          binding.family === "table" &&
          binding.property === "table-row-height"
      ),
    "Afenda component token registry must bind table row height and button families"
  );

export const afendaComponentTokenRegistry = {
  id: AFENDA_COMPONENT_TOKEN_REGISTRY_ID,
  version: AFENDA_COMPONENT_TOKEN_REGISTRY_VERSION,
  families: AFENDA_COMPONENT_TOKEN_FAMILIES,
  properties: AFENDA_COMPONENT_TOKEN_PROPERTIES,
  resolveSources: AFENDA_COMPONENT_TOKEN_RESOLVE_SOURCES,
  bindings: AFENDA_COMPONENT_TOKEN_BINDINGS,
  governanceReferences: AFENDA_COMPONENT_TOKEN_GOVERNANCE_REFERENCES,
} as const;

export function getAfendaComponentTokenBindingsForFamily(
  family: AfendaComponentTokenFamily
): readonly AfendaComponentTokenBinding[] {
  return AFENDA_COMPONENT_TOKEN_BINDINGS.filter(
    (binding) => binding.family === family
  );
}

export function validateAfendaComponentTokenRegistry(): void {
  afendaComponentTokenRegistrySchema.parse(afendaComponentTokenRegistry);
}
