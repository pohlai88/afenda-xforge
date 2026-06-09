import type {
  MetadataActorScope,
  MetadataTenantScope,
} from "./governance.contract";
import type { MetadataTelemetrySink } from "./telemetry.contract";

export type MetadataUiState =
  | "loading"
  | "empty"
  | "error"
  | "forbidden"
  | "ready"
  | "invalid"
  | "degraded"
  | "partial"
  | "readonly"
  | "maintenance";

export type MetadataRenderMode = "create" | "read" | "review" | "update";

export type MetadataRenderDensity = "compact" | "comfortable" | "default";

export type MetadataRenderContext = MetadataActorScope &
  MetadataTenantScope & {
    capabilities: Readonly<Record<string, boolean>>;
    correlationId: string;
    density: MetadataRenderDensity;
    diagnosticsEnabled: boolean;
    featureFlags: Readonly<Record<string, boolean>>;
    featureId?: string;
    locale: string;
    moduleId?: string;
    mode: MetadataRenderMode;
    readonly: boolean;
    permissions: Readonly<Record<string, boolean>>;
    routeId?: string;
    surfaceId?: string;
    state: MetadataUiState;
    telemetry?: MetadataTelemetrySink;
    timezone: string;
  };
