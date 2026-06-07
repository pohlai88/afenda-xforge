export type ObservabilityTone = "neutral" | "positive" | "warning";

export type ObservabilityIndicator = {
  detail: string;
  label: string;
  tone: ObservabilityTone;
  value: string;
};

export type ProductionHardeningItem = {
  area: string;
  detail: string;
  status: "configured" | "ready" | "review";
};

export type WorkspaceObservabilitySummary = {
  indicators: readonly ObservabilityIndicator[];
  serviceName: string;
};

export const telemetry = {
  analyticsNamespace: "xforge",
  serviceName: "xforge",
} as const;

export const productionHardeningChecklist: readonly ProductionHardeningItem[] =
  [
    {
      area: "Analytics",
      detail: "The shared analytics provider is mounted in the app shells.",
      status: "configured",
    },
    {
      area: "Structured logs",
      detail:
        "Request wrappers emit requestId, operationId, traceId, organizationId, and actorId context.",
      status: "configured",
    },
    {
      area: "Health probes",
      detail:
        "Liveness, readiness, startup, and version endpoints are available through @repo/health.",
      status: "configured",
    },
    {
      area: "Error capture",
      detail:
        "Client, edge, server, and request-error Sentry entry points are exposed via dedicated @repo/observability subpaths.",
      status: "configured",
    },
    {
      area: "Audit separation",
      detail: "Runtime logs stay separate from execution audit writes.",
      status: "configured",
    },
    {
      area: "RLS",
      detail:
        "Tenant-scoped tables are guarded by row-level security policies.",
      status: "configured",
    },
    {
      area: "Log drain scaffold",
      detail:
        "Signed drain ingestion is wired at /api/internal/v1/observability/drain.",
      status: "configured",
    },
  ] as const;

export const formatAnalyticsEventName = (
  domain: string,
  action: string
): string => `${telemetry.analyticsNamespace}.${domain}.${action}`;

const ignoredAnalyticsPathnames = ["/sign-in", "/sign-up"] as const;

export const shouldIgnoreAnalyticsPathname = (pathname: string): boolean =>
  ignoredAnalyticsPathnames.some((ignoredPathname) =>
    pathname.includes(ignoredPathname)
  );

export function getWorkspaceObservabilitySummary(): WorkspaceObservabilitySummary {
  return {
    serviceName: telemetry.serviceName,
    indicators: [
      {
        detail:
          "Request wrappers emit requestId, operationId, traceId, organizationId, and actorId aliases.",
        label: "Structured request logs",
        tone: "positive",
        value: "Enabled",
      },
      {
        detail:
          "Liveness, readiness, startup, and version probes are wired through @repo/health.",
        label: "Health endpoints",
        tone: "positive",
        value: "Configured",
      },
      {
        detail:
          "The app shells mount @repo/analytics through the shared provider.",
        label: "Analytics provider",
        tone: "positive",
        value: "Mounted",
      },
      {
        detail:
          "Sentry init helpers cover dedicated client, edge, server, and instrumentation entry points.",
        label: "Error capture",
        tone: "positive",
        value: "Configured",
      },
      {
        detail: "A signed drain endpoint is available for Vercel log delivery.",
        label: "Drain endpoint",
        tone: "positive",
        value: "Wired",
      },
    ],
  };
}
