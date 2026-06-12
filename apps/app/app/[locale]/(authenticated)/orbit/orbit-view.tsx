"use client";

import { Badge } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";

type OrbitLoadStatus = "high" | "balanced" | "low";

const workload: {
  capacityPercent: number;
  focus: string;
  meetingsToday: number;
  openTasks: number;
  status: OrbitLoadStatus;
} = {
  capacityPercent: 72,
  focus: "Ship infrastructure matrix scaffold",
  openTasks: 14,
  meetingsToday: 3,
  status: "high",
};

const statusTone: Record<
  OrbitLoadStatus,
  { label: string; ring: string; badge: string }
> = {
  high: {
    label: "High load",
    ring: "from-amber-400 via-orange-500 to-red-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  balanced: {
    label: "Balanced",
    ring: "from-emerald-400 via-teal-500 to-cyan-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  low: {
    label: "Light day",
    ring: "from-sky-400 via-blue-500 to-indigo-500",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
};

export function OrbitView(): ReactElement {
  const tone = statusTone[workload.status];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div
          className={cn(
            "relative flex size-44 items-center justify-center rounded-full bg-gradient-to-br p-1 shadow-sm",
            tone.ring
          )}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-background">
            <span className="font-semibold text-4xl tabular-nums tracking-tight">
              {workload.capacityPercent}%
            </span>
            <span className="text-muted-foreground text-xs">today load</span>
          </div>
        </div>
        <Badge className={tone.badge}>{tone.label}</Badge>
        <p className="text-center text-muted-foreground text-sm">
          Orbit is your workload compass — connect Eisenhower tasks later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Open tasks" value={String(workload.openTasks)} />
        <KpiCard
          label="Meetings today"
          value={String(workload.meetingsToday)}
        />
        <KpiCard label="Focus" value={workload.focus} valueClassName="text-base" />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}): ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-semibold text-2xl leading-snug",
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
}
