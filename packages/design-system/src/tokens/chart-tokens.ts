export {
  CHART_COLOR_TOKENS,
  CHART_HUES,
  type ChartColorToken,
} from "../contracts/chart.contract";

type CssDeclaration = readonly [name: string, value: string];

export const CHART_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.70 0.11 198)"],
  ["--chart-2", "oklch(0.72 0.10 285)"],
  ["--chart-3", "oklch(0.76 0.11 72)"],
  ["--chart-4", "oklch(0.68 0.10 155)"],
  ["--chart-5", "oklch(0.70 0.10 25)"],
  ["--chart-6", "oklch(0.74 0.08 230)"],
  ["--chart-7", "oklch(0.72 0.09 330)"],
] as const;

export const CHART_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.72 0.11 198)"],
  ["--chart-2", "oklch(0.74 0.10 285)"],
  ["--chart-3", "oklch(0.78 0.11 72)"],
  ["--chart-4", "oklch(0.70 0.10 155)"],
  ["--chart-5", "oklch(0.72 0.10 25)"],
  ["--chart-6", "oklch(0.76 0.08 230)"],
  ["--chart-7", "oklch(0.74 0.09 330)"],
] as const;
