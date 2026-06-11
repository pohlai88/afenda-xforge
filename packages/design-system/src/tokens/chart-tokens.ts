export {
  CHART_COLOR_TOKENS,
  CHART_HUES,
  type ChartColorToken,
} from "../contracts/chart.contract";

type CssDeclaration = readonly [name: string, value: string];

/** Editorial chart series: brand-led hues, controlled chroma for long-session dashboards. */
export const CHART_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.52 0.10 198)"],
  ["--chart-2", "oklch(0.50 0.08 250)"],
  ["--chart-3", "oklch(0.55 0.09 160)"],
  ["--chart-4", "oklch(0.58 0.08 68)"],
  ["--chart-5", "oklch(0.52 0.09 285)"],
  ["--chart-6", "oklch(0.54 0.07 212)"],
  ["--chart-7", "oklch(0.54 0.08 330)"],
] as const;

export const CHART_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.72 0.10 198)"],
  ["--chart-2", "oklch(0.70 0.08 250)"],
  ["--chart-3", "oklch(0.74 0.09 160)"],
  ["--chart-4", "oklch(0.76 0.085 68)"],
  ["--chart-5", "oklch(0.72 0.09 285)"],
  ["--chart-6", "oklch(0.72 0.07 212)"],
  ["--chart-7", "oklch(0.72 0.08 330)"],
] as const;
