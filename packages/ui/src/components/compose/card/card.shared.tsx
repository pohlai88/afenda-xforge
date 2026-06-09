"use client";

import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BadgeInfo,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Gauge,
  LayoutGrid,
  Lock,
  Mail,
  MoreHorizontal,
  Server,
  Share2,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { Input } from "../../ui-shadcn/input";
import { Label } from "../../ui-shadcn/label";
import { Progress } from "../../ui-shadcn/progress";
import { Separator } from "../../ui-shadcn/separator";

const deploymentSteps = [
  {
    title: "Build",
    detail: "Completed in 2m 18s",
    icon: CheckCircle2,
    tone: "success",
  },
  {
    title: "Review",
    detail: "Waiting on QA sign-off",
    icon: Clock3,
    tone: "warning",
  },
  {
    title: "Production",
    detail: "Deployment window opens at 18:30",
    icon: Server,
    tone: "muted",
  },
] as const;

const billingLines = [
  { label: "API calls", value: "12,480", progress: 68 },
  { label: "Storage used", value: "182 GB", progress: 52 },
  { label: "Seats", value: "24 / 30", progress: 80 },
] as const;

const sparklineBars = [42, 58, 52, 68, 74, 64, 86];

export type CardPatternName =
  | "basic"
  | "header-with-border"
  | "border-separation"
  | "header-and-footer"
  | "link"
  | "dropdown-menu"
  | "image"
  | "image-scale-hover-effect"
  | "full-image"
  | "full-image-shadow-fade-effect"
  | "stacked-depth-effect"
  | "advanced-clean-login-form"
  | "expandable-billing-usage"
  | "deployment-status-summary"
  | "stat-trend-overflow-menu"
  | "header-badge-actions"
  | "icon-title-link"
  | "header-label-link";

function cardTitle(name: CardPatternName) {
  switch (name) {
    case "basic":
      return "Basic card";
    case "header-with-border":
      return "Card header with border";
    case "border-separation":
      return "Card with border separation";
    case "header-and-footer":
      return "Card with header and footer";
    case "link":
      return "Card with link";
    case "dropdown-menu":
      return "Card with dropdown menu";
    case "image":
      return "Card with image";
    case "image-scale-hover-effect":
      return "Card with image scale hover effect";
    case "full-image":
      return "Card with full image";
    case "full-image-shadow-fade-effect":
      return "Full card with image and shadow fade effect";
    case "stacked-depth-effect":
      return "Card with stacked depth effect";
    case "advanced-clean-login-form":
      return "Advanced clean login form card";
    case "expandable-billing-usage":
      return "Expandable billing usage card";
    case "deployment-status-summary":
      return "Deployment status summary card";
    case "stat-trend-overflow-menu":
      return "Stat card with trend and overflow menu";
    case "header-badge-actions":
      return "Card with header badge and actions";
    case "icon-title-link":
      return "Card with icon, title and link";
    case "header-label-link":
      return "Card with header label and link";
    default:
      return name;
  }
}

function CardPatternCard({
  title,
  description,
  children,
  action,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={headerClassName}>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer ? (
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
}

function CardStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] items-center justify-center rounded-lg bg-muted/40 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeroImage({
  src,
  alt,
  className,
  imageClassName,
  overlay = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      {overlay ? (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      ) : null}
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}

function Sparkline() {
  return (
    <div className="flex h-20 items-end gap-2">
      {sparklineBars.map((bar, index) => (
        <div
          key={`${bar}-${index}`}
          className="w-2 rounded-full bg-primary/20"
          style={{ height: `${bar}%` }}
        >
          <div
            className="w-full rounded-full bg-primary"
            style={{ height: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}

function PlanRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "muted";
  children: React.ReactNode;
}) {
  const toneClassName =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "warning"
        ? "bg-warning/10 text-warning"
        : "bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 py-0.5", toneClassName)}
    >
      {children}
    </Badge>
  );
}

export function renderCardPattern(name: CardPatternName) {
  switch (name) {
    case "basic":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A simple surface for grouped content and actions."
        >
          <p className="text-sm text-muted-foreground">
            Cards help separate related content without adding heavy structure.
          </p>
        </CardPatternCard>
      );
    case "header-with-border":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A header divider keeps the title visually attached to the body."
          headerClassName="border-b"
        >
          <div className="flex items-center justify-between rounded-lg border bg-background p-4">
            <div>
              <p className="text-sm font-medium">Monthly overview</p>
              <p className="text-xs text-muted-foreground">
                Last updated 4 minutes ago
              </p>
            </div>
            <Badge variant="secondary">Live</Badge>
          </div>
        </CardPatternCard>
      );
    case "border-separation":
      return (
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="space-y-1">
              <CardTitle>{cardTitle(name)}</CardTitle>
              <CardDescription>
                Explicit section borders create clear separation.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current plan
              </span>
              <span className="text-sm font-medium">Team Pro</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Seats used</span>
              <span className="text-sm font-medium">24 / 30</span>
            </div>
          </CardContent>
          <CardFooter className="border-t justify-between">
            <span className="text-sm text-muted-foreground">Updated today</span>
            <Button variant="ghost" size="sm">
              View details
            </Button>
          </CardFooter>
        </Card>
      );
    case "header-and-footer":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="The footer gives the card a clear action area."
          footer={
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          }
          footerClassName="justify-end"
        >
          <div className="grid gap-3 text-sm">
            <p>
              Header and footer framing is useful for self-contained settings.
            </p>
            <p className="text-muted-foreground">
              Keep the body focused on the content and reserve the footer for
              actions.
            </p>
          </div>
        </CardPatternCard>
      );
    case "link":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Link cards work well for related destinations or doc calls-to-action."
          footer={
            <Button asChild variant="link" className="px-0">
              <a href="#learn-more">
                Learn more
                <ArrowRight className="size-4" />
              </a>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            A concise description explains the destination before the user
            clicks.
          </p>
        </CardPatternCard>
      );
    case "dropdown-menu":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Use the action slot for a compact overflow menu."
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Card actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="size-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <p className="text-sm text-muted-foreground">
            Overflow menus keep less common actions available without crowding
            the card.
          </p>
        </CardPatternCard>
      );
    case "image":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Image cards pair a visual with a brief caption."
        >
          <div className="space-y-4">
            <CardHeroImage
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
              alt="Workspace"
              className="aspect-[16/9]"
            />
            <p className="text-sm text-muted-foreground">
              This is the simplest image-driven card structure.
            </p>
          </div>
        </CardPatternCard>
      );
    case "image-scale-hover-effect":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A hover scale adds motion without changing the content model."
        >
          <div className="group space-y-4">
            <CardHeroImage
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
              alt="Meeting table"
              className="aspect-[16/9]"
              imageClassName="transition-transform duration-300 group-hover:scale-105"
            />
            <p className="text-sm text-muted-foreground">
              The image animates in place while the card structure stays static.
            </p>
          </div>
        </CardPatternCard>
      );
    case "full-image":
      return (
        <Card className="overflow-hidden">
          <CardHeroImage
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            alt="Team workspace"
            className="aspect-[4/3] rounded-none"
          />
          <CardContent className="space-y-2 py-5">
            <CardTitle>{cardTitle(name)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              A card where the image takes up the strongest visual role.
            </p>
          </CardContent>
        </Card>
      );
    case "full-image-shadow-fade-effect":
      return (
        <Card className="overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <CardHeroImage
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"
            alt="Office interior"
            className="aspect-[16/10] rounded-2xl"
            overlay
          >
            <div className="flex h-full items-end">
              <div className="w-full p-6 text-white">
                <Badge className="mb-3 bg-white/15 text-white hover:bg-white/20">
                  <BadgeCheck className="size-3.5" />
                  Featured
                </Badge>
                <h3 className="text-xl font-semibold">
                  Full card with image and shadow fade effect
                </h3>
                <p className="mt-1 max-w-sm text-sm text-white/80">
                  A fade overlay keeps text readable while preserving the image
                  edges.
                </p>
              </div>
            </div>
          </CardHeroImage>
        </Card>
      );
    case "stacked-depth-effect":
      return (
        <CardStage className="relative overflow-hidden">
          <div className="relative h-52 w-full max-w-sm">
            <Card className="absolute inset-0 translate-y-4 rotate-[-2deg] border-border/60 bg-background/80 shadow-none" />
            <Card className="absolute inset-0 translate-y-2 rotate-[1deg] border-border/80 bg-background/95 shadow-sm" />
            <Card className="absolute inset-0 shadow-lg">
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle>{cardTitle(name)}</CardTitle>
                  <CardDescription>
                    Stacked depth creates a layered, tactile feel.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Offset layers help the primary surface feel elevated without
                  extra chrome.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardStage>
      );
    case "advanced-clean-login-form":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A clean login card with labeled fields and a strong primary action."
          footer={
            <div className="flex w-full items-center justify-between gap-3">
              <Button variant="ghost" asChild className="px-0">
                <a href="#forgot-password">Forgot password?</a>
              </Button>
              <Button className="min-w-32">Sign in</Button>
            </div>
          }
          footerClassName="justify-between"
        >
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="kathryn@company.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
          </form>
        </CardPatternCard>
      );
    case "expandable-billing-usage":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A disclosure-style card can surface usage details on demand."
        >
          <details open className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border bg-background px-4 py-3 text-sm font-medium">
              <span className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                Billing usage
              </span>
              <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
            </summary>
            <div className="space-y-4 px-1 pt-4">
              {billingLines.map((line) => (
                <PlanRow key={line.label} {...line} />
              ))}
              <div className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm">
                <Wallet className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  Next invoice projected at $1,240
                </span>
              </div>
            </div>
          </details>
        </CardPatternCard>
      );
    case "deployment-status-summary":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Deployment health is easier to scan when each step has a clear status."
        >
          <div className="grid gap-3">
            {deploymentSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-lg border bg-background p-3"
                >
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{step.title}</p>
                      <StatusPill tone={step.tone}>
                        {step.tone === "success"
                          ? "Done"
                          : step.tone === "warning"
                            ? "Pending"
                            : "Queued"}
                      </StatusPill>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardPatternCard>
      );
    case "stat-trend-overflow-menu":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Stat cards mix a headline number, a trend, and an overflow menu."
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Metrics</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ArrowRight className="size-4" />
                  Open report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Gauge className="size-4" />
                  View settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <div className="grid gap-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly revenue</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="text-3xl font-semibold tracking-tight">
                    $48.2k
                  </span>
                  <Badge variant="secondary" className="rounded-full">
                    <TrendingUp className="size-3.5" />
                    12.4%
                  </Badge>
                </div>
              </div>
              <Sparkline />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Acquisitions</p>
                <p className="mt-1 text-sm font-medium">1,284</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="mt-1 text-sm font-medium">324</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Churn</p>
                <p className="mt-1 text-sm font-medium">2.1%</p>
              </div>
            </div>
          </div>
        </CardPatternCard>
      );
    case "header-badge-actions":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="Badges and actions can live together in the header when the card is task-oriented."
          action={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                <Sparkles className="size-3.5" />
                New
              </Badge>
              <Button size="sm" variant="secondary">
                Review
              </Button>
            </div>
          }
        >
          <div className="flex items-center justify-between rounded-lg border bg-background p-4">
            <div>
              <p className="text-sm font-medium">Q3 launch checklist</p>
              <p className="text-xs text-muted-foreground">
                4 of 6 tasks completed
              </p>
            </div>
            <Button size="sm" variant="ghost">
              Open
            </Button>
          </div>
        </CardPatternCard>
      );
    case "icon-title-link":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A small icon in the header helps communicate the card's role."
          action={<LayoutGrid className="size-5 text-muted-foreground" />}
          footer={
            <Button asChild variant="link" className="px-0">
              <a href="#details">
                Explore dashboard
                <ExternalLink className="size-4" />
              </a>
            </Button>
          }
        >
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              Link cards are useful when the body is short but the destination
              is important.
            </p>
          </div>
        </CardPatternCard>
      );
    case "header-label-link":
      return (
        <CardPatternCard
          title={cardTitle(name)}
          description="A label chip in the header keeps the link focused in the footer."
          action={
            <Badge variant="outline">
              <BadgeInfo className="size-3.5" />
              Internal
            </Badge>
          }
          footer={
            <Button asChild variant="link" className="px-0">
              <a href="#open-item">
                Open item
                <ArrowRight className="size-4" />
              </a>
            </Button>
          }
        >
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              Good for short summaries where the primary action belongs below
              the content.
            </p>
          </div>
        </CardPatternCard>
      );
    default:
      return null;
  }
}

export { CardPatternCard, CardStage };
