"use client";

import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";

import { MetadataOrbitStage } from "./metadata-orbit-layout";

type MomentId = "rename" | "policy" | "access";

const MOMENTS = {
  rename: {
    eyebrow: "Metadata mutation",
    title: "Rename once.",
    highlight: "Everywhere follows.",
    before: "purchase_order.status",
    after: "purchase_order.approval_state",
    result: "12 surfaces updated",
    tone: "Labels, filters, reports, audit, and API contracts stay aligned.",
  },
  policy: {
    eyebrow: "Governance mutation",
    title: "Change policy.",
    highlight: "Workflows reshape.",
    before: "approval_threshold = 25,000",
    after: "approval_threshold = 50,000",
    result: "4 workflows recalculated",
    tone: "Validation, approval routing, and executive dashboards sync instantly.",
  },
  access: {
    eyebrow: "Permission mutation",
    title: "Flip access.",
    highlight: "UI responds.",
    before: "purchase_order.edit",
    after: "purchase_order.readonly",
    result: "8 actions governed",
    tone: "Buttons, forms, command actions, and audit behavior update together.",
  },
} as const;

const SURFACES = [
  "Dashboard",
  "List",
  "Form",
  "Approval",
  "Audit",
  "Mobile",
  "API",
  "Search",
] as const;

const ORBIT_RADIUS = 280;

function BeastmodeMetadataKeynote() {
  const [momentId, setMomentId] = useState<MomentId>("rename");
  const [ready, setReady] = useState(false);
  const [wave, setWave] = useState(0);

  const moment = useMemo(() => MOMENTS[momentId], [momentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const selectMoment = (id: MomentId) => {
    setMomentId(id);
    setWave((current) => current + 1);
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,var(--primary)/18%,transparent_62%),radial-gradient(circle_at_85%_75%,var(--brand-accent)/10%,transparent_34%)]"
      />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6">
        <header className="flex items-center justify-between py-7">
          <p className="text-muted-foreground text-sm">Afenda Metadata UI</p>
          <Badge variant="outline">Keynote Preview</Badge>
        </header>

        <div className="grid flex-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p
              className={cn(
                "text-lg text-muted-foreground transition-all duration-700",
                ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              {moment.eyebrow}
            </p>

            <h1
              className={cn(
                "mt-5 text-balance font-semibold text-6xl tracking-tight transition-all delay-75 duration-700 md:text-8xl",
                ready ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              )}
            >
              {moment.title}
              <span className="block text-primary">{moment.highlight}</span>
            </h1>

            <p
              className={cn(
                "mt-8 max-w-xl text-pretty text-lg text-muted-foreground leading-8 transition-all delay-150 duration-700",
                ready ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              )}
            >
              Metadata becomes the operating system for ERP surfaces — calm,
              governed, and instantly consistent.
            </p>

            <div className="mt-10 inline-flex rounded-full border border-border/40 bg-muted/20 p-1 backdrop-blur-xl">
              {(Object.keys(MOMENTS) as MomentId[]).map((id) => (
                <button
                  aria-pressed={momentId === id}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm transition-all",
                    momentId === id
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={id}
                  onClick={() => selectMoment(id)}
                  type="button"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:max-w-none">
            <MetadataOrbitStage
              className="lg:justify-self-end"
              hubClassName={cn(
                "w-[25rem] max-w-[calc(100vw-3rem)] rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl transition-all duration-700",
                wave > 0 && "scale-[1.015] ring-primary/30"
              )}
              nodes={SURFACES.map((surface) => ({
                id: surface,
                label: surface,
                subtitle: "synced",
              }))}
              radius={ORBIT_RADIUS}
              wave={wave}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm">Metadata Core</p>
                <div className="w-12" />
              </div>

              <p className="font-mono text-muted-foreground text-xs">before</p>
              <p className="mt-2 rounded-xl border border-border/50 bg-surface-muted/30 px-4 py-3 font-mono text-sm">
                {moment.before}
              </p>

              <div className="my-6 flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">becomes</span>
                <Separator className="flex-1" />
              </div>

              <p className="font-mono text-muted-foreground text-xs">after</p>
              <p className="mt-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-primary text-sm">
                {moment.after}
              </p>

              <div className="mt-7 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="font-semibold text-2xl text-primary tracking-tight">
                  {moment.result}
                </p>
                <p className="mt-2 text-muted-foreground text-sm leading-6">
                  {moment.tone}
                </p>
              </div>
            </MetadataOrbitStage>
          </div>
        </div>

        <section className="grid grid-cols-3 divide-x divide-border/30 border-border/30 border-t py-12">
          {[
            ["36", "Renderers"],
            ["12", "Surfaces"],
            ["1", "Contract"],
          ].map(([value, label]) => (
            <div className="text-center" key={label}>
              <p className="font-semibold text-5xl tracking-tight">{value}</p>
              <p className="mt-2 text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

const meta = {
  title: "Introduction/Beastmode Keynote",
  component: BeastmodeMetadataKeynote,
  parameters: {
    layout: "fullscreen",
    forcedTheme: "dark",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BeastmodeMetadataKeynote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
