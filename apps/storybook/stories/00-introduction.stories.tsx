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
import type { Meta, StoryObj } from "@storybook/react";

const COMMAND_MAP = [
  { label: "Metadata contract", code: "EntityMetadata" },
  { label: "Registry", code: "resolveRenderer()" },
  { label: "Renderer", code: "manifest → @repo/ui" },
  { label: "Governed surface", code: "MetadataTable · Form" },
  { label: "Audit event", code: "correlationId" },
] as const;

const BENTO_SURFACES = [
  {
    title: "Page header",
    body: "Title, breadcrumbs, primary actions, and surface identity from metadata.",
    badge: "primary-light" as const,
    className: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    title: "List surface",
    body: "Columns, filters, row actions, and empty states from entity metadata.",
    badge: "info-light" as const,
    className: "",
    featured: false,
  },
  {
    title: "Form renderer",
    body: "Fields, validation, density, and action bar wired through adapters.",
    badge: "success-light" as const,
    className: "",
    featured: false,
  },
  {
    title: "Action bar",
    body: "Primary, destructive, and menu actions with governance gates.",
    badge: "warning-light" as const,
    className: "md:col-span-2",
    featured: false,
  },
  {
    title: "Audit panel",
    body: "Diagnostics, correlation IDs, and trustworthy error copy.",
    badge: "destructive-light" as const,
    className: "",
    featured: false,
  },
  {
    title: "Stat block",
    body: "Metric emphasis with tabular nums and semantic status.",
    badge: "neutral" as const,
    className: "",
    featured: false,
  },
  {
    title: "Chart section",
    body: "Chart tokens map manifest composeGroup to visual families.",
    badge: "info-light" as const,
    className: "",
    featured: false,
  },
  {
    title: "Empty state",
    body: "Honest copy, optional CTA, and muted visual tone.",
    badge: "outline" as const,
    className: "",
    featured: false,
  },
] as const;

const PREVIEW_STRIPS = [
  {
    label: "Dashboard",
    tone: "border-primary/30 bg-primary/5",
    bars: ["bg-primary/40", "bg-chart-2/50", "bg-chart-3/50"],
  },
  {
    label: "List",
    tone: "border-info-border bg-info-muted/30",
    bars: ["bg-info/30", "bg-info/20", "bg-info/15"],
  },
  {
    label: "Form",
    tone: "border-success-border bg-success-muted/30",
    bars: ["bg-success/25", "bg-success/20", "bg-success/15"],
  },
  {
    label: "Audit",
    tone: "border-warning-border bg-warning-muted/30",
    bars: ["bg-warning/30", "bg-warning/20", "bg-warning/15"],
  },
] as const;

const DENSITY_MODES = [
  { mode: "compact", attr: "compact" as const },
  { mode: "default", attr: undefined },
  { mode: "comfortable", attr: "comfortable" as const },
] as const;

const GOVERNANCE_PILLARS = [
  {
    title: "Permissions",
    detail: "hide · disable · readonly · forbidden before render",
    badge: "success-light" as const,
  },
  {
    title: "Density",
    detail: "compact · default · comfortable via render context",
    badge: "info-light" as const,
  },
  {
    title: "Tenant theme",
    detail: "brand-primary · secondary · accent override tokens",
    badge: "primary-light" as const,
  },
  {
    title: "Audit trail",
    detail: "diagnosticsEnabled · correlationId · telemetry sink",
    badge: "warning-light" as const,
  },
] as const;

function PreviewMock({ bars }: { bars: readonly string[] }) {
  return (
    <div aria-hidden className="mt-4 space-y-2">
      {bars.map((bar, index) => (
        <div
          className={cn("h-2 rounded-full", bar)}
          key={bar}
          style={{ width: `${88 - index * 18}%` }}
        />
      ))}
    </div>
  );
}

function DensityPreview({
  mode,
  density,
}: {
  mode: string;
  density?: "compact" | "comfortable";
}) {
  return (
    <Card
      className="gap-0 overflow-hidden rounded-3xl border-border bg-card py-0 shadow-sm"
      data-density={density}
    >
      <CardContent className="space-y-3 p-4">
        <Badge variant="outline">{mode}</Badge>
        <div className="space-y-2">
          <div className="control-density rounded-control border border-border bg-surface-muted" />
          <div className="row-density rounded-control border border-border bg-surface-accent/60" />
          <div className="row-density rounded-control border border-border bg-surface-accent/40" />
        </div>
      </CardContent>
    </Card>
  );
}

function Introduction() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 py-10 md:gap-20 md:px-10 md:py-14">
        <section
          aria-labelledby="hero-title"
          className="relative overflow-hidden rounded-4xl border border-border bg-surface p-8 shadow-md md:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-chart-3/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 size-64 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="max-w-3xl space-y-6">
              <Badge variant="secondary">Metadata-driven ERP UI</Badge>
              <div className="space-y-4">
                <h1
                  className="font-semibold text-4xl tracking-tight md:text-5xl"
                  id="hero-title"
                >
                  Build every ERP surface from governed metadata.
                </h1>
                <p className="text-lg text-muted-foreground leading-8">
                  One contract. Many modules. Consistent UI — dashboards, lists,
                  forms, approvals, audit panels, and workspace surfaces from a
                  single enterprise rendering runtime.
                </p>
                <p className="text-muted-foreground text-sm">
                  Metadata controls the interface. The package renders; it does
                  not own authority, business logic, or server-side policy.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button>Explore runtime</Button>
                <Button variant="outline">View contracts</Button>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 lg:border-border lg:border-l lg:pl-8">
              <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Manifest
              </p>
              <p className="font-semibold text-4xl text-foreground tabular-nums">
                36
              </p>
              <p className="text-muted-foreground text-xs leading-5">
                26 registry renderers
                <br />
                10 state renderers
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="command-map-title" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-xl" id="command-map-title">
              Contract → surface command map
            </h2>
            <p className="max-w-2xl text-muted-foreground text-sm">
              The signature path from declarative metadata to governed UI and
              audit-ready diagnostics.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-surface-accent/40 p-4 shadow-sm md:p-6">
            <ol className="flex min-w-max items-center gap-2 md:gap-3">
              {COMMAND_MAP.map((step, index) => (
                <li className="flex items-center gap-2 md:gap-3" key={step.label}>
                  <div className="min-w-[9.5rem] rounded-3xl border border-border bg-card px-4 py-3 shadow-xs">
                    <p className="font-medium text-foreground text-sm">
                      {step.label}
                    </p>
                    <p className="mt-1 font-mono text-muted-foreground text-[0.65rem]">
                      {step.code}
                    </p>
                  </div>
                  {index < COMMAND_MAP.length - 1 ? (
                    <span
                      aria-hidden
                      className="font-mono text-muted-foreground/60 text-xs"
                    >
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="bento-title" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-xl" id="bento-title">
              Metadata surfaces
            </h2>
            <p className="text-muted-foreground text-sm">
              Eight governed surface families — each card maps to manifest
              orchestrators and compose groups.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-4 md:grid-cols-4">
            {BENTO_SURFACES.map((surface) => (
              <Card
                className={cn(
                  "gap-0 rounded-3xl border-border bg-card py-0 shadow-sm transition-shadow hover:shadow-md",
                  surface.featured && "border-primary/25 bg-primary/5",
                  surface.className,
                )}
                key={surface.title}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <Badge className="mb-4 w-fit" variant={surface.badge}>
                    {surface.title}
                  </Badge>
                  <CardTitle className="text-lg">{surface.title}</CardTitle>
                  <CardDescription className="mt-2 flex-1 text-sm leading-6">
                    {surface.body}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="preview-title" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-xl" id="preview-title">
              Live preview strip
            </h2>
            <p className="text-muted-foreground text-sm">
              Dashboard, list, form, and audit surfaces share one token contract.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_STRIPS.map((preview) => (
              <Card
                className={cn(
                  "gap-0 rounded-3xl border py-0 shadow-sm",
                  preview.tone,
                )}
                key={preview.label}
              >
                <CardContent className="p-5">
                  <Badge variant="outline">{preview.label}</Badge>
                  <PreviewMock bars={preview.bars} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="density-title" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-xl" id="density-title">
              Density modes
            </h2>
            <p className="text-muted-foreground text-sm">
              Render context drives control height and table row rhythm via
              design tokens.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {DENSITY_MODES.map((item) => (
              <DensityPreview
                density={item.attr}
                key={item.mode}
                mode={item.mode}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="governance-title" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-xl" id="governance-title">
              Enterprise governance
            </h2>
            <p className="text-muted-foreground text-sm">
              Permissions, density, tenant theming, and audit — all token-native.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {GOVERNANCE_PILLARS.map((pillar) => (
              <Card
                className="gap-0 rounded-3xl border-border bg-card py-0 shadow-sm"
                key={pillar.title}
              >
                <CardHeader className="pb-2">
                  <Badge className="w-fit" variant={pillar.badge}>
                    {pillar.title}
                  </Badge>
                  <CardTitle className="text-base">{pillar.title}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {pillar.detail}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-border" />

        <section className="rounded-4xl border border-primary/20 bg-primary/5 p-8 shadow-md md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <Badge variant="primary-light">Metadata command center</Badge>
              <h2 className="font-semibold text-2xl tracking-tight md:text-3xl">
                Build one surface from metadata. Ship the whole module next.
              </h2>
              <p className="text-muted-foreground text-sm leading-7">
                Start with a renderer matrix story, validate governance and
                density, then compose the full ERP workspace from the same
                contract.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button size="lg">Open renderer matrices</Button>
              <Button size="lg" variant="outline">
                Browse compose registry
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const meta = {
  title: "Introduction/Overview",
  component: Introduction,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Introduction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
