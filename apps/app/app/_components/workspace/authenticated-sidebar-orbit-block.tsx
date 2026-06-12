"use client";

import { Badge } from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import { Orbit } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import {
  ORBIT_STATUS_TONE,
  ORBIT_WORKLOAD_SNAPSHOT,
} from "./orbit-workload.constants.ts";

export function AuthenticatedSidebarOrbitBlock(): ReactElement {
  const workload = ORBIT_WORKLOAD_SNAPSHOT;
  const tone = ORBIT_STATUS_TONE[workload.status];

  return (
    <Link
      className={cn(
        WORKSPACE_SHELL_SPACE.navRow,
        "flex min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3 transition-colors hover:bg-sidebar-accent/50"
      )}
      href="/orbit"
      title="Open Orbit — today's workload"
    >
      <div className="flex items-center gap-2">
        <Orbit className="size-4 shrink-0 text-sidebar-foreground/80" />
        <span className={WORKSPACE_SHELL_TYPE.navItem}>Workload today</span>
        <Badge className={cn("ml-auto text-[10px]", tone.badge)} variant="secondary">
          {tone.label}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br p-0.5",
            tone.ring
          )}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-sidebar">
            <span className="font-semibold text-lg tabular-nums leading-none">
              {workload.capacityPercent}%
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-border">
            <div
              className={cn("h-full rounded-full", tone.progress)}
              style={{ width: `${workload.capacityPercent}%` }}
            />
          </div>
          <p className="truncate text-muted-foreground text-xs">
            {workload.openTasks} open · {workload.meetingsToday} meetings
          </p>
          <p className="truncate text-sidebar-foreground text-xs">
            Focus: {workload.focus}
          </p>
        </div>
      </div>
    </Link>
  );
}
