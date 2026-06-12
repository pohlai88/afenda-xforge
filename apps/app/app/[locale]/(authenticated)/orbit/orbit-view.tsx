"use client";

import { Badge } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import {
  getOrbitFilledSlaSegments,
  ORBIT_SLA_METER_SEGMENT_IDS,
  ORBIT_STATUS_TONE,
  ORBIT_WORKLOAD_SNAPSHOT,
} from "../../../_components/workspace/orbit-workload.constants.ts";

export function OrbitView(): ReactElement {
  const workload = ORBIT_WORKLOAD_SNAPSHOT;
  const tone = ORBIT_STATUS_TONE[workload.status];
  const filledSegments = getOrbitFilledSlaSegments(workload.slaPercent);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.16em]">
            System condition
          </p>
          <Badge className={cn("uppercase tracking-[0.12em]", tone.text)}>
            {tone.label}
          </Badge>
        </div>

        <div className="mt-8 space-y-2">
          <p className="flex items-center gap-2 font-semibold text-2xl text-card-foreground">
            <span
              aria-hidden="true"
              className={cn("size-2.5 rounded-full", tone.dot)}
            />
            {workload.orbitName}
          </p>
          <p className="text-muted-foreground text-sm">
            {workload.openCount} open · {workload.dueTodayCount} due today
          </p>
        </div>

        <div className="mt-8 space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
            Next SLA
          </p>
          <p className="font-medium text-card-foreground text-sm">
            {workload.nextEventLabel} · {workload.nextTimeLeftText}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
              SLA health
            </p>
            <p className="font-semibold text-card-foreground text-sm">
              {workload.slaPercent}% {workload.slaSafetyLabel}
            </p>
          </div>
          <meter
            aria-label={`SLA ${workload.slaPercent}% ${workload.slaSafetyLabel}`}
            className="sr-only"
            max={100}
            min={0}
            value={workload.slaPercent}
          />
          <div aria-hidden="true" className="grid grid-cols-10 gap-1">
            {ORBIT_SLA_METER_SEGMENT_IDS.map((segmentId, index) => {
              const isFilled = index < filledSegments;

              return (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 rounded-[2px]",
                    isFilled ? tone.meter : "bg-muted"
                  )}
                  key={segmentId}
                />
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-muted-foreground text-sm">
          Static scaffold signal. Replace this snapshot with the Orbit service
          when governed workload telemetry is ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Open work" value={`${workload.openCount} open`} />
        <KpiCard
          label="Due today"
          value={String(workload.dueTodayCount)}
        />
        <KpiCard
          label="Next SLA"
          value={`${workload.nextEventLabel} · ${workload.nextTimeLeftText}`}
          valueClassName="text-base"
        />
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
