export const CHART_USAGE_SCENARIOS = [
  {
    id: "single-series-kpi",
    title: "1-series KPI",
    palette: ["chart-1"],
    description: "Use chart-1 as the brand-adjacent anchor for a single metric.",
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
    palette: ["status-success", "status-warning", "status-destructive"],
    description: "Use status colors only when the data encodes operational state.",
  },
  {
    id: "financial-gain-loss",
    title: "Financial gain / loss",
    palette: ["status-success", "status-destructive"],
    description: "Reserve success/destructive for signed P&L, not decorative charts.",
  },
  {
    id: "category-breakdown",
    title: "Neutral category breakdown",
    palette: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7"],
    description: "Use the chart palette for categorical breakdowns — never ERP lane colors.",
  },
] as const;

export type ChartUsageScenarioId = (typeof CHART_USAGE_SCENARIOS)[number]["id"];

export const COLOR_USAGE_RATIO = {
  neutral: 90,
  lane: 7,
  status: 3,
} as const;
