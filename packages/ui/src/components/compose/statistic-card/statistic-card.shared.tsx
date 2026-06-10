"use client";

import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BanknoteArrowUp,
  BarChart2,
  Briefcase,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  LifeBuoy,
  MoreHorizontal,
  MoreVertical,
  Pin,
  Server,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Target,
  Trash,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { Progress } from "../../ui-shadcn/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui-shadcn/select";
import { Separator } from "../../ui-shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";
import { StatusBadge } from "../badge/badge.shared";

export type StatisticCardPatternName =
  | "statistic-card-1"
  | "statistic-card-2"
  | "statistic-card-3"
  | "statistic-card-4"
  | "statistic-card-5"
  | "statistic-card-6"
  | "statistic-card-7"
  | "statistic-card-8"
  | "statistic-card-9"
  | "statistic-card-10"
  | "statistic-card-11"
  | "statistic-card-12"
  | "statistic-card-13"
  | "statistic-card-14"
  | "statistic-card-15";

type Metric = {
  title: string;
  value: string;
  delta?: number;
  compare?: string;
  icon?: React.ElementType;
  description?: string;
  progress?: number;
};

const summaryMetrics: Metric[] = [
  {
    title: "All Orders",
    value: "122,380",
    delta: 15.1,
    compare: "Vs last month: 105,922",
  },
  {
    title: "Order Created",
    value: "1.9M",
    delta: -2,
    compare: "Vs last month: 2.0M",
  },
  {
    title: "Organic Sales",
    value: "$98.1M",
    delta: 0.4,
    compare: "Vs last month: $97.8M",
  },
  {
    title: "Active Users",
    value: "48,210",
    delta: 3.7,
    compare: "Vs last month: 46,480",
  },
];

const coloredMetrics: Array<Metric & { tone: string }> = [
  {
    title: "Total Sales",
    value: "$892.2M",
    delta: 0.2,
    compare: "Vs last month: $889.1M",
    tone: "bg-invert text-invert-foreground",
  },
  {
    title: "New Customers",
    value: "12,800",
    delta: 3.1,
    compare: "Vs last month: 12,400",
    tone: "bg-primary text-primary-foreground",
  },
  {
    title: "Refunds",
    value: "320",
    delta: -1.2,
    compare: "Vs last month: 340",
    tone: "bg-info text-info-foreground",
  },
  {
    title: "Churn Rate",
    value: "2.3%",
    delta: -0.1,
    compare: "Vs last month: 2.4%",
    tone: "bg-success text-success-foreground",
  },
];

const compactStats = [
  {
    title: "Total Sales & Cost",
    label: "Last 60 days",
    value: "$956.8K",
    delta: 12.5,
    icon: TrendingUp,
  },
  {
    title: "New Customers",
    label: "This quarter",
    value: "6,842",
    delta: 8.2,
    icon: UserPlus,
  },
  {
    title: "Churn Rate",
    label: "Last 30 days",
    value: "2.4%",
    delta: -1.6,
    icon: TrendingDown,
  },
];

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <StatusBadge tone={positive ? "success" : "destructive"} className="gap-1">
      <Icon />
      {Math.abs(value)}%
    </StatusBadge>
  );
}

function StatisticCardMenu({
  icon = MoreHorizontal,
}: {
  icon?: React.ElementType;
}) {
  const Icon = icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label="Open card actions" size="icon-sm" variant="ghost">
            <Icon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <TriangleAlert />
          Add alert
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pin />
          Pin to dashboard
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PeriodSelect({
  defaultValue = "this-month",
}: {
  defaultValue?: string;
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger aria-label="Statistic period" size="sm" className="w-32">
        <SelectValue placeholder="Period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="this-month">This Month</SelectItem>
        <SelectItem value="last-month">Last Month</SelectItem>
        <SelectItem value="this-year">This Year</SelectItem>
        <SelectItem value="last-year">Last Year</SelectItem>
      </SelectContent>
    </Select>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card>
      <CardHeader className="border-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <CardAction>
          <StatisticCardMenu />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-medium tracking-tight">
            {metric.value}
          </span>
          {typeof metric.delta === "number" ? (
            <TrendBadge value={metric.delta} />
          ) : null}
        </div>
        {metric.compare ? (
          <div className="border-t pt-2.5 text-xs text-muted-foreground">
            {metric.compare}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ColoredMetricCard({
  metric,
}: {
  metric: (typeof coloredMetrics)[number];
}) {
  return (
    <Card className={cn("relative overflow-hidden border-0", metric.tone)}>
      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-12 bottom-8 size-16 rounded-full bg-white/10" />
      <CardHeader className="relative border-0">
        <CardTitle className="font-medium text-sm">
          {metric.title}
        </CardTitle>
        <CardAction>
          <StatisticCardMenu />
        </CardAction>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-semibold tracking-tight">
            {metric.value}
          </span>
          <Badge className="border border-current/40 bg-transparent text-current">
            {(metric.delta ?? 0) >= 0 ? <ArrowUp /> : <ArrowDown />}
            {metric.delta}%
          </Badge>
        </div>
        <div className="border-t border-current/25 pt-2.5 text-xs">
          {metric.compare}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTooltip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="More information"
              className="inline-flex text-muted-foreground hover:text-foreground"
            >
              <Info className="size-3.5" />
            </button>
          }
        />
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function SegmentedBar({
  segments,
}: {
  segments: Array<{ value: number; className: string }>;
}) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((segment) => (
        <div
          key={`${segment.className}-${segment.value}`}
          className={segment.className}
          style={{ width: `${segment.value}%` }}
        />
      ))}
    </div>
  );
}

function PatternStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

function SubscriptionAlerts() {
  const alerts = [
    { name: "Acme Corp", plan: "Enterprise", daysLeft: 3 },
    { name: "Beta LLC", plan: "Pro", daysLeft: 5 },
    { name: "Gamma Inc", plan: "Pro", daysLeft: 7 },
  ];

  return (
    <Card className="mx-auto w-full max-w-[450px]">
      <CardHeader className="border-0">
        <CardTitle>Subscription Alerts</CardTitle>
        <CardAction>
          <PeriodSelect />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <StatPair label="Total Revenue" value="$128,400" />
          <StatPair label="Subscriptions" value="312" />
        </div>
        <SegmentedBar
          segments={[
            { value: 60, className: "bg-success" },
            { value: 30, className: "bg-destructive" },
            { value: 10, className: "bg-warning" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-success-muted-foreground">
            <span className="size-2 rounded-full bg-success" />
            Free
          </span>
          <span className="flex items-center gap-1 text-destructive-muted-foreground">
            <span className="size-2 rounded-full bg-destructive" />
            Pro
          </span>
          <span className="flex items-center gap-1 text-warning-muted-foreground">
            <span className="size-2 rounded-full bg-warning" />
            Enterprise
            <InfoTooltip>
              Enterprise plans include custom contracts.
            </InfoTooltip>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase">
            Expiring Soon
          </div>
          <Button variant="link" className="h-auto p-0">
            View all
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {alerts.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge size="sm" variant="outline">
                  {item.plan}
                </Badge>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                in{" "}
                <span className="font-semibold text-foreground">
                  {item.daysLeft}d
                </span>
                <Separator orientation="vertical" className="h-3" />
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  aria-label={`Renew ${item.name} subscription`}
                >
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LeadsOverview() {
  const sources = [
    { label: "Website", value: 46, className: "bg-primary" },
    { label: "Social", value: 28, className: "bg-info" },
    { label: "Referral", value: 18, className: "bg-success" },
    { label: "Partner", value: 8, className: "bg-warning" },
  ];

  return (
    <Card className="mx-auto w-full max-w-[520px]">
      <CardHeader>
        <CardTitle>Leads Overview</CardTitle>
        <CardAction>
          <PeriodSelect />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatPair label="Leads" value="24.8K" />
          <StatPair label="Qualified" value="8.2K" />
          <StatPair label="Won" value="1.4K" />
        </div>
        <SegmentedBar
          segments={sources.map(({ value, className }) => ({
            value,
            className,
          }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {sources.map((source) => (
            <div
              key={source.label}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className={cn("size-2 rounded-full", source.className)} />
                {source.label}
              </span>
              <span className="text-sm font-medium">{source.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceCard() {
  return (
    <Card className="mx-auto max-w-sm overflow-hidden bg-invert text-invert-foreground">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-300">Balance</CardTitle>
        <CardAction>
          <Button size="sm" variant="secondary">
            Details
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
            <BanknoteArrowUp className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight">$86,420</div>
            <div className="text-sm text-zinc-300">Available this cycle</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/10 p-3">
            <div className="text-zinc-300">Pending</div>
            <div className="font-semibold">$12,840</div>
          </div>
          <div className="rounded-lg bg-white/10 p-3">
            <div className="text-zinc-300">Payout</div>
            <div className="font-semibold">Jun 14</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignProgress() {
  const goals = [
    { label: "Pipeline", value: 72, icon: Target },
    { label: "Revenue", value: 58, icon: CreditCard },
    { label: "Activation", value: 84, icon: Zap },
  ];

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Quarterly Goals</CardTitle>
        <CardAction>
          <StatisticCardMenu />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <div key={goal.label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4 text-muted-foreground" />
                  {goal.label}
                </div>
                <span className="text-sm text-muted-foreground">
                  {goal.value}%
                </span>
              </div>
              <Progress aria-label={`${goal.label} progress`} value={goal.value} />
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="justify-between border-t text-sm text-muted-foreground">
        Updated 18 minutes ago
        <Button size="sm" variant="outline">
          Review
        </Button>
      </CardFooter>
    </Card>
  );
}

function CompactKpiRows() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {compactStats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl font-semibold tracking-tight">
                    {item.value}
                  </span>
                  <TrendBadge value={item.delta} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function IconMetricGrid() {
  const items = [
    { title: "Active Projects", value: "128", delta: 4.3, icon: Briefcase },
    {
      title: "Orders Processed",
      value: "42.8K",
      delta: 9.8,
      icon: ShoppingCart,
    },
    { title: "Churned Users", value: "1,240", delta: -2.4, icon: Users },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <TrendBadge value={item.delta} />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.title}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TasksOverview() {
  const tasks = [
    { label: "Completed", value: 74, className: "bg-success" },
    { label: "In Progress", value: 18, className: "bg-primary" },
    { label: "Blocked", value: 8, className: "bg-destructive" },
  ];

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Tasks Overview</CardTitle>
        <CardAction>
          <PeriodSelect defaultValue="this-year" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight">1,284</div>
            <div className="text-sm text-muted-foreground">
              Total tasks tracked
            </div>
          </div>
          <TrendBadge value={12.4} />
        </div>
        {tasks.map((task) => (
          <div key={task.label} className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{task.label}</span>
              <span className="text-muted-foreground">{task.value}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${task.label} progress`}
              aria-valuenow={task.value}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn("h-full rounded-full", task.className)}
                style={{ width: `${task.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RevenueBreakdown() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const values = [42, 58, 46, 72, 68, 84];

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardAction>
          <StatisticCardMenu />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold">$442.8K</div>
            <div className="text-sm text-muted-foreground">
              Net revenue this period
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <BarChart2 />
            Analytics
          </Badge>
        </div>
        <div className="flex h-40 items-end gap-3">
          {values.map((value, index) => (
            <div
              key={months[index]}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-t-md bg-primary/80"
                style={{ height: `${value}%` }}
              />
              <span className="text-xs text-muted-foreground">
                {months[index]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApiQuota() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>API Call Quota</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            Upgrade
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Used calls</span>
          <span className="font-medium">78,240 / 100,000</span>
        </div>
        <Progress aria-label="API call quota progress" value={78} />
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="font-semibold">21.7K</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="font-semibold">16d</div>
            <div className="text-xs text-muted-foreground">Reset</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="font-semibold">Pro</div>
            <div className="text-xs text-muted-foreground">Plan</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportQuality() {
  const items = [
    { label: "CSAT", value: "94%", icon: Smile, tone: "success" as const },
    {
      label: "Resolved",
      value: "8,420",
      icon: CheckCircle2,
      tone: "primary" as const,
    },
    {
      label: "Open tickets",
      value: "128",
      icon: LifeBuoy,
      tone: "warning" as const,
    },
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              {item.tone === "primary" ? (
                <Badge variant="secondary" className="size-10 rounded-lg">
                  <Icon className="size-5" />
                </Badge>
              ) : (
                <StatusBadge
                  tone={item.tone}
                  className="size-10 rounded-lg"
                >
                  <Icon className="size-5" />
                </StatusBadge>
              )}
              <div>
                <div className="text-2xl font-semibold">{item.value}</div>
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SecurityScore() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Security Score</CardTitle>
        <CardAction>
          <StatisticCardMenu icon={MoreVertical} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-success-muted text-success-muted-foreground">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <div className="text-3xl font-semibold">92%</div>
            <div className="text-sm text-muted-foreground">
              Protected workload coverage
            </div>
          </div>
        </div>
        <Progress aria-label="Security score progress" value={92} />
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">MFA coverage</span>
            <span className="font-medium">98%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patched systems</span>
            <span className="font-medium">87%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemHealth() {
  const health = [
    { label: "Uptime", value: "99.98%", icon: Activity, progress: 99 },
    { label: "Latency", value: "142ms", icon: Clock, progress: 68 },
    { label: "Servers", value: "48", icon: Server, progress: 82 },
  ];

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardAction>
          <PeriodSelect />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {health.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-4 text-muted-foreground" />
                <StatusBadge tone="success" size="xs">
                  Live
                </StatusBadge>
              </div>
              <div>
                <div className="text-xl font-semibold">{item.value}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
              <Progress
                aria-label={`${item.label} progress`}
                value={item.progress}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LinkedSummaryCards() {
  const cards = [
    {
      title: "NPS Improvement",
      value: "+18",
      icon: Smile,
      href: "#nps",
      description: "Customer sentiment increased this quarter.",
    },
    {
      title: "Active Users",
      value: "284K",
      icon: Users,
      href: "#users",
      description: "Weekly active users across all workspaces.",
    },
    {
      title: "ARR Growth",
      value: "$12.4M",
      icon: ChartNoAxesCombined,
      href: "#arr",
      description: "Annual recurring revenue run rate.",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <a
                  href={item.href}
                  aria-label={`View ${item.title} details`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ArrowRight className="size-4" />
                </a>
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight">
                  {item.value}
                </div>
                <div className="font-medium">{item.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StatisticCardPatternCard({
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

export function renderStatisticCardPattern(name: StatisticCardPatternName) {
  switch (name) {
    case "statistic-card-1":
      return (
        <PatternStage className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </PatternStage>
      );
    case "statistic-card-2":
      return (
        <PatternStage className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coloredMetrics.map((metric) => (
            <ColoredMetricCard key={metric.title} metric={metric} />
          ))}
        </PatternStage>
      );
    case "statistic-card-3":
      return <SubscriptionAlerts />;
    case "statistic-card-4":
      return <LeadsOverview />;
    case "statistic-card-5":
      return <BalanceCard />;
    case "statistic-card-6":
      return <CampaignProgress />;
    case "statistic-card-7":
      return <CompactKpiRows />;
    case "statistic-card-8":
      return <IconMetricGrid />;
    case "statistic-card-9":
      return <TasksOverview />;
    case "statistic-card-10":
      return <RevenueBreakdown />;
    case "statistic-card-11":
      return <ApiQuota />;
    case "statistic-card-12":
      return <SupportQuality />;
    case "statistic-card-13":
      return <SecurityScore />;
    case "statistic-card-14":
      return <SystemHealth />;
    case "statistic-card-15":
      return <LinkedSummaryCards />;
    default:
      return null;
  }
}
