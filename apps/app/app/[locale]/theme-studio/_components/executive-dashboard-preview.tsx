"use client";

import { AFENDA_ERP_VISUAL_LANES as ERP_VISUAL_LANES } from "@repo/design-system/contracts/afenda/registries";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import {
  LANE_DOT_CLASS,
  LANE_PREVIEW_LABELS,
  LANE_ROW_CLASS,
} from "./theme-studio-lane-tokens.ts";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
  ValidationCard,
} from "./theme-studio-shared.tsx";

type KpiTone = "success" | "warning" | "info" | "destructive";

type KpiCardData = {
  change: string;
  description: string;
  label: string;
  tone: KpiTone;
  value: string;
};

type ApprovalItem = {
  amount: string;
  owner: string;
  status: "Approved" | "Escalated" | "Pending";
  title: string;
};

type ActivityItem = {
  detail: string;
  status: "Approved" | "Pending" | "Info";
  time: string;
  title: string;
};

const KPI_BADGE_VARIANT: Record<
  KpiTone,
  "success-light" | "warning-light" | "info-light" | "destructive-light"
> = {
  success: "success-light",
  warning: "warning-light",
  info: "info-light",
  destructive: "destructive-light",
};

const APPROVAL_BADGE_VARIANT: Record<
  ApprovalItem["status"],
  "success-light" | "warning-light" | "destructive-light"
> = {
  Approved: "success-light",
  Pending: "warning-light",
  Escalated: "destructive-light",
};

const ACTIVITY_BADGE_VARIANT: Record<
  ActivityItem["status"],
  "success-light" | "warning-light" | "info-light"
> = {
  Approved: "success-light",
  Pending: "warning-light",
  Info: "info-light",
};

const kpiCards: KpiCardData[] = [
  {
    label: "Monthly Revenue",
    value: "$4.82M",
    change: "+12.8%",
    tone: "success",
    description: "Compared with previous month",
  },
  {
    label: "Pending Approvals",
    value: "42",
    change: "8 urgent",
    tone: "warning",
    description: "Across purchasing and finance",
  },
  {
    label: "Cash Position",
    value: "$1.36M",
    change: "Stable",
    tone: "info",
    description: "Available operating liquidity",
  },
  {
    label: "Blocked Orders",
    value: "7",
    change: "Needs action",
    tone: "destructive",
    description: "Credit hold or supply exception",
  },
];

const approvals: ApprovalItem[] = [
  {
    title: "Purchase Order Approval",
    owner: "Procurement",
    amount: "$128,400",
    status: "Pending",
  },
  {
    title: "Credit Limit Override",
    owner: "Finance",
    amount: "$52,000",
    status: "Escalated",
  },
  {
    title: "New Vendor Onboarding",
    owner: "Governance",
    amount: "$18,900",
    status: "Approved",
  },
];

const activityFeed: ActivityItem[] = [
  {
    title: "Northwind PO released",
    detail: "Procurement · Finance lane",
    time: "4m ago",
    status: "Approved",
  },
  {
    title: "Inventory reorder threshold",
    detail: "Warehouse · Goods lane",
    time: "18m ago",
    status: "Pending",
  },
  {
    title: "Lynx surfaced revenue drift",
    detail: "Intelligence · Evidence pack ready",
    time: "32m ago",
    status: "Info",
  },
];

const chartBars = [
  { height: "42%", token: "bg-chart-1" },
  { height: "58%", token: "bg-chart-2" },
  { height: "76%", token: "bg-chart-3" },
  { height: "64%", token: "bg-chart-4" },
  { height: "88%", token: "bg-chart-5" },
  { height: "70%", token: "bg-chart-6" },
  { height: "92%", token: "bg-chart-7" },
] as const;

export function ExecutiveDashboardPreview(): ReactElement {
  return (
    <PreviewPageShell>
      <PreviewHeader
        actions={
          <>
            <Button size="sm" type="button">
              Export executive pack
            </Button>
            <Button size="sm" type="button" variant="outline">
              Review decision queue
            </Button>
            <Button size="sm" type="button" variant="ghost">
              Configure alerts
            </Button>
          </>
        }
        description="Validates brand CTAs, chart series, semantic status, and ERP lane accents inside a real management surface — no hardcoded palette. Weighted 35% in Theme Studio scorecard."
        previewNumber="01"
        scores={[
          { label: "Brand identity", value: 94 },
          { label: "Status clarity", value: 96 },
          { label: "Chart readability", value: 91 },
        ]}
        title="Executive Dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => (
          <Card className="shadow-sm" key={item.label}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardDescription className="text-sm">
                  {item.label}
                </CardDescription>
                <Badge size="sm" variant={KPI_BADGE_VARIANT[item.tone]}>
                  {item.change}
                </Badge>
              </div>
              <CardTitle className="text-3xl text-tabular tracking-tight">
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Revenue performance</CardTitle>
                <CardDescription>
                  Chart tokens only — never status or lane colors.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className="bg-chart-1/15 text-foreground"
                  variant="outline"
                >
                  Revenue
                </Badge>
                <Badge
                  className="bg-chart-2/15 text-foreground"
                  variant="outline"
                >
                  Margin
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "flex h-80 items-end gap-3 border border-border bg-surface p-5",
                PREVIEW_PANEL_CLASS
              )}
            >
              {chartBars.map((bar, index) => (
                <div
                  className="flex h-full flex-1 flex-col justify-end gap-2"
                  key={bar.token}
                >
                  <div
                    className={cn(
                      "min-h-10 rounded-t-md shadow-xs transition-all",
                      bar.token
                    )}
                    style={{ height: bar.height }}
                  />
                  <span className="text-center text-muted-foreground text-tabular text-xs">
                    M{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Decision queue</CardTitle>
            <CardDescription>
              Status tokens stay semantic — independent of tenant brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvals.map((item) => (
              <div
                className={cn(
                  "border border-border bg-surface p-4",
                  PREVIEW_PANEL_CLASS
                )}
                key={item.title}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Owner: {item.owner}
                    </p>
                  </div>
                  <Badge
                    size="sm"
                    variant={APPROVAL_BADGE_VARIANT[item.status]}
                  >
                    {item.status}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium text-tabular">
                    {item.amount}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
            <CardDescription>
              Neutral canvas with status accents on events only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((item) => (
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border border-border bg-card px-4 py-3",
                  PREVIEW_PANEL_CLASS
                )}
                key={item.title}
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.detail}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge
                    size="sm"
                    variant={ACTIVITY_BADGE_VARIANT[item.status]}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-muted-foreground text-tabular text-xs">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Trend widgets</CardTitle>
            <CardDescription>
              Secondary metrics using brand accent, not lane fills.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Gross margin", value: "31.2%", delta: "+1.4%" },
              { label: "Fulfillment SLA", value: "96.8%", delta: "-0.6%" },
              { label: "DSO", value: "38 days", delta: "Stable" },
              { label: "Open exceptions", value: "23", delta: "5 critical" },
            ].map((widget) => (
              <div
                className={cn(
                  "border border-border bg-surface p-4",
                  PREVIEW_PANEL_CLASS
                )}
                key={widget.label}
              >
                <p className="text-muted-foreground text-xs">{widget.label}</p>
                <p className="mt-2 font-semibold text-2xl text-tabular tracking-tight">
                  {widget.value}
                </p>
                <p className="mt-1 font-medium text-primary text-xs">
                  {widget.delta}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>ERP lane coverage</CardTitle>
            <CardDescription>
              Seven lane accents for 50+ modules — dots and rails, not card
              backgrounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {ERP_VISUAL_LANES.map((lane) => (
              <div
                className={cn(
                  "flex items-center justify-between border border-border border-s-2 px-3 py-2.5",
                  PREVIEW_PANEL_CLASS,
                  LANE_ROW_CLASS[lane.id]
                )}
                key={lane.id}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      LANE_DOT_CLASS[lane.id]
                    )}
                  />
                  <span className="font-medium text-sm">
                    {LANE_PREVIEW_LABELS[lane.id]}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">Active</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Lynx attention summary</CardTitle>
                <CardDescription>
                  Intelligence lane scopes evidence surfaces — distinct from
                  traditional ERP blocks.
                </CardDescription>
              </div>
              <Badge
                className="border-lane-intelligence-border bg-lane-intelligence-muted text-lane-intelligence-muted-foreground"
                variant="outline"
              >
                Intelligence lane
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border border-lane-intelligence-border bg-lane-intelligence-muted p-5",
                PREVIEW_PANEL_CLASS
              )}
            >
              <p className="font-medium text-lane-intelligence-muted-foreground text-sm">
                What requires attention today?
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Inventory risk", value: "14" },
                  { label: "Approval aging", value: "8" },
                  { label: "Revenue exceptions", value: "5" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <p className="text-lane-intelligence-muted-foreground text-xs">
                      {metric.label}
                    </p>
                    <p className="mt-2 font-semibold text-2xl text-tabular">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>What this preview validates</CardTitle>
          <CardDescription>
            Page 1 executive dashboard — 35% weight in the Theme Studio
            scorecard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ValidationCard
            className="border-primary/30 bg-primary/10 text-primary"
            description="Primary CTA, shell chrome, selected identity"
            title="Brand"
          />
          <ValidationCard
            className="border-warning-border bg-warning-muted text-warning-muted-foreground"
            description="Success, warning, destructive, info stay semantic"
            title="Status"
          />
          <ValidationCard
            className="border-info-border bg-info-muted text-info-muted-foreground"
            description="chart-1…chart-7 — never aliased to lanes or status"
            title="Charts"
          />
          <ValidationCard
            className="border-lane-governance-border bg-lane-governance-muted text-lane-governance-muted-foreground"
            description="Module recognition via lane dots and rails"
            title="Lanes"
          />
        </CardContent>
      </Card>
    </PreviewPageShell>
  );
}
