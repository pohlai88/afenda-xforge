"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";

import {
  IntroductionAtmosphere,
  MetadataOrbitStage,
} from "./metadata-orbit-layout";

type MutationId = "status" | "owner" | "threshold" | "permission";

const MUTATIONS = {
  status: {
    label: "Rename status field",
    before: "purchase_order.status",
    after: "purchase_order.approval_state",
    summary: "One metadata rename updates every surface.",
    verb: "labels synced",
  },
  owner: {
    label: "Change owner model",
    before: "owner_id",
    after: "accountable_team_id",
    summary: "Ownership logic propagates across workspace, reports, and audit.",
    verb: "owners remapped",
  },
  threshold: {
    label: "Raise approval threshold",
    before: "approval_threshold = 25,000",
    after: "approval_threshold = 50,000",
    summary: "Policy, form validation, and workflow routing stay aligned.",
    verb: "rules updated",
  },
  permission: {
    label: "Switch permission state",
    before: "purchase_order.edit",
    after: "purchase_order.readonly",
    summary: "Actions, forms, and audit behavior respond instantly.",
    verb: "access reshaped",
  },
} as const;

const SURFACES = [
  "Dashboard",
  "Approval Workflow",
  "Vendor Portal",
  "Mobile",
  "Audit Trail",
  "Reports",
  "Search Index",
  "API",
  "Executive View",
  "Integrations",
  "Notifications",
  "Policy Console",
] as const;

const ORBIT_RADIUS = 250;

function MetadataLivingCanvas() {
  const [mutationId, setMutationId] = useState<MutationId>("status");
  const [wave, setWave] = useState(0);

  const mutation = useMemo(() => MUTATIONS[mutationId], [mutationId]);

  useEffect(() => {
    setWave((current) => current + 1);
  }, [mutationId]);

  const selectMutation = (id: MutationId) => {
    setMutationId(id);
  };

  const orbitNodes = SURFACES.map((surface) => ({
    id: surface,
    label: surface,
    subtitle: mutation.verb,
  }));

  return (
    <main className="bg-background text-foreground">
      <section className="relative flex min-h-screen flex-col overflow-x-clip">
        <IntroductionAtmosphere />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-primary shadow-[0_0_32px_var(--primary)] motion-safe:animate-pulse" />
            <span className="font-mono text-muted-foreground text-xs">
              AFENDA METADATA UI
            </span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline">tenant-aware</Badge>
            <Badge variant="outline">governed</Badge>
            <Badge variant="outline">audit-ready</Badge>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-start gap-10 px-6 pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="max-w-xl">
            <Badge className="mb-5" variant="secondary">
              One contract. Every surface.
            </Badge>

            <h1 className="text-balance font-semibold text-5xl tracking-tight md:text-7xl">
              Change metadata once.
              <span className="block text-primary">Watch ERP reshape.</span>
            </h1>

            <p className="mt-6 text-pretty text-base text-muted-foreground leading-7 md:text-lg">
              Afenda Metadata UI turns schema, permission, policy, density, and
              renderer decisions into a living interface system.
            </p>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {(Object.keys(MUTATIONS) as MutationId[]).map((id) => (
                <Button
                  aria-pressed={mutationId === id}
                  className="justify-start"
                  key={id}
                  onClick={() => selectMutation(id)}
                  variant={mutationId === id ? "default" : "outline"}
                >
                  {MUTATIONS[id].label}
                </Button>
              ))}
            </div>
          </div>

          <div
            aria-label="Metadata mutation propagation preview"
            className="flex w-full flex-col gap-6"
          >
            <MetadataOrbitStage
              hubClassName="w-[22rem] max-w-[calc(100vw-3rem)] rounded-4xl border border-primary/30 bg-card/85 p-6 shadow-md backdrop-blur-xl"
              nodes={orbitNodes}
              radius={ORBIT_RADIUS}
              wave={wave}
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="primary-light">Metadata Mutation</Badge>
                <span className="font-mono text-[0.65rem] text-muted-foreground">
                  live · wave {wave}
                </span>
              </div>

              <p className="font-mono text-muted-foreground text-xs">before</p>
              <p className="mt-1 rounded-lg border bg-surface-muted/40 px-3 py-2 font-mono text-xs">
                {mutation.before}
              </p>

              <div className="my-4 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">becomes</span>
                <Separator className="flex-1" />
              </div>

              <p className="font-mono text-muted-foreground text-xs">after</p>
              <p className="mt-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-primary text-xs">
                {mutation.after}
              </p>

              <p className="mt-5 text-muted-foreground text-sm leading-6">
                {mutation.summary}
              </p>
            </MetadataOrbitStage>

            <div className="rounded-3xl border bg-card/80 p-4 shadow-md backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                {[
                  ["36", "renderers"],
                  ["12", "surfaces"],
                  ["4", "states"],
                  ["1", "contract"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-semibold text-2xl text-primary">{value}</p>
                    <p className="font-mono text-[0.65rem] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Introduction/Mutation Orbit",
  component: MetadataLivingCanvas,
  parameters: {
    layout: "fullscreen",
    forcedTheme: "dark",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataLivingCanvas>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
