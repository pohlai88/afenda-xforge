"use client";

import { Badge, Input } from "@repo/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { useDeferredValue, useMemo, useState } from "react";
import type { WorkspaceAuditEvidenceEvent } from "./workspace-audit-evidence.contract.ts";

const OUTCOME_BADGE_CLASS = {
  denied: "border-destructive/40 bg-destructive/10 text-destructive",
  failure: "border-destructive/40 bg-destructive/10 text-destructive",
  success: "border-success-border bg-success-muted text-success-muted-foreground",
} as const;

function formatWhen(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WorkspaceAuditEvidenceStreamTable({
  events,
  onSelect,
  selectedEventId,
}: {
  events: readonly WorkspaceAuditEvidenceEvent[];
  onSelect: (event: WorkspaceAuditEvidenceEvent) => void;
  selectedEventId: string | null;
}): ReactElement {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredEvents = useMemo(() => {
    if (!deferredQuery) {
      return events;
    }

    return events.filter((event) => {
      const haystack = [
        event.summary,
        event.action,
        event.actorId,
        event.outcome,
        event.targetType,
        event.targetId,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredQuery);
    });
  }, [deferredQuery, events]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        aria-label="Search audit activity"
        className="h-8 text-[12px]"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search summary, actor, action..."
        value={query}
      />

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
        <Table>
          <TableHeader className="sticky top-0 z-layer-sticky bg-background">
            <TableRow>
              <TableHead className="h-8 text-[10px]">When</TableHead>
              <TableHead className="h-8 text-[10px]">Who</TableHead>
              <TableHead className="h-8 text-[10px]">What</TableHead>
              <TableHead className="h-8 text-[10px]">Outcome</TableHead>
              <TableHead className="h-8 text-[10px]">Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow
                className={cn(
                  "cursor-pointer",
                  selectedEventId === event.id && "bg-muted/50"
                )}
                key={event.id}
                onClick={() => onSelect(event)}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    onSelect(event);
                  }
                }}
                tabIndex={0}
              >
                <TableCell className="py-2 text-[11px] tabular-nums">
                  {formatWhen(event.occurredAt)}
                </TableCell>
                <TableCell className="py-2 text-[11px]">{event.actorId}</TableCell>
                <TableCell className="max-w-[16rem] truncate py-2 text-[11px]">
                  {event.summary}
                </TableCell>
                <TableCell className="py-2">
                  <Badge
                    className={cn(
                      "text-[10px]",
                      OUTCOME_BADGE_CLASS[event.outcome]
                    )}
                    variant="outline"
                  >
                    {event.outcome}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-[11px] tabular-nums">
                  {event.diff.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
