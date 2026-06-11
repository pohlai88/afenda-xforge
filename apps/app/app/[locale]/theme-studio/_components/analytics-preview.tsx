"use client";

import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import type { SemanticTone } from "./theme-studio-shared.tsx";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
  SEMANTIC_TONE_BADGE,
  SEMANTIC_TONE_SURFACE,
  ValidationNote,
} from "./theme-studio-shared.tsx";

type HeatmapTone = "critical" | "high" | "low" | "medium";

type ChartSeries = {
  className: string;
  label: string;
  value: string;
};

type HeatmapCell = {
  label: string;
  tone: HeatmapTone;
  value: string;
};

type Insight = {
  description: string;
  title: string;
  tone: SemanticTone;
};

const REVENUE_BARS = [
  { month: "Jan", height: "42%", color: "bg-chart-1" },
  { month: "Feb", height: "56%", color: "bg-chart-2" },
  { month: "Mar", height: "68%", color: "bg-chart-3" },
  { month: "Apr", height: "61%", color: "bg-chart-4" },
  { month: "May", height: "82%", color: "bg-chart-5" },
  { month: "Jun", height: "74%", color: "bg-chart-6" },
  { month: "Jul", height: "91%", color: "bg-chart-7" },
] as const;

const COMPARISON_SERIES: ChartSeries[] = [
  { label: "Revenue", value: "$4.82M", className: "bg-chart-1" },
  { label: "Gross Margin", value: "31.4%", className: "bg-chart-2" },
  { label: "Operating Cost", value: "$2.96M", className: "bg-chart-3" },
  { label: "Inventory Value", value: "$1.12M", className: "bg-chart-4" },
];

const HEATMAP_CELLS: HeatmapCell[] = [
  { label: "Finance", value: "92", tone: "low" },
  { label: "HR", value: "86", tone: "low" },
  { label: "Inventory", value: "68", tone: "medium" },
  { label: "Production", value: "74", tone: "medium" },
  { label: "Sales", value: "81", tone: "low" },
  { label: "Governance", value: "59", tone: "high" },
  { label: "Lynx", value: "94", tone: "low" },
  { label: "Procurement", value: "42", tone: "critical" },
];

const HORIZONTAL_SERIES = [
  { label: "Revenue", value: 88, barClassName: "bg-chart-1" },
  { label: "Margin", value: 72, barClassName: "bg-chart-2" },
  { label: "Cost Control", value: 64, barClassName: "bg-chart-3" },
  { label: "Inventory", value: 56, barClassName: "bg-chart-4" },
  { label: "Production", value: 79, barClassName: "bg-chart-5" },
  { label: "Sales", value: 69, barClassName: "bg-chart-6" },
  { label: "Governance", value: 91, barClassName: "bg-chart-7" },
] as const;

const CHART_STRESS_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
] as const;

const INSIGHTS: Insight[] = [
  {
    title: "Revenue trend improving",
    description: "Revenue moved above the 90-day average in the latest cycle.",
    tone: "success",
  },
  {
    title: "Procurement pressure detected",
    description: "Supplier lead time is affecting inventory availability.",
    tone: "warning",
  },
  {
    title: "Critical stockout risk",
    description:
      "Two material groups are below the minimum operating threshold.",
    tone: "destructive",
  },
  {
    title: "Chart colors are independent",
    description:
      "Series colors are visual only and do not imply status meaning.",
    tone: "info",
  },
];

const HEATMAP_TONE_SURFACE: Record<HeatmapTone, string> = {
  low: SEMANTIC_TONE_SURFACE.success,
  medium: SEMANTIC_TONE_SURFACE.info,
  high: SEMANTIC_TONE_SURFACE.warning,
  critical: SEMANTIC_TONE_SURFACE.destructive,
};

const KPI_CARDS = [
  {
    label: "Revenue",
    value: "$4.82M",
    delta: "+12.8%",
    tone: "success" as const,
  },
  {
    label: "Gross Margin",
    value: "31.4%",
    delta: "+2.1%",
    tone: "info" as const,
  },
  {
    label: "Procurement Risk",
    value: "18",
    delta: "Needs review",
    tone: "warning" as const,
  },
  {
    label: "Critical Alerts",
    value: "3",
    delta: "Action required",
    tone: "destructive" as const,
  },
];

export function AnalyticsPreview(): ReactElement {
  return (
    <PreviewPageShell>
      <PreviewHeader
        description="Validates chart readability, series distinction, heatmap behavior, legend clarity, and the separation between chart colors and operational status colors — chart color explains data series; status color explains operational meaning."
        previewNumber="06"
        scores={[
          { label: "Chart separation", value: 91 },
          { label: "Legend clarity", value: 93 },
          { label: "Status distinction", value: 96 },
        ]}
        title="Analytics Preview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((kpi) => (
          <MetricCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Revenue series</CardTitle>
                <CardDescription>
                  Chart colors use dedicated chart tokens, not status or lane
                  colors.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <LegendPill color="bg-chart-1" label="Actual" />
                <LegendPill color="bg-chart-2" label="Forecast" />
                <LegendPill color="bg-chart-3" label="Target" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "flex h-[360px] items-end gap-4 border border-border bg-surface p-5",
                PREVIEW_PANEL_CLASS
              )}
            >
              {REVENUE_BARS.map((bar) => (
                <div
                  className="flex h-full flex-1 flex-col justify-end gap-3"
                  key={bar.month}
                >
                  <div
                    className={cn(
                      "min-h-12 rounded-t-md shadow-xs transition-opacity hover:opacity-85",
                      bar.color
                    )}
                    style={{ height: bar.height }}
                  />
                  <span className="text-center font-semibold text-muted-foreground text-xs">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Series legend</CardTitle>
            <CardDescription>
              Legend colors must be distinguishable without implying approval,
              warning, or error.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {COMPARISON_SERIES.map((series) => (
              <div
                className={cn(
                  "flex items-center justify-between border border-border bg-surface p-4",
                  PREVIEW_PANEL_CLASS
                )}
                key={series.label}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn("size-4 rounded-full", series.className)}
                  />
                  <span className="font-semibold text-sm">{series.label}</span>
                </div>
                <strong className="text-sm text-tabular">{series.value}</strong>
              </div>
            ))}

            <div
              className={cn(
                "border border-info-border bg-info-muted p-4 text-info-muted-foreground",
                PREVIEW_PANEL_CLASS
              )}
            >
              <h3 className="font-semibold text-sm">Visualization rule</h3>
              <p className="mt-2 text-xs leading-5">
                Chart colors explain data series. Status colors explain
                operational meaning. Do not merge those jobs.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Operational heatmap</CardTitle>
            <CardDescription>
              Heatmaps may use status colors only when data represents risk,
              health, or threshold state.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {HEATMAP_CELLS.map((cell) => (
              <div
                className={cn(
                  "border p-4",
                  PREVIEW_PANEL_CLASS,
                  HEATMAP_TONE_SURFACE[cell.tone]
                )}
                key={cell.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-sm">{cell.label}</h3>
                  <strong className="text-2xl text-tabular tracking-tight">
                    {cell.value}
                  </strong>
                </div>
                <p className="mt-2 text-xs leading-5 opacity-85">
                  Operating health score
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Multi-series comparison</CardTitle>
            <CardDescription>
              Multiple chart colors must remain readable together.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {HORIZONTAL_SERIES.map((series) => (
              <HorizontalSeries key={series.label} series={series} />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Chart color stress test</CardTitle>
            <CardDescription>
              All seven chart colors at small size — exposes weak separation in
              legends and compact widgets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "grid grid-cols-7 overflow-hidden border border-border",
                PREVIEW_PANEL_CLASS
              )}
            >
              {CHART_STRESS_COLORS.map((color, index) => (
                <ColorBlock
                  className={color}
                  key={color}
                  label={String(index + 1)}
                />
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ValidationNote
                description="If colors are not clear here, they will fail inside compact dashboards."
                title="Small legend test"
              />
              <ValidationNote
                description="Green, amber, and red-like chart colors should not imply success or error unless intended."
                title="Avoid semantic confusion"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Analytics insights</CardTitle>
            <CardDescription>
              Insights use semantic status colors because they represent
              operational meaning, not chart series.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {INSIGHTS.map((insight) => (
              <div
                className={cn(
                  "border p-4",
                  PREVIEW_PANEL_CLASS,
                  SEMANTIC_TONE_SURFACE[insight.tone]
                )}
                key={insight.title}
              >
                <h3 className="font-semibold text-sm">{insight.title}</h3>
                <p className="mt-2 text-xs leading-5">{insight.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Analytics preview validation notes</CardTitle>
          <CardDescription>
            Page 6 confirms whether the tenant theme is suitable for executive
            analytics and operational reporting.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ValidationNote
            description="Chart colors should not be direct aliases of brand, lane, or status colors."
            title="Chart independence"
          />
          <ValidationNote
            description="Users must be able to match legend colors to chart series quickly."
            title="Legend readability"
          />
          <ValidationNote
            description="Use status colors only when the data carries operational meaning."
            title="Status discipline"
          />
          <ValidationNote
            description="Charts must remain legible in both light and dark token modes."
            title="Dark and light proof"
          />
        </CardContent>
      </Card>
    </PreviewPageShell>
  );
}

function MetricCard({
  delta,
  label,
  tone,
  value,
}: {
  delta: string;
  label: string;
  tone: SemanticTone;
  value: string;
}): ReactElement {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl text-tabular tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge size="sm" variant={SEMANTIC_TONE_BADGE[tone]}>
          {delta}
        </Badge>
      </CardContent>
    </Card>
  );
}

function LegendPill({
  color,
  label,
}: {
  color: string;
  label: string;
}): ReactElement {
  return (
    <Badge className="gap-2 font-semibold" variant="outline">
      <span className={cn("size-2.5 rounded-full", color)} />
      {label}
    </Badge>
  );
}

function HorizontalSeries({
  series,
}: {
  series: (typeof HORIZONTAL_SERIES)[number];
}): ReactElement {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold">{series.label}</span>
        <span className="text-muted-foreground text-tabular">
          {series.value}%
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            series.barClassName
          )}
          style={{ width: `${series.value}%` }}
        />
      </div>
    </div>
  );
}

function ColorBlock({
  className,
  label,
}: {
  className: string;
  label: string;
}): ReactElement {
  return (
    <div className={cn("grid h-24 place-items-center", className)}>
      <span className="rounded-full bg-background/80 px-2 py-1 font-black text-foreground text-xs">
        {label}
      </span>
    </div>
  );
}
