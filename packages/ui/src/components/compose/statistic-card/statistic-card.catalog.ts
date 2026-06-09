import type * as React from "react";

import { StatisticCard1 } from "./statistic-card-1";
import { StatisticCard2 } from "./statistic-card-2";
import { StatisticCard3 } from "./statistic-card-3";
import { StatisticCard4 } from "./statistic-card-4";
import { StatisticCard5 } from "./statistic-card-5";
import { StatisticCard6 } from "./statistic-card-6";
import { StatisticCard7 } from "./statistic-card-7";
import { StatisticCard8 } from "./statistic-card-8";
import { StatisticCard9 } from "./statistic-card-9";
import { StatisticCard10 } from "./statistic-card-10";
import { StatisticCard11 } from "./statistic-card-11";
import { StatisticCard12 } from "./statistic-card-12";
import { StatisticCard13 } from "./statistic-card-13";
import { StatisticCard14 } from "./statistic-card-14";
import { StatisticCard15 } from "./statistic-card-15";

export type StatisticCardPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const statisticCardPatternCatalog = [
  {
    name: "statistic-card-1",
    title: "Statistic Card 1",
    description: "Four neutral metric cards with trend and overflow actions.",
    component: StatisticCard1,
  },
  {
    name: "statistic-card-2",
    title: "Statistic Card 2",
    description: "Four colored KPI cards with decorative background layers.",
    component: StatisticCard2,
  },
  {
    name: "statistic-card-3",
    title: "Statistic Card 3",
    description: "Subscription alerts with segmented plan distribution.",
    component: StatisticCard3,
  },
  {
    name: "statistic-card-4",
    title: "Statistic Card 4",
    description: "Lead source overview with distribution and summary totals.",
    component: StatisticCard4,
  },
  {
    name: "statistic-card-5",
    title: "Statistic Card 5",
    description: "Dark balance card with payout metadata.",
    component: StatisticCard5,
  },
  {
    name: "statistic-card-6",
    title: "Statistic Card 6",
    description: "Quarterly goal progress with review action.",
    component: StatisticCard6,
  },
  {
    name: "statistic-card-7",
    title: "Statistic Card 7",
    description: "Compact KPI rows for sales, customers, and churn.",
    component: StatisticCard7,
  },
  {
    name: "statistic-card-8",
    title: "Statistic Card 8",
    description: "Icon-led metric grid for operational dashboard summaries.",
    component: StatisticCard8,
  },
  {
    name: "statistic-card-9",
    title: "Statistic Card 9",
    description: "Task overview with status progress distribution.",
    component: StatisticCard9,
  },
  {
    name: "statistic-card-10",
    title: "Statistic Card 10",
    description: "Revenue breakdown with a compact bar chart.",
    component: StatisticCard10,
  },
  {
    name: "statistic-card-11",
    title: "Statistic Card 11",
    description: "API quota card with usage progress and plan action.",
    component: StatisticCard11,
  },
  {
    name: "statistic-card-12",
    title: "Statistic Card 12",
    description: "Support quality metrics for satisfaction and tickets.",
    component: StatisticCard12,
  },
  {
    name: "statistic-card-13",
    title: "Statistic Card 13",
    description: "Security score card with coverage details.",
    component: StatisticCard13,
  },
  {
    name: "statistic-card-14",
    title: "Statistic Card 14",
    description: "System health card with uptime, latency, and server stats.",
    component: StatisticCard14,
  },
  {
    name: "statistic-card-15",
    title: "Statistic Card 15",
    description: "Linked summary cards for NPS, users, and ARR.",
    component: StatisticCard15,
  },
] as const satisfies readonly StatisticCardPatternSpec[];

export type StatisticCardPatternName =
  (typeof statisticCardPatternCatalog)[number]["name"];

export const statisticCardPatternCount = statisticCardPatternCatalog.length;
export const statisticCardPatternNames = statisticCardPatternCatalog.map(
  (pattern) => pattern.name,
) as StatisticCardPatternName[];
