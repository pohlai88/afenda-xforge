"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/compose/alert";
import { DataGridDenseTable } from "@repo/ui/components/compose/data-grid";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@repo/ui/components/compose/field";
import { PreviewKanban } from "@repo/ui/components/compose/kanban";
import { renderLineChartPattern } from "@repo/ui/components/compose/line-chart";
import { renderStatisticCardPattern } from "@repo/ui/components/compose/statistic-card";
import { Input } from "@repo/ui/components/input";
import { Kbd, KbdGroup } from "@repo/ui/components/kbd";
import { Separator } from "@repo/ui/components/separator";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@repo/ui/components/ui/command";
import { cn } from "@repo/ui/lib/utils";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type SurfaceId = "dashboard" | "list" | "form" | "audit" | "kanban";
type MutationId = "status" | "owner" | "threshold" | "permission";
type DensityMode = "compact" | "default" | "comfortable";
type PermissionMode = "allow" | "readonly" | "forbidden";

type DeskEvent = {
  id: string;
  at: string;
  message: string;
  tone: "default" | "success" | "warning" | "destructive";
};

function deskEventBadgeVariant(tone: DeskEvent["tone"]) {
  if (tone === "success") {
    return "success-light";
  }
  if (tone === "destructive") {
    return "destructive-light";
  }
  return "outline";
}

const MUTATIONS = {
  status: {
    label: "Rename status",
    before: "purchase_order.status",
    after: "purchase_order.approval_state",
    summary: "One metadata rename updates every surface.",
    verb: "labels synced",
  },
  owner: {
    label: "Change owner",
    before: "owner_id",
    after: "accountable_team_id",
    summary: "Ownership propagates across workspace, reports, and audit.",
    verb: "owners remapped",
  },
  threshold: {
    label: "Raise threshold",
    before: "approval_threshold = 25,000",
    after: "approval_threshold = 50,000",
    summary: "Policy, validation, and workflow routing stay aligned.",
    verb: "rules updated",
  },
  permission: {
    label: "Flip permission",
    before: "purchase_order.edit",
    after: "purchase_order.readonly",
    summary: "Actions, forms, and audit behavior respond instantly.",
    verb: "access reshaped",
  },
} as const;

const DESK_SURFACES = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    entity: "procurement.dashboard",
    renderer: "section.statistic-grid",
    compose: ["statistic-card", "line-chart"],
  },
  {
    id: "list" as const,
    label: "List",
    entity: "purchase-order.list",
    renderer: "section.data-grid",
    compose: ["data-grid"],
  },
  {
    id: "form" as const,
    label: "Form",
    entity: "purchase-order.form",
    renderer: "field.group",
    compose: ["field", "input-group"],
  },
  {
    id: "audit" as const,
    label: "Audit",
    entity: "runtime.audit-panel",
    renderer: "state.audit-stream",
    compose: ["timeline", "alert"],
  },
  {
    id: "kanban" as const,
    label: "Approvals",
    entity: "workflow.approval-board",
    renderer: "section.kanban",
    compose: ["kanban"],
  },
] as const;

const PROPAGATION_SURFACES = [
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

const PIPELINE = ["Context", "Registry", "Governance", "Render"] as const;

const REGISTRY_MAP = [
  "field.input",
  "action.button",
  "section.data-grid",
  "section.kanban",
  "state.forbidden",
  "statistic-card",
  "line-chart",
  "timeline",
  "alert",
] as const;

const PERMISSION_LABELS: Record<PermissionMode, string> = {
  allow: "render",
  readonly: "readonly",
  forbidden: "forbidden",
};

function nowStamp() {
  return new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ComposeCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-auto p-4 md:p-5",
        "[&_[data-slot=card-header]]:hidden",
        "[&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:shadow-none",
        "[&_[data-slot=card-content]]:p-0",
        "[&_.min-h-\\[280px\\]]:min-h-0",
        "[&_.min-h-\\[220px\\]]:min-h-0",
        "[&_.min-h-\\[260px\\]]:min-h-0",
        "[&_.rounded-xl.bg-muted\\/35]:rounded-none [&_.rounded-xl.bg-muted\\/35]:border-0 [&_.rounded-xl.bg-muted\\/35]:bg-transparent [&_.rounded-xl.bg-muted\\/35]:p-0",
        "[&_.rounded-lg.bg-muted\\/40]:rounded-none [&_.rounded-lg.bg-muted\\/40]:border-0 [&_.rounded-lg.bg-muted\\/40]:bg-transparent [&_.rounded-lg.bg-muted\\/40]:p-0"
      )}
    >
      {children}
    </div>
  );
}

function SurfacePreview({
  surface,
  mutation,
}: {
  surface: SurfaceId;
  mutation: (typeof MUTATIONS)[MutationId];
}) {
  switch (surface) {
    case "dashboard":
      return (
        <div className="space-y-4">
          {renderStatisticCardPattern("statistic-card-1")}
          {renderLineChartPattern("line-chart-3")}
        </div>
      );
    case "list":
      return <DataGridDenseTable />;
    case "form":
      return (
        <FieldSet className="mx-auto max-w-lg rounded-lg border border-border bg-card p-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cmd-entity">Entity name</FieldLabel>
              <Input defaultValue="Purchase order" id="cmd-entity" />
              <FieldDescription>
                {mutation.after.split(".")[0]}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="cmd-threshold">
                Approval threshold
              </FieldLabel>
              <Input
                defaultValue={
                  mutation.label.includes("threshold") ? "50000" : "25000"
                }
                id="cmd-threshold"
                inputMode="numeric"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cmd-owner">Owner model</FieldLabel>
              <Input
                defaultValue={
                  mutation.label.includes("owner")
                    ? "accountable_team_id"
                    : "owner_id"
                }
                id="cmd-owner"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      );
    case "audit":
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <Alert variant="warning">
            <AlertTitle>Runtime · {mutation.verb}</AlertTitle>
            <AlertDescription>{mutation.summary}</AlertDescription>
          </Alert>
          <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs leading-6">
            <p className="text-muted-foreground">
              {nowStamp()} · mutation.applied
            </p>
            <p className="text-foreground">
              {mutation.before} → {mutation.after}
            </p>
            <Separator className="my-3 bg-border/60" />
            <p className="text-muted-foreground">
              {nowStamp()} · surface.propagated
            </p>
            <p className="text-foreground">
              12 downstream surfaces · {mutation.verb}
            </p>
          </div>
        </div>
      );
    case "kanban":
      return <PreviewKanban />;
    default:
      return null;
  }
}

function PropagationOrbit({ wave, verb }: { wave: number; verb: string }) {
  const size = 88;
  const radius = 34;
  const center = size / 2;

  return (
    <div aria-hidden className="relative size-[5.5rem] shrink-0">
      <svg aria-hidden className="size-full" viewBox={`0 0 ${size} ${size}`}>
        <title>Propagation orbit</title>
        <circle
          className="motion-safe:animate-pulse"
          cx={center}
          cy={center}
          fill="none"
          r={radius + 6}
          stroke="var(--primary)"
          strokeOpacity={0.15}
          strokeWidth={1}
        />
        {PROPAGATION_SURFACES.map((surface, index) => {
          const angle =
            (index / PROPAGATION_SURFACES.length) * Math.PI * 2 - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;

          return (
            <g key={`${surface}-${wave}`}>
              <line
                stroke="var(--primary)"
                strokeOpacity={0.22}
                strokeWidth={1}
                x1={center}
                x2={x}
                y1={center}
                y2={y}
              />
              <circle cx={x} cy={y} fill="var(--primary)" r={2.5} />
            </g>
          );
        })}
        <circle cx={center} cy={center} fill="var(--primary)" r={5} />
      </svg>
      <p className="absolute inset-x-0 bottom-0 truncate text-center font-mono text-[0.55rem] text-muted-foreground">
        {verb}
      </p>
    </div>
  );
}

function MetadataCommandPalette({
  open,
  onOpenChange,
  onMutation,
  onSurface,
  onDensity,
  onPermission,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMutation: (id: MutationId) => void;
  onSurface: (id: SurfaceId) => void;
  onDensity: (mode: DensityMode) => void;
  onPermission: (mode: PermissionMode) => void;
}) {
  const closeThen = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandInput placeholder="Mutations, surfaces, density, governance..." />
      <CommandList>
        <CommandEmpty>No matching command.</CommandEmpty>
        <CommandGroup heading="Mutations">
          {(Object.keys(MUTATIONS) as MutationId[]).map((id) => (
            <CommandItem
              key={id}
              onSelect={() => closeThen(() => onMutation(id))}
            >
              {MUTATIONS[id].label}
              <CommandShortcut>{MUTATIONS[id].verb}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Surfaces">
          {DESK_SURFACES.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => closeThen(() => onSurface(item.id))}
            >
              {item.label}
              <CommandShortcut>{item.renderer}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Density">
          {(["compact", "default", "comfortable"] as const).map((mode) => (
            <CommandItem
              key={mode}
              onSelect={() => closeThen(() => onDensity(mode))}
            >
              Set density · {mode}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Governance">
          {(["allow", "readonly", "forbidden"] as const).map((mode) => (
            <CommandItem
              key={mode}
              onSelect={() => closeThen(() => onPermission(mode))}
            >
              Permission · {mode}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function MetadataCommandSurface() {
  const [surfaceId, setSurfaceId] = useState<SurfaceId>("dashboard");
  const [mutationId, setMutationId] = useState<MutationId>("status");
  const [wave, setWave] = useState(0);
  const [density, setDensity] = useState<DensityMode>("default");
  const [permission, setPermission] = useState<PermissionMode>("allow");
  const [commandOpen, setCommandOpen] = useState(false);
  const [events, setEvents] = useState<DeskEvent[]>(() => [
    {
      id: "boot",
      at: nowStamp(),
      message: "Command surface online · 36 renderers · 12 propagation targets",
      tone: "success",
    },
  ]);

  const surface = useMemo(
    () =>
      DESK_SURFACES.find((item) => item.id === surfaceId) ?? DESK_SURFACES[0],
    [surfaceId]
  );
  const mutation = MUTATIONS[mutationId];

  const surfaceIndex = DESK_SURFACES.findIndex((item) => item.id === surfaceId);
  const peekLayers = useMemo(() => {
    const count = DESK_SURFACES.length;
    const back =
      DESK_SURFACES[(surfaceIndex - 1 + count) % count] ?? DESK_SURFACES[0];
    const front = DESK_SURFACES[(surfaceIndex + 1) % count] ?? DESK_SURFACES[0];
    return [back, front] as const;
  }, [surfaceIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      setCommandOpen((current) => !current);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const pushEvent = (message: string, tone: DeskEvent["tone"] = "default") => {
    setEvents((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowStamp(),
        message,
        tone,
      },
      ...current.slice(0, 9),
    ]);
  };

  const selectMutation = (id: MutationId) => {
    setMutationId(id);
    setWave((current) => current + 1);
    pushEvent(
      `Mutation · ${MUTATIONS[id].label} · ${MUTATIONS[id].verb}`,
      "success"
    );
    if (id === "permission") {
      setPermission("readonly");
    }
  };

  const selectSurface = (id: SurfaceId) => {
    const next = DESK_SURFACES.find((item) => item.id === id);
    if (!next) {
      return;
    }
    setSurfaceId(id);
    pushEvent(`Canvas · ${next.label} · ${next.renderer}`);
  };

  const selectDensity = (mode: DensityMode) => {
    setDensity(mode);
    pushEvent(`Density · ${mode}`);
  };

  const selectPermission = (mode: PermissionMode) => {
    setPermission(mode);
    pushEvent(
      `Governance · ${PERMISSION_LABELS[mode]}`,
      mode === "forbidden" ? "destructive" : "success"
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--primary)/16%,transparent_42%),radial-gradient(circle_at_80%_100%,var(--brand-accent)/10%,transparent_40%)]"
      />
      <div
        aria-hidden
        className="sb-intro-grid-bg pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)/30_1px,transparent_1px),linear-gradient(to_bottom,var(--border)/30_1px,transparent_1px)] opacity-25"
      />

      <header className="relative z-10 border-border border-b bg-background/80 px-4 py-5 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="primary-light">Metadata Command Surface</Badge>
              <Badge variant="outline">36 renderers</Badge>
              <Badge variant="outline">12 surfaces</Badge>
              <Badge variant="success-light">wave {wave}</Badge>
            </div>
            <h1 className="max-w-3xl font-semibold text-3xl tracking-tight md:text-5xl">
              Change metadata once.
              <span className="block text-primary">
                Govern every surface in real time.
              </span>
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Button
              className="gap-2"
              onClick={() => setCommandOpen(true)}
              size="sm"
              variant="outline"
            >
              Command palette
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
            <p className="font-mono text-muted-foreground text-xs">
              Afenda · Northwind · 12/12 synced · {nowStamp()}
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-[96rem] flex-1 flex-col px-4 py-4 md:px-8 md:py-6">
        <section
          aria-label="Metadata command surface"
          className="flex min-h-[40rem] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-md ring-1 ring-border/60 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-border border-b bg-surface-muted/40 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">Operating desk</span>
              <Separator
                className="hidden h-4 sm:block"
                orientation="vertical"
              />
              <Badge variant="outline">Org · Northwind</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">Density</span>
              {(["compact", "default", "comfortable"] as const).map((mode) => (
                <Button
                  aria-pressed={density === mode}
                  key={mode}
                  onClick={() => selectDensity(mode)}
                  size="xs"
                  variant={density === mode ? "default" : "outline"}
                >
                  {mode}
                </Button>
              ))}
              <Separator
                className="hidden h-4 md:block"
                orientation="vertical"
              />
              <span className="text-muted-foreground text-xs">Permission</span>
              {(["allow", "readonly", "forbidden"] as const).map((mode) => (
                <Button
                  aria-pressed={permission === mode}
                  key={mode}
                  onClick={() => selectPermission(mode)}
                  size="xs"
                  variant={permission === mode ? "default" : "outline"}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
            <aside className="flex min-h-0 flex-col border-border border-b xl:border-r xl:border-b-0">
              <div className="border-border border-b px-4 py-3">
                <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                  Mutation engine
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-3">
                {(Object.keys(MUTATIONS) as MutationId[]).map((id) => (
                  <Button
                    aria-pressed={mutationId === id}
                    className="h-auto justify-start px-2 py-2 text-left text-xs"
                    key={id}
                    onClick={() => selectMutation(id)}
                    size="xs"
                    variant={mutationId === id ? "default" : "outline"}
                  >
                    {MUTATIONS[id].label}
                  </Button>
                ))}
              </div>

              <div className="mx-3 mb-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="primary-light">Live mutation</Badge>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    wave {wave}
                  </span>
                </div>
                <p className="font-mono text-[0.6rem] text-muted-foreground">
                  before
                </p>
                <p className="mt-1 truncate rounded border bg-surface-muted/50 px-2 py-1 font-mono text-[0.6rem]">
                  {mutation.before}
                </p>
                <p className="mt-2 font-mono text-[0.6rem] text-muted-foreground">
                  after
                </p>
                <p className="mt-1 truncate rounded border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[0.6rem] text-primary">
                  {mutation.after}
                </p>
              </div>

              <Separator className="bg-border/60" />

              <div className="border-border border-b px-4 py-3">
                <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                  Surface tree
                </p>
              </div>
              <nav
                aria-label="Metadata surfaces"
                className="min-h-0 flex-1 overflow-auto p-2"
              >
                {DESK_SURFACES.map((item, index) => (
                  <button
                    aria-current={surfaceId === item.id ? "page" : undefined}
                    className={cn(
                      "mb-1 flex w-full flex-col rounded-md border px-3 py-2 text-left motion-safe:transition-all motion-safe:duration-500",
                      surfaceId === item.id
                        ? "border-primary/35 bg-primary/10 text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-muted/40 hover:text-foreground",
                      wave > 0 && "border-primary/20 bg-primary/5"
                    )}
                    key={`${item.id}-${wave}`}
                    onClick={() => selectSurface(item.id)}
                    style={{ transitionDelay: `${index * 35}ms` }}
                    type="button"
                  >
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="mt-0.5 truncate font-mono text-[0.62rem]">
                      {item.entity}
                    </span>
                    <span className="mt-1 font-mono text-[0.58rem] text-primary/80">
                      {mutation.verb}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="border-border border-t p-3">
                <p className="mb-2 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.16em]">
                  Pipeline
                </p>
                <ol className="space-y-1.5">
                  {PIPELINE.map((step, index) => (
                    <li
                      className="flex items-center gap-2 font-mono text-[0.62rem]"
                      key={step}
                    >
                      <span className="flex size-5 items-center justify-center rounded-sm border border-border bg-surface-muted text-muted-foreground">
                        0{index + 1}
                      </span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <div
              className={cn(
                "relative flex min-h-[24rem] min-w-0 flex-col border-border border-b xl:border-r xl:border-b-0",
                wave > 0 && "motion-safe:ring-2 motion-safe:ring-primary/25"
              )}
              data-density={density === "default" ? undefined : density}
              key={`canvas-${wave}`}
            >
              <div className="relative flex items-center justify-between gap-3 border-border border-b px-4 py-2.5">
                <div>
                  <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.16em]">
                    Live compose canvas
                  </p>
                  <p className="mt-0.5 font-medium text-sm">{surface.label}</p>
                </div>
                <Badge variant="primary-light">{surface.renderer}</Badge>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)/8%,transparent_55%)]"
                />

                {peekLayers.map((peek, layerIndex) => (
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-3 overflow-hidden rounded-lg border border-border/40 bg-card/40 opacity-35 blur-[0.5px]",
                      layerIndex === 0
                        ? "translate-x-2 translate-y-2 scale-[0.985]"
                        : "translate-x-4 translate-y-4 scale-[0.97]"
                    )}
                    key={`peek-${peek.id}-${wave}`}
                  >
                    <div className="border-border border-b px-3 py-1.5">
                      <p className="font-mono text-[0.55rem] text-muted-foreground">
                        {peek.label} · {peek.renderer}
                      </p>
                    </div>
                    <div className="pointer-events-none max-h-32 overflow-hidden opacity-80 [&_*]:pointer-events-none">
                      <ComposeCanvas>
                        <SurfacePreview mutation={mutation} surface={peek.id} />
                      </ComposeCanvas>
                    </div>
                  </div>
                ))}

                {wave > 0 ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-primary/20 ring-inset motion-safe:animate-pulse"
                  />
                ) : null}

                <ComposeCanvas>
                  <SurfacePreview mutation={mutation} surface={surfaceId} />
                </ComposeCanvas>
              </div>

              {permission === "forbidden" ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                  <div className="rounded-xl border border-destructive-border bg-destructive-muted/40 px-6 py-5 text-center">
                    <Badge variant="destructive-light">forbidden</Badge>
                    <p className="mt-2 font-medium text-sm">
                      Governance blocked this surface
                    </p>
                    <p className="mt-1 font-mono text-muted-foreground text-xs">
                      evaluateMetadataGovernance() → hide
                    </p>
                  </div>
                </div>
              ) : null}

              {permission === "readonly" ? (
                <div className="border-border border-t bg-info-muted/20 px-4 py-2">
                  <Badge variant="info-light">readonly</Badge>
                  <span className="ml-2 text-muted-foreground text-xs">
                    Actions disabled · compose preview active
                  </span>
                </div>
              ) : null}
            </div>

            <aside className="flex min-h-0 flex-col">
              <div className="border-border border-b px-4 py-3">
                <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                  Contract inspector
                </p>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
                <InspectorBlock title="Mutation contract">
                  <InspectorRow label="before" value={mutation.before} />
                  <InspectorRow label="after" value={mutation.after} />
                  <InspectorRow label="effect" value={mutation.verb} />
                </InspectorBlock>

                <InspectorBlock title="Surface contract">
                  <InspectorRow label="entity" value={surface.entity} />
                  <InspectorRow label="renderer" value={surface.renderer} />
                  <InspectorRow
                    label="permission"
                    value={PERMISSION_LABELS[permission]}
                  />
                  <InspectorRow label="density" value={density} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {surface.compose.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </InspectorBlock>

                <InspectorBlock title="Registry map">
                  <div className="flex flex-wrap gap-1.5">
                    {REGISTRY_MAP.map((key) => {
                      const active = surface.compose.some((group) =>
                        key.startsWith(group)
                      );
                      return (
                        <Badge
                          key={key}
                          variant={active ? "primary-light" : "outline"}
                        >
                          {key}
                        </Badge>
                      );
                    })}
                  </div>
                </InspectorBlock>

                <InspectorBlock title="Runtime state">
                  <InspectorRow label="mode" value="preview" />
                  <InspectorRow label="diagnostics" value="enabled" />
                  <InspectorRow label="wave" value={String(wave)} />
                </InspectorBlock>
              </div>
            </aside>
          </div>

          <div className="border-border border-t bg-surface-muted/25">
            <div className="flex items-center gap-4 border-border border-b px-4 py-2">
              <PropagationOrbit verb={mutation.verb} wave={wave} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                  Propagation · {mutation.verb}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  One mutation hub · twelve downstream surfaces · live sync
                </p>
              </div>
              <Badge variant="primary-light">12/12 active</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {PROPAGATION_SURFACES.map((name, index) => (
                <div
                  className={cn(
                    "min-w-[9rem] shrink-0 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 motion-safe:transition-all motion-safe:duration-500"
                  )}
                  key={`${name}-${wave}`}
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  <p className="truncate font-medium text-xs">{name}</p>
                  <p className="mt-0.5 font-mono text-[0.58rem] text-muted-foreground">
                    {mutation.verb}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-border border-t px-4 py-2">
              <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                Audit event stream
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 py-3">
              {events.map((event) => (
                <div
                  className="min-w-[15rem] shrink-0 rounded-md border border-border bg-card px-3 py-2"
                  key={event.id}
                >
                  <Badge variant={deskEventBadgeVariant(event.tone)}>
                    {event.at}
                  </Badge>
                  <p className="mt-1.5 font-mono text-[0.62rem] leading-5">
                    {event.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <MetadataCommandPalette
        onDensity={selectDensity}
        onMutation={selectMutation}
        onOpenChange={setCommandOpen}
        onPermission={selectPermission}
        onSurface={selectSurface}
        open={commandOpen}
      />
    </div>
  );
}

function InspectorBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-muted/20 p-3">
      <p className="mb-2 font-medium text-foreground text-xs">{title}</p>
      {children}
    </div>
  );
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-0.5 font-mono text-[0.62rem]">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

const meta = {
  title: "Introduction/Command Surface",
  component: MetadataCommandSurface,
  parameters: {
    layout: "fullscreen",
    forcedTheme: "dark",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataCommandSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
