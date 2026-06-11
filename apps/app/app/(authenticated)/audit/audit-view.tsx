import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  EntityMetadataPanel,
  MetadataSectionStack,
  renderMetadataTableCell,
} from "@repo/metadata-ui/components";
import type { DashboardKpiTone } from "@repo/ui";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../_components/authenticated-feature-scope.tsx";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import type { AuditPageData } from "./_data.ts";

const AUDIT_FEATURE_ID = "system-admin.audit";

export type AuditViewProps = {
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  data: AuditPageData;
  metadata: EntityMetadata;
};

const mapAuditOutcomeMetricTone = (
  outcome: string | null | undefined
): DashboardKpiTone => {
  switch (outcome) {
    case "success":
      return "success";
    case "failure":
    case "denied":
      return "danger";
    default:
      return "info";
  }
};

const auditOutcomeColumn = {
  field: "outcome",
  key: "outcome",
  kind: "status" as const,
  label: "Outcome",
};

export function AuditView({
  context,
  customizationLayers,
  data,
  metadata,
}: AuditViewProps): ReactElement {
  const latestEvent = data.latestEvent;
  const distinctActions = new Set(data.events.map((event) => event.action))
    .size;
  const distinctActors = new Set(
    data.events.map((event) => `${event.actorType}:${event.actorId}`)
  ).size;

  const auditKpiSections: Array<{
    description: string;
    key: string;
    kind: "stat";
    metadataAttributes: {
      tone: DashboardKpiTone;
      value: number | string;
    };
    title: string;
  }> = [
    {
      description: "Scope",
      key: "audit-kpi-total",
      kind: "stat" as const,
      title: "Total events",
      metadataAttributes: {
        tone: "primary",
        value: data.total,
      },
    },
    {
      description: "Latest",
      key: "audit-kpi-action",
      kind: "stat" as const,
      title: "Action",
      metadataAttributes: {
        tone: "info",
        value: latestEvent?.action ?? "No events",
      },
    },
    {
      description: "Latest",
      key: "audit-kpi-outcome",
      kind: "stat" as const,
      title: "Outcome",
      metadataAttributes: {
        tone: mapAuditOutcomeMetricTone(latestEvent?.outcome),
        value: latestEvent?.outcome ?? "n/a",
      },
    },
    {
      description: "Coverage",
      key: "audit-kpi-actors",
      kind: "stat" as const,
      title: "Actors in view",
      metadataAttributes: {
        tone: "success",
        value: distinctActors,
      },
    },
  ];

  return (
    <AuthenticatedFeatureScope featureId={AUDIT_FEATURE_ID}>
      <section className="space-y-8">
        <header className="rounded-xl border border-lane-active-border bg-card/95 p-8 shadow-sm">
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
                  the action, outcome, actor, target, route, policy, and
                  request details operators need to trace exactly what changed.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">Tenant {data.tenantId}</Badge>
                <Badge variant="outline">Role {data.tenantRole}</Badge>
                <Badge variant="secondary">
                  {data.total} total event{data.total === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
              <Button asChild>
                <a download href="/api/audit/export?format=csv">
                  Export CSV
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <DashboardGrid columns={4} gap="md">
              {auditKpiSections.map((section) => (
                <MetadataSectionStack
                  context={context}
                  key={section.key}
                  sections={[section]}
                />
              ))}
            </DashboardGrid>
          </div>

          {latestEvent ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <MetadataSectionStack
                context={context}
                customizationLayers={customizationLayers}
                resolveSectionContent={({ section }) =>
                  section.key === "audit-workflow-preview" ? (
                    <ol className="grid gap-4">
                      {[
                        {
                          description: latestEvent.requestId,
                          title: "Request received",
                        },
                        {
                          description:
                            latestEvent.policyReference || "No policy reference",
                          title: "Policy evaluation",
                        },
                        {
                          description: `${latestEvent.action} on ${latestEvent.targetDisplayName || latestEvent.targetType}`,
                          title: "Action applied",
                        },
                      ].map((step, index) => (
                        <li
                          className="rounded-lg border border-border/70 bg-card/80 p-4"
                          key={step.title}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lane-active/15 font-medium text-lane-active text-sm">
                              {index + 1}
                            </span>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{step.title}</p>
                              <p className="text-muted-foreground text-xs">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : null
                }
                sections={[
                  {
                    description: `${latestEvent.summary} · ${latestEvent.occurredAt.toLocaleString()}`,
                    key: "audit-workflow-preview",
                    kind: "workflow",
                    title: "Latest event workflow",
                  },
                ]}
              />

              <MetadataSectionStack
                context={context}
                customizationLayers={customizationLayers}
                resolveSectionContent={({ section }) =>
                  section.key === "audit-approval-preview" ? (
                    <div className="space-y-4 rounded-lg border border-border/70 bg-card/80 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {latestEvent.approvalId
                              ? "Approval linked"
                              : "No approval required"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Operation {latestEvent.operationId || latestEvent.requestId}
                          </p>
                        </div>
                        {renderMetadataTableCell(
                          auditOutcomeColumn,
                          latestEvent.outcome,
                          context
                        )}
                      </div>
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                            Actor
                          </dt>
                          <dd className="font-medium">
                            {latestEvent.actorType} / {latestEvent.actorId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                            Target
                          </dt>
                          <dd className="font-medium">
                            {latestEvent.targetDisplayName ||
                              `${latestEvent.targetType}:${latestEvent.targetId}`}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                            Approval
                          </dt>
                          <dd className="font-medium">
                            {latestEvent.approvalId || "none"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                            Route
                          </dt>
                          <dd className="font-medium">
                            {latestEvent.route || "No route"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null
                }
                sections={[
                  {
                    description: "Governed approval context for the latest audit event.",
                    key: "audit-approval-preview",
                    kind: "approval",
                    title: "Approval preview",
                  },
                ]}
              />
            </div>
          ) : null}
        </header>

        <EntityMetadataPanel
          context={context}
          customizationLayers={customizationLayers}
          defaultSortColumn={metadata.table?.defaultSort}
          description={`${distinctActions} distinct action${distinctActions === 1 ? "" : "s"} across ${data.events.length} loaded row${data.events.length === 1 ? "" : "s"}.`}
          emptyDescription="No audit entries were found for this tenant yet."
          emptyTitle="No audit events"
          metadata={metadata}
          pageSize={10}
          rows={data.events}
          searchPlaceholder="Search audit trail..."
          title="Event ledger"
          totalRecords={data.total}
        />

        <MetadataSectionStack
          context={context}
          customizationLayers={customizationLayers}
          resolveSectionContent={({ section }) =>
            section.key === "audit-activity-feed" ? (
              <ul className="space-y-3">
                {data.events.slice(0, 5).map((event) => (
                  <li
                    className="rounded-lg border border-border/70 bg-card/80 p-4"
                    key={event.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{event.summary}</p>
                        <p className="text-muted-foreground text-xs">
                          {event.action} · {event.occurredAt.toLocaleString()}
                        </p>
                      </div>
                      {renderMetadataTableCell(
                        auditOutcomeColumn,
                        event.outcome,
                        context
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null
          }
          sections={[
            {
              description: "Latest audit events loaded for this tenant scope.",
              key: "audit-activity-feed",
              kind: "activity",
              title: "Activity preview",
            },
          ]}
        />
      </section>
    </AuthenticatedFeatureScope>
  );
}
