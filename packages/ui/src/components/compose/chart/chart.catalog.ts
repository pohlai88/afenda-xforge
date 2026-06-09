import type { ComposeRenderablePatternSpec } from "../compose.contract";
import ChartBasicBarChart from "./chart-basic-bar-chart";
import ChartDonutChartWithCenterTotal from "./chart-donut-chart-with-center-total";
import ChartMultiDatasetBarChart from "./chart-multi-dataset-bar-chart";
import ChartVerticalBarChart from "./chart-vertical-bar-chart";

export type ChartPatternSpec = ComposeRenderablePatternSpec;

export const chartPatternCatalog = [
  {
    name: "basic-bar",
    title: "Basic Bar",
    description: "A basic bar chart.",
    component: ChartBasicBarChart,
  },
  {
    name: "vertical-bar",
    title: "Vertical Bar",
    description: "A vertical bar chart.",
    component: ChartVerticalBarChart,
  },
  {
    name: "donut-center-total",
    title: "Donut Center Total",
    description: "A donut chart with central total.",
    component: ChartDonutChartWithCenterTotal,
  },
  {
    name: "multi-dataset-bar",
    title: "Multi Dataset Bar",
    description: "A grouped dataset bar chart.",
    component: ChartMultiDatasetBarChart,
  },
] as const satisfies readonly ChartPatternSpec[];

export type ChartPatternName = (typeof chartPatternCatalog)[number]["name"];

export const chartPatternCount = chartPatternCatalog.length;
export const chartPatternNames = chartPatternCatalog.map(
  (pattern) => pattern.name,
) as ChartPatternName[];
