"use client";

import {
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart as RechartsLineChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import type { ChartConfig } from "../../ui-shadcn/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui-shadcn/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui-shadcn/select";

export type LineChartPatternName =
  | "line-chart-1"
  | "line-chart-2"
  | "line-chart-3"
  | "line-chart-4"
  | "line-chart-5"
  | "line-chart-6"
  | "line-chart-7"
  | "line-chart-8"
  | "line-chart-9";

const salesData = [
  { month: "Jan 24", goals: 250, sales: 280, salesArea: 280 },
  { month: "Feb 24", goals: 420, sales: 350, salesArea: 350 },
  { month: "Mar 24", goals: 380, sales: 480, salesArea: 480 },
  { month: "Apr 24", goals: 520, sales: 390, salesArea: 390 },
  { month: "May 24", goals: 300, sales: 520, salesArea: 520 },
  { month: "Jun 24", goals: 550, sales: 465, salesArea: 465 },
];

const cashflowData = [
  { month: "JAN", value: 2100 },
  { month: "FEB", value: 2300 },
  { month: "MAR", value: 1900 },
  { month: "APR", value: 4800 },
  { month: "MAY", value: 5200 },
  { month: "JUN", value: 8900 },
  { month: "JUL", value: 6200 },
  { month: "AUG", value: 7100 },
  { month: "SEP", value: 9400 },
  { month: "OCT", value: 10_200 },
  { month: "NOV", value: 11_100 },
  { month: "DEC", value: 11_800 },
];

const trafficData = [
  { day: "Mon", organic: 18, paid: 10 },
  { day: "Tue", organic: 24, paid: 14 },
  { day: "Wed", organic: 21, paid: 18 },
  { day: "Thu", organic: 30, paid: 20 },
  { day: "Fri", organic: 38, paid: 27 },
  { day: "Sat", organic: 34, paid: 22 },
  { day: "Sun", organic: 42, paid: 30 },
];

const conversionData = [
  { step: "Visit", desktop: 65, mobile: 58 },
  { step: "Signup", desktop: 52, mobile: 43 },
  { step: "Trial", desktop: 38, mobile: 29 },
  { step: "Active", desktop: 31, mobile: 24 },
  { step: "Paid", desktop: 22, mobile: 16 },
];

const retentionData = [
  { cohort: "W1", retention: 100, benchmark: 100 },
  { cohort: "W2", retention: 82, benchmark: 78 },
  { cohort: "W3", retention: 71, benchmark: 66 },
  { cohort: "W4", retention: 63, benchmark: 58 },
  { cohort: "W5", retention: 56, benchmark: 51 },
  { cohort: "W6", retention: 52, benchmark: 46 },
];

const forecastData = [
  { month: "Jul", actual: 42, forecast: null },
  { month: "Aug", actual: 48, forecast: null },
  { month: "Sep", actual: 51, forecast: null },
  { month: "Oct", actual: 58, forecast: 58 },
  { month: "Nov", actual: null, forecast: 64 },
  { month: "Dec", actual: null, forecast: 71 },
  { month: "Jan", actual: null, forecast: 78 },
];

const benchmarkData = [
  { label: "P10", current: 18, target: 20 },
  { label: "P25", current: 34, target: 31 },
  { label: "P50", current: 52, target: 48 },
  { label: "P75", current: 70, target: 66 },
  { label: "P90", current: 84, target: 78 },
];

const channelData = [
  { month: "Jan", email: 24, search: 38, social: 18 },
  { month: "Feb", email: 28, search: 42, social: 21 },
  { month: "Mar", email: 31, search: 39, social: 26 },
  { month: "Apr", email: 35, search: 48, social: 29 },
  { month: "May", email: 38, search: 52, social: 33 },
  { month: "Jun", email: 42, search: 56, social: 39 },
];

const sparklineData = [
  { day: "1", value: 42 },
  { day: "2", value: 45 },
  { day: "3", value: 39 },
  { day: "4", value: 51 },
  { day: "5", value: 56 },
  { day: "6", value: 62 },
  { day: "7", value: 68 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
  goals: {
    label: "Goals",
    color: "var(--chart-2)",
  },
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
  organic: {
    label: "Organic",
    color: "var(--chart-1)",
  },
  paid: {
    label: "Paid",
    color: "var(--chart-3)",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  retention: {
    label: "Retention",
    color: "var(--chart-1)",
  },
  benchmark: {
    label: "Benchmark",
    color: "var(--chart-5)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
  forecast: {
    label: "Forecast",
    color: "var(--chart-4)",
  },
  current: {
    label: "Current",
    color: "var(--chart-1)",
  },
  target: {
    label: "Target",
    color: "var(--chart-2)",
  },
  email: {
    label: "Email",
    color: "var(--chart-1)",
  },
  search: {
    label: "Search",
    color: "var(--chart-2)",
  },
  social: {
    label: "Social",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function TrendBadge({
  tone,
  children,
  className,
}: {
  tone: "success" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        tone === "success"
          ? "border-transparent bg-success-muted text-success-muted-foreground"
          : "border-transparent bg-warning-muted text-warning-muted-foreground",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

function ChartMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open chart actions"
            size="icon-sm"
            variant="ghost"
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Download />
          Export Data
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Calendar />
          Change Period
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Filter />
          Filter Data
        </DropdownMenuItem>
        <DropdownMenuItem>
          <RefreshCw />
          Refresh
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Share2 />
          Share Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChartLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="size-3 rounded-full border-4 bg-background"
            style={{ borderColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  action,
  children,
  footer,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="border-0 pb-2">
        <CardTitle>{title}</CardTitle>
        <CardAction>{action ?? <ChartMenu />}</CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <div className="px-6 pb-6 text-sm text-muted-foreground">{footer}</div>
      ) : null}
    </Card>
  );
}

function PeriodSelect() {
  return (
    <Select defaultValue="12m">
      <SelectTrigger aria-label="Chart period" size="sm" className="w-32">
        <SelectValue placeholder="Period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="6m">6 months</SelectItem>
        <SelectItem value="12m">12 months</SelectItem>
        <SelectItem value="2y">2 years</SelectItem>
      </SelectContent>
    </Select>
  );
}

function StandardGrid() {
  return (
    <CartesianGrid
      vertical={false}
      stroke="var(--border)"
      strokeDasharray="4 4"
    />
  );
}

function CurrencyTooltip() {
  return (
    <ChartTooltip
      content={
        <ChartTooltipContent
          formatter={(value, name) => (
            <div className="flex min-w-32 items-center justify-between gap-3">
              <span className="text-muted-foreground">{name}</span>
              <span className="font-mono font-medium">
                ${Number(value).toLocaleString()}K
              </span>
            </div>
          )}
        />
      }
    />
  );
}

function SalesOverview() {
  return (
    <ChartCard
      title="Sales Overview"
      action={
        <div className="flex items-center gap-4">
          <ChartLegend
            items={[
              { label: "Sales", color: "var(--chart-1)" },
              { label: "Goals", color: "var(--chart-2)" },
            ]}
          />
          <ChartMenu />
        </div>
      }
    >
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ComposedChart
          data={salesData}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient
              id="lineChartSalesGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-sales)"
                stopOpacity={0.24}
              />
              <stop
                offset="100%"
                stopColor="var(--color-sales)"
                stopOpacity={0.03}
              />
            </linearGradient>
          </defs>
          <StandardGrid />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `$${value}K`}
          />
          <ReferenceLine x="Mar 24" stroke="var(--color-sales)" />
          <CurrencyTooltip />
          <Area
            dataKey="salesArea"
            fill="url(#lineChartSalesGradient)"
            stroke="transparent"
          />
          <Line
            dataKey="sales"
            stroke="var(--color-sales)"
            strokeWidth={2.5}
            dot={{ r: 5 }}
            type="linear"
          />
          <Line
            dataKey="goals"
            stroke="var(--color-goals)"
            strokeDasharray="4 4"
            strokeWidth={2.5}
            dot={{ r: 5 }}
            type="linear"
          />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  );
}

function CashflowChart() {
  const total = cashflowData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard title="Cashflow" action={<PeriodSelect />}>
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          Jan 01 - Dec 31, 2024
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold">${total.toLocaleString()}</div>
          <TrendBadge tone="success">
            <TrendingUp />
            6.31%
          </TrendBadge>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ComposedChart
          data={cashflowData}
          margin={{ top: 16, right: 24, left: 0, bottom: 16 }}
        >
          <defs>
            <linearGradient
              id="lineChartCashflowGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-value)"
                stopOpacity={0.18}
              />
              <stop
                offset="100%"
                stopColor="var(--color-value)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <StandardGrid />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `${Number(value) / 1000}K`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            fill="url(#lineChartCashflowGradient)"
            stroke="transparent"
          />
          <Line
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={3}
            dot={{ r: 3 }}
            type="linear"
          />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  );
}

function TrafficChart() {
  return (
    <ChartCard
      title="Traffic Sources"
      footer="Organic search continues to outperform paid traffic during weekend periods."
    >
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <RechartsLineChart
          data={trafficData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <StandardGrid />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="organic"
            stroke="var(--color-organic)"
            strokeWidth={3}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="paid"
            stroke="var(--color-paid)"
            strokeWidth={3}
            dot={false}
            type="monotone"
          />
        </RechartsLineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function ConversionChart() {
  return (
    <ChartCard
      title="Conversion Funnel"
      action={
        <TrendBadge tone="success">
          <TrendingUp />
          +4.8%
        </TrendBadge>
      }
    >
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <RechartsLineChart
          data={conversionData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <StandardGrid />
          <XAxis
            dataKey="step"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="desktop"
            stroke="var(--color-desktop)"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            type="monotone"
          />
          <Line
            dataKey="mobile"
            stroke="var(--color-mobile)"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            type="monotone"
          />
        </RechartsLineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function RetentionChart() {
  return (
    <ChartCard title="Retention Cohorts">
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <ComposedChart
          data={retentionData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient
              id="lineChartRetentionGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-retention)"
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor="var(--color-retention)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <StandardGrid />
          <XAxis
            dataKey="cohort"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="retention"
            fill="url(#lineChartRetentionGradient)"
            stroke="transparent"
          />
          <Line
            dataKey="retention"
            stroke="var(--color-retention)"
            strokeWidth={3}
            dot={{ r: 4 }}
            type="monotone"
          />
          <Line
            dataKey="benchmark"
            stroke="var(--color-benchmark)"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  );
}

function ForecastChart() {
  return (
    <ChartCard
      title="Revenue Forecast"
      action={<TrendBadge tone="warning">Forecast</TrendBadge>}
    >
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <RechartsLineChart
          data={forecastData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <StandardGrid />
          <ReferenceArea
            x1="Oct"
            x2="Jan"
            fill="var(--muted)"
            fillOpacity={0.35}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `$${value}K`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={3}
            dot={{ r: 4 }}
            connectNulls
            type="monotone"
          />
          <Line
            dataKey="forecast"
            stroke="var(--color-forecast)"
            strokeDasharray="6 4"
            strokeWidth={3}
            dot={{ r: 4 }}
            connectNulls
            type="monotone"
          />
        </RechartsLineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function BenchmarkChart() {
  return (
    <ChartCard title="Performance Percentiles">
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <RechartsLineChart
          data={benchmarkData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <StandardGrid />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="current"
            stroke="var(--color-current)"
            strokeWidth={3}
            dot={{ r: 5 }}
            type="linear"
          />
          <Line
            dataKey="target"
            stroke="var(--color-target)"
            strokeDasharray="3 6"
            strokeWidth={3}
            dot={{ r: 5 }}
            type="linear"
          />
        </RechartsLineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function ChannelChart() {
  return (
    <ChartCard title="Channel Growth">
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <RechartsLineChart
          data={channelData}
          margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
        >
          <StandardGrid />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="email"
            stroke="var(--color-email)"
            strokeWidth={2.5}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="search"
            stroke="var(--color-search)"
            strokeWidth={2.5}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="social"
            stroke="var(--color-social)"
            strokeWidth={2.5}
            dot={false}
            type="monotone"
          />
        </RechartsLineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function SparklineSummary() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="pb-0">
        <CardTitle>ARR Growth</CardTitle>
        <CardAction>
          <TrendBadge tone="success">
            <TrendingUp />
            18.2%
          </TrendBadge>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold">$12.4M</div>
            <div className="text-sm text-muted-foreground">
              Annual recurring revenue
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingDown className="size-4" />
            Last 7 days
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <RechartsLineChart
            data={sparklineData}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={3}
              dot={false}
              type="monotone"
            />
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function LineChartPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function renderLineChartPattern(name: LineChartPatternName) {
  switch (name) {
    case "line-chart-1":
      return <SalesOverview />;
    case "line-chart-2":
      return <CashflowChart />;
    case "line-chart-3":
      return <TrafficChart />;
    case "line-chart-4":
      return <ConversionChart />;
    case "line-chart-5":
      return <RetentionChart />;
    case "line-chart-6":
      return <ForecastChart />;
    case "line-chart-7":
      return <BenchmarkChart />;
    case "line-chart-8":
      return <ChannelChart />;
    case "line-chart-9":
      return <SparklineSummary />;
    default:
      return null;
  }
}
