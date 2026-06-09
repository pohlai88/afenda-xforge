import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const CHART_COLOR_TOKENS = defineRegistry([
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
]);

export type ChartColorToken = (typeof CHART_COLOR_TOKENS)[number];
export const chartColorTokenSchema = z.enum(CHART_COLOR_TOKENS);
