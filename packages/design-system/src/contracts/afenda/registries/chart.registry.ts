import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_CONTENT,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_HUE_RESERVATION,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

export const AFENDA_CHART_REGISTRY_ID = "afenda.chart-registry" as const;
export const AFENDA_CHART_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_CHART_COLOR_TOKENS = defineRegistry([
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
]);

export type AfendaChartColorToken = (typeof AFENDA_CHART_COLOR_TOKENS)[number];

export const AFENDA_CHART_HUES = {
  "chart-1": 198,
  "chart-2": 250,
  "chart-3": 160,
  "chart-4": 68,
  "chart-5": 285,
  "chart-6": 212,
  "chart-7": 330,
} as const satisfies Record<AfendaChartColorToken, number>;

export const AFENDA_CHART_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_CONTENT,
  AFENDA_GOV_HUE_RESERVATION,
  "WCAG:1.4.1",
]);

export const afendaChartColorTokenSchema = z.enum(AFENDA_CHART_COLOR_TOKENS);

export const afendaChartRegistrySchema = z
  .object({
    colorTokens: z.array(afendaChartColorTokenSchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    hues: z.record(afendaChartColorTokenSchema, z.number().min(0).max(360)),
    id: z.literal(AFENDA_CHART_REGISTRY_ID),
    version: z.literal(AFENDA_CHART_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.colorTokens.every((token) =>
        Object.prototype.hasOwnProperty.call(registry.hues, token)
      ),
    "Afenda chart registry must define a hue for every chart color token"
  );

export const afendaChartRegistry = {
  id: AFENDA_CHART_REGISTRY_ID,
  version: AFENDA_CHART_REGISTRY_VERSION,
  colorTokens: AFENDA_CHART_COLOR_TOKENS,
  hues: AFENDA_CHART_HUES,
  governanceReferences: AFENDA_CHART_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaChartRegistry(): void {
  afendaChartRegistrySchema.parse(afendaChartRegistry);
}
