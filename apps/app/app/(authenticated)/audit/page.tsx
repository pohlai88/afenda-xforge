import type {
  DashboardKpiTone,
  DashboardTableRow,
  TableColumnMetadata,
} from "@repo/ui";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { ActivityTable } from "../_components/activity-table.tsx";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import { KpiCard } from "../_components/kpi-card.tsx";
import {
  StatusBadge,
  type StatusBadgeTone,
} from "../_components/status-badge.tsx";
import { loadAuditPageData } from "./_data.ts";

const auditColumns: readonly TableColumnMetadata[] = [
  { key: "occurredAt", label: "Occurred" },
  { key: "outcome", label: "Outcome" },
  { key: "summary", label: "Summary" },
  { key: "action", label: "Action" },
  { key: "actorRole", label: "Actor role" },
  { key: "actorType", label: "Actor type" },
  { key: "actorId", label: "Actor ID" },
  { key: "companyId", label: "Company ID" },
  { key: "grantId", label: "Grant ID" },
  { key: "module", label: "Module" },
  { key: "surface", label: "Surface" },
  { key: "route", label: "Route" },
  { key: "subjectType", label: "Subject type" },
  { key: "subjectId", label: "Subject ID" },
  { key: "targetType", label: "Target type" },
  { key: "targetId", label: "Target ID" },
  { key: "targetDisplayName", label: "Target" },
  { key: "reason", label: "Reason" },
  { key: "policyReference", label: "Policy" },
  { key: "approvalId", label: "Approval" },
  { key: "channel", label: "Channel" },
  { key: "requestId", label: "Request ID" },
  { key: "operationId", label: "Operation ID" },
  { key: "diffCount", label: "Diffs" },
  { key: "tenantId", label: "Tenant" },
] satisfies readonly TableColumnMetadata[];

const resolveOutcomeKpiTone = (
  outcome: string | null | undefined
): DashboardKpiTone => {
  if (outcome === "failure") {
    return "danger";
  }

  if (outcome === "denied") {
    return "warning";
  }

  if (outcome === "success") {
    return "success";
  }

  return "info";
};

const resolveOutcomeBadgeTone = (
  outcome: string | null | undefined
): StatusBadgeTone => {
  if (outcome === "failure") {
    return "danger";
  }

  if (outcome === "denied") {
    return "warning";
  }

  if (outcome === "success") {
    return "success";
  }

  return "neutral";
};

const renderAuditAccessError = (message: string): ReactElement => (
  <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
        XForge
      </p>
      <h1 className="font-semibold text-3xl tracking-tight">
        Audit unavailable
      </h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </section>
);

export default async function AuditPage(): Promise<ReactElement> {
  const audit = await loadAuditPageData();

  if (audit.status === "forbidden") {
    return renderAuditAccessError(
      "Audit visibility requires the audit.read permission for this tenant."
    );
  }

  if (audit.status === "error") {
    return renderAuditAccessError(audit.message);
  }

  const { data } = audit;
  const latestEvent = data.latestEvent;
  const distinctActions = new Set(data.events.map((event) => event.action))
    .size;
  const distinctActors = new Set(
    data.events.map((event) => `${event.actorType}:${event.actorId}`)
  ).size;

  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                XForge
              </p>
              <h1 className="font-semibold text-4xl tracking-tight">
                Audit trail
              </h1>
              <p className="max-w-3xl text-muted-foreground">
                Transaction-aware audit records for this tenant, surfaced with
                the action, outcome, actor, target, route, policy, and request
                details operators need to trace exactly what changed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge tone="neutral">Tenant {data.tenantId}</StatusBadge>
              <StatusBadge tone="info">Role {data.tenantRole}</StatusBadge>
              <StatusBadge tone="neutral">
                {data.total} total event{data.total === 1 ? "" : "s"}
              </StatusBadge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
              download
              href="/api/audit/export?format=csv"
            >
              Export CSV
            </a>
          </div>
        </div>

        <div className="mt-8">
          <DashboardGrid columns={4} gap="md">
            <KpiCard
              module="Scope"
              title="Total events"
              tone="primary"
              value={data.total}
            />
            <KpiCard
              module="Latest"
              title="Action"
              tone="info"
              value={latestEvent?.action ?? "No events"}
            />
            <KpiCard
              module="Latest"
              title="Outcome"
              tone={resolveOutcomeKpiTone(latestEvent?.outcome)}
              value={latestEvent?.outcome ?? "n/a"}
            />
            <KpiCard
              module="Coverage"
              title="Actors in view"
              tone="success"
              value={distinctActors}
            />
          </DashboardGrid>
        </div>

        {latestEvent ? (
          <section className="mt-8 rounded-[var(--radius-xl)] border border-border bg-background/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  Latest event
                </p>
                <h2 className="font-semibold text-2xl tracking-tight">
                  {latestEvent.summary}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {latestEvent.occurredAt.toLocaleString()} ·{" "}
                  {latestEvent.route || "No route"} ·{" "}
                  {latestEvent.surface || "No surface"}
                </p>
              </div>
              <StatusBadge tone={resolveOutcomeBadgeTone(latestEvent.outcome)}>
                {latestEvent.outcome}
              </StatusBadge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1 rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Actor
                </p>
                <p className="font-medium text-sm">
                  {latestEvent.actorType} / {latestEvent.actorId}
                </p>
                <p className="text-muted-foreground text-xs">
                  {latestEvent.actorRole || "No actor role"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {latestEvent.companyId || "No company scope"} /{" "}
                  {latestEvent.grantId || "No grant"}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Target
                </p>
                <p className="font-medium text-sm">
                  {latestEvent.targetDisplayName ||
                    `${latestEvent.targetType}:${latestEvent.targetId}`}
                </p>
                <p className="text-muted-foreground text-xs">
                  {latestEvent.subjectType || "No subject type"} /{" "}
                  {latestEvent.subjectId || "No subject ID"}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Request
                </p>
                <p className="font-mono text-sm">{latestEvent.requestId}</p>
                <p className="text-muted-foreground text-xs">
                  Operation {latestEvent.operationId || latestEvent.requestId}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Policy
                </p>
                <p className="font-medium text-sm">
                  {latestEvent.policyReference || "No policy reference"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Approval {latestEvent.approvalId || "none"}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </header>

      <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="font-semibold text-2xl tracking-tight">
            Event ledger
          </h2>
          <p className="text-muted-foreground text-sm">
            {distinctActions} distinct action{distinctActions === 1 ? "" : "s"}{" "}
            across {data.events.length} loaded row
            {data.events.length === 1 ? "" : "s"}.
          </p>
        </div>

        <ActivityTable
          columns={auditColumns}
          defaultSortColumn="occurredAt"
          defaultSortOrder="desc"
          emptyDescription="No audit entries were found for this tenant yet."
          emptyTitle="No audit events"
          pageSize={10}
          renderCell={(
            column: TableColumnMetadata,
            value: DashboardTableRow[string]
          ): ReactNode => {
            if (column.key === "outcome" && typeof value === "string") {
              return (
                <StatusBadge tone={resolveOutcomeBadgeTone(value)}>
                  {value}
                </StatusBadge>
              );
            }

            if (column.key === "occurredAt" && value instanceof Date) {
              return (
                <span className="text-muted-foreground">
                  {value.toLocaleString()}
                </span>
              );
            }

            if (typeof value === "string" && value.length > 0) {
              if (
                column.key === "requestId" ||
                column.key === "operationId" ||
                column.key === "actorId" ||
                column.key === "companyId" ||
                column.key === "grantId" ||
                column.key === "subjectId" ||
                column.key === "targetId" ||
                column.key === "tenantId"
              ) {
                return <span className="font-mono text-xs">{value}</span>;
              }

              if (column.key === "summary") {
                return (
                  <span className="font-medium text-foreground">{value}</span>
                );
              }
            }

            if (column.key === "diffCount") {
              return <span className="font-medium">{String(value ?? 0)}</span>;
            }

            return null;
          }}
          rows={data.events}
          searchAriaLabel="Search audit events"
          searchPlaceholder="Search audit trail..."
        />
      </section>
    </section>
  );
}
