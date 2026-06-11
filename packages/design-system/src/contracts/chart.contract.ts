import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const CHART_COLOR_TOKENS = defineRegistry([
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
]);

export type ChartColorToken = (typeof CHART_COLOR_TOKENS)[number];

export const CHART_HUES = {
  "chart-1": 198,
  "chart-2": 250,
  "chart-3": 160,
  "chart-4": 68,
  "chart-5": 285,
  "chart-6": 212,
  "chart-7": 330,
} as const satisfies Record<ChartColorToken, number>;

export const chartColorTokenSchema = z.enum(CHART_COLOR_TOKENS);
