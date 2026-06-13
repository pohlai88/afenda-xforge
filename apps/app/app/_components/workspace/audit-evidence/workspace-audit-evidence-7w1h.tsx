"use client";

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";
import {
  WORKSPACE_METADATA_LABEL_CLASS,
  WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
} from "../workspace-shell.classes.ts";
import type {
  WorkspaceAuditEvidenceEvent,
  WorkspaceAuditEvidenceOutcome,
} from "./workspace-audit-evidence.contract.ts";

const OUTCOME_BADGE_CLASS: Record<WorkspaceAuditEvidenceOutcome, string> = {
  denied: "border-destructive/40 bg-destructive/10 text-destructive",
  failure: "border-destructive/40 bg-destructive/10 text-destructive",
  success:
    "border-success-border bg-success-muted text-success-muted-foreground",
};

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): ReactElement {
  return (
    <div className="grid gap-1 border-border/60 border-b py-2 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
      <dt className={WORKSPACE_METADATA_LABEL_CLASS}>{label}</dt>
      <dd className="min-w-0 text-[12px] text-foreground leading-5">{value}</dd>
    </div>
  );
}

export function WorkspaceAuditEvidence7W1HDetail({
  event,
}: {
  event: WorkspaceAuditEvidenceEvent;
}): ReactElement {
  const occurredLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(event.occurredAt));

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-sm leading-5">{event.summary}</h3>
          <Badge
            className={cn("text-[10px]", OUTCOME_BADGE_CLASS[event.outcome])}
            variant="outline"
          >
            {event.outcome}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">{event.action}</p>
      </div>

      <div
        className={cn(
          "flex flex-col",
          WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS
        )}
        data-slot="workspace-audit-metadata-sections"
      >
        <section>
          <h4 className={WORKSPACE_METADATA_LABEL_CLASS}>7W1H evidence</h4>
          <dl className={WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS}>
            <DetailRow
              label="Who"
              value={`${event.actorId}${event.actorRole ? ` · ${event.actorRole}` : ""} (${event.actorType})`}
            />
            <DetailRow
              label="Whom"
              value={
                event.subjectType && event.subjectId
                  ? `${event.subjectType}:${event.subjectId}`
                  : "—"
              }
            />
            <DetailRow label="What" value={event.summary} />
            <DetailRow label="When" value={occurredLabel} />
            <DetailRow
              label="Where"
              value={
                [event.module, event.surface, event.route]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
            <DetailRow
              label="Why"
              value={
                event.reason || event.policyReference || event.approvalId || "—"
              }
            />
            <DetailRow
              label="Which"
              value={
                event.targetDisplayName ??
                `${event.targetType}:${event.targetId}`
              }
            />
            <DetailRow
              label="How"
              value={[event.channel, event.requestId, event.operationId]
                .filter(Boolean)
                .join(" · ")}
            />
          </dl>
        </section>

        <section>
          <h4 className={WORKSPACE_METADATA_LABEL_CLASS}>Field changes</h4>
          {event.diff.length > 0 ? (
            <div
              className={cn(
                WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
                "overflow-hidden rounded-md border border-border"
              )}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className={cn("h-8", WORKSPACE_METADATA_LABEL_CLASS)}
                    >
                      Field
                    </TableHead>
                    <TableHead
                      className={cn("h-8", WORKSPACE_METADATA_LABEL_CLASS)}
                    >
                      Before
                    </TableHead>
                    <TableHead
                      className={cn("h-8", WORKSPACE_METADATA_LABEL_CLASS)}
                    >
                      After
                    </TableHead>
                    <TableHead
                      className={cn("h-8", WORKSPACE_METADATA_LABEL_CLASS)}
                    >
                      Change
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.diff.map((entry) => (
                    <TableRow key={`${event.id}-${entry.field}`}>
                      <TableCell className="py-2 font-mono text-[11px]">
                        {entry.field}
                      </TableCell>
                      <TableCell className="py-2 text-[11px]">
                        {formatAuditValue(entry.oldValue)}
                      </TableCell>
                      <TableCell className="py-2 text-[11px]">
                        {formatAuditValue(entry.newValue)}
                      </TableCell>
                      <TableCell className="py-2 text-[11px] capitalize">
                        {entry.change ?? "changed"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              No field-level diff was recorded for this event.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
