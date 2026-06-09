import type * as React from "react";

import { LineChart1 } from "./line-chart-1";
import { LineChart2 } from "./line-chart-2";
import { LineChart3 } from "./line-chart-3";
import { LineChart4 } from "./line-chart-4";
import { LineChart5 } from "./line-chart-5";
import { LineChart6 } from "./line-chart-6";
import { LineChart7 } from "./line-chart-7";
import { LineChart8 } from "./line-chart-8";
import { LineChart9 } from "./line-chart-9";

export type LineChartPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const lineChartPatternCatalog = [
  {
    name: "line-chart-1",
    title: "Line Chart 1",
    description: "Sales overview with goal comparison and filled trend area.",
    component: LineChart1,
  },
  {
    name: "line-chart-2",
    title: "Line Chart 2",
    description: "Cashflow chart with period control and total summary.",
    component: LineChart2,
  },
  {
    name: "line-chart-3",
    title: "Line Chart 3",
    description: "Traffic source comparison with two smooth series.",
    component: LineChart3,
  },
  {
    name: "line-chart-4",
    title: "Line Chart 4",
    description: "Conversion funnel comparison for desktop and mobile.",
    component: LineChart4,
  },
  {
    name: "line-chart-5",
    title: "Line Chart 5",
    description: "Retention cohort chart with benchmark overlay.",
    component: LineChart5,
  },
  {
    name: "line-chart-6",
    title: "Line Chart 6",
    description: "Revenue forecast with actual and projected segments.",
    component: LineChart6,
  },
  {
    name: "line-chart-7",
    title: "Line Chart 7",
    description: "Performance percentiles against target thresholds.",
    component: LineChart7,
  },
  {
    name: "line-chart-8",
    title: "Line Chart 8",
    description: "Channel growth chart with three acquisition series.",
    component: LineChart8,
  },
  {
    name: "line-chart-9",
    title: "Line Chart 9",
    description: "Compact ARR summary with a sparkline trend.",
    component: LineChart9,
  },
] as const satisfies readonly LineChartPatternSpec[];

export type LineChartPatternName =
  (typeof lineChartPatternCatalog)[number]["name"];

export const lineChartPatternCount = lineChartPatternCatalog.length;
export const lineChartPatternNames = lineChartPatternCatalog.map(
  (pattern) => pattern.name,
) as LineChartPatternName[];
