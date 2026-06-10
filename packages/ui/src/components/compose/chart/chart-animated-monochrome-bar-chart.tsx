"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Bar, BarChart, XAxis } from "recharts";

import type { ChartConfig } from "./chart.shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartTrendBadge,
} from "./chart.shared";
import { IconPlaceholder } from "./icon-placeholder";

const chartData = [
  { month: "January", desktop: 289 },
  { month: "February", desktop: 345 },
  { month: "March", desktop: 412 },
  { month: "April", desktop: 478 },
  { month: "May", desktop: 534 },
  { month: "June", desktop: 456 },
  { month: "July", desktop: 523 },
  { month: "August", desktop: 589 },
  { month: "September", desktop: 467 },
  { month: "October", desktop: 398 },
  { month: "November", desktop: 356 },
  { month: "December", desktop: 423 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function Pattern() {
  const highlighted = useMemo(() => chartData[5] ?? chartData[0], []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Conversion Rates
          <span className="ml-auto text-xl tracking-tighter">
            ${highlighted.desktop}
          </span>
          <ChartTrendBadge>
            <IconPlaceholder
              lucide="TrendingUpIcon"
              tabler="IconTrendingUp"
              hugeicons="TradeUpIcon"
              phosphor="TrendUpIcon"
              remixicon="RiArrowRightUpLongLine"
              aria-hidden="true"
            />
            <span>5.2%</span>
          </ChartTrendBadge>
        </CardTitle>
        <CardDescription>Real-time funnel conversion tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 12,
              bottom: 12,
              left: 12,
            }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="min-w-40 gap-2.5"
                  labelFormatter={(value) => {
                    return (
                      <div className="border-border/50 mb-0.5 flex flex-col gap-0.5 border-b pb-2">
                        <span className="text-xs font-medium">
                          {value} 2024
                        </span>
                      </div>
                    );
                  }}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-xs bg-(--color-bg)"
                          style={
                            {
                              "--color-bg": `var(--color-${name})`,
                            } as CSSProperties
                          }
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label || name}
                        </span>
                      </div>
                      <span className="text-foreground font-semibold">
                        {Number(value ?? 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
