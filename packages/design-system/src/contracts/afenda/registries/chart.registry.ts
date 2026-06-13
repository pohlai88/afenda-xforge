import { z } from "zod";

import { defineRegistry } from "../../registry.schema";
import {
  AFENDA_STATUS_COLOR_TOKENS,
  afendaStatusColorTokenSchema,
  type AfendaStatusColorToken,
} from "./color-token.registry";

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

export const AFENDA_CHART_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:data-display-contract",
  "AFENDA:theming-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:content-contract",
  "AFENDA:hue-reservation-contract",
  "WCAG:1.4.1",
] as const;

export const afendaChartColorTokenSchema = z.enum(AFENDA_CHART_COLOR_TOKENS);

export const afendaChartRegistrySchema = z
  .object({
    colorTokens: z.array(afendaChartColorTokenSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
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

export const AFENDA_CHART_USAGE_CONTRACT_ID =
  "afenda.chart-usage-contract" as const;
export const AFENDA_CHART_USAGE_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_CHART_USAGE_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:data-display-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:chart-registry",
  "AFENDA:status-tone-registry",
  "AFENDA:hue-reservation-contract",
] as const;

export type AfendaChartUsagePaletteToken =
  | AfendaChartColorToken
  | AfendaStatusColorToken;

export type AfendaChartUsageScenario = {
  description: string;
  id: string;
  palette: readonly AfendaChartUsagePaletteToken[];
  title: string;
};

export const AFENDA_CHART_USAGE_SCENARIOS = [
  {
    id: "single-series-kpi",
    title: "1-series KPI",
    palette: ["chart-1"],
    description:
      "Use chart-1 as the brand-adjacent anchor for a single metric.",
  },
  {
    id: "two-series-comparison",
    title: "2-series comparison",
    palette: ["chart-1", "chart-2"],
    description: "Pair chart-1 with chart-2 for side-by-side comparisons.",
  },
  {
    id: "three-series-comparison",
    title: "3-series comparison",
    palette: ["chart-1", "chart-2", "chart-3"],
    description: "Use chart-1..3 for compact multi-series charts.",
  },
  {
    id: "risk-exception-data",
    title: "Risk / exception data",
    palette: ["success", "warning", "destructive"],
    description:
      "Use status colors only when the data encodes operational state.",
  },
  {
    id: "financial-gain-loss",
    title: "Financial gain / loss",
    palette: ["success", "destructive"],
    description:
      "Reserve success/destructive for signed P&L, not decorative charts.",
  },
  {
    id: "category-breakdown",
    title: "Neutral category breakdown",
    palette: [
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
      "chart-6",
      "chart-7",
    ],
    description:
      "Use the chart palette for categorical breakdowns; never ERP lane colors.",
  },
] as const satisfies readonly AfendaChartUsageScenario[];

export type AfendaChartUsageScenarioId =
  (typeof AFENDA_CHART_USAGE_SCENARIOS)[number]["id"];

export const AFENDA_COLOR_USAGE_RATIO = {
  neutral: 90,
  lane: 7,
  status: 3,
} as const;

export type AfendaColorUsageRatio = typeof AFENDA_COLOR_USAGE_RATIO;

const afendaChartUsagePaletteTokenSchema = z.union([
  afendaChartColorTokenSchema,
  afendaStatusColorTokenSchema,
]);

export const afendaChartUsageScenarioSchema = z
  .object({
    description: z.string().trim().min(1),
    id: z.string().trim().min(1),
    palette: z.array(afendaChartUsagePaletteTokenSchema).min(1).readonly(),
    title: z.string().trim().min(1),
  })
  .strict();

export const afendaChartUsageContractSchema = z
  .object({
    colorUsageRatio: z
      .object({
        lane: z.number().int().nonnegative(),
        neutral: z.number().int().nonnegative(),
        status: z.number().int().nonnegative(),
      })
      .strict(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_CHART_USAGE_CONTRACT_ID),
    paletteTokens: z
      .object({
        chart: z.array(afendaChartColorTokenSchema).min(1).readonly(),
        status: z.array(afendaStatusColorTokenSchema).min(1).readonly(),
      })
      .strict(),
    scenarios: z.array(afendaChartUsageScenarioSchema).min(1).readonly(),
    version: z.literal(AFENDA_CHART_USAGE_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.colorUsageRatio.neutral +
        contract.colorUsageRatio.lane +
        contract.colorUsageRatio.status ===
      100,
    "Afenda chart usage color ratios must add up to 100"
  )
  .refine(
    (contract) =>
      contract.scenarios.some((scenario) =>
        scenario.palette.some((token) =>
          contract.paletteTokens.status.includes(token as AfendaStatusColorToken)
        )
      ),
    "Afenda chart usage needs at least one governed status-data scenario"
  );

export const afendaChartUsageContract = {
  id: AFENDA_CHART_USAGE_CONTRACT_ID,
  version: AFENDA_CHART_USAGE_CONTRACT_VERSION,
  scenarios: AFENDA_CHART_USAGE_SCENARIOS,
  colorUsageRatio: AFENDA_COLOR_USAGE_RATIO,
  paletteTokens: {
    chart: AFENDA_CHART_COLOR_TOKENS,
    status: AFENDA_STATUS_COLOR_TOKENS,
  },
  governanceReferences: AFENDA_CHART_USAGE_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaChartUsageContract(): void {
  afendaChartUsageContractSchema.parse(afendaChartUsageContract);
}
