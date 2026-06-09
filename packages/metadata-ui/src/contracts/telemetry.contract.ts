import type { MetadataDiagnostic } from "./diagnostics.contract";
import type { MetadataGovernanceDecision } from "./governance.contract";

export type MetadataTelemetryAttribute = boolean | null | number | string;

export type MetadataTelemetryLevel = "debug" | "error" | "info" | "warning";

export type MetadataTelemetryEvent = {
  name: string;
  level?: MetadataTelemetryLevel;
  timestamp?: string;
  correlationId: string;
  featureId?: string;
  moduleId?: string;
  surfaceId?: string;
  routeId?: string;
  rendererKey?: string;
  rendererVersion?: string;
  action?: string;
  durationMs?: number;
  diagnostics?: readonly MetadataDiagnostic[];
  governanceDecision?: MetadataGovernanceDecision;
  attributes?: Record<string, MetadataTelemetryAttribute>;
};

export type MetadataTelemetrySink = {
  emit: (event: MetadataTelemetryEvent) => void;
};
