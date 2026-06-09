import type {
  MetadataRenderContext,
  MetadataRenderDensity,
  MetadataRenderMode,
  MetadataUiState,
} from "./render-context.contract";

export type MetadataRenderContextDefaults = {
  actorId?: string;
  correlationId?: string;
  featureId?: string;
  locale?: string;
  mode?: MetadataRenderMode;
  moduleId?: string;
  state?: MetadataUiState;
  tenantId?: string;
  timezone?: string;
  surfaceId?: string;
  routeId?: string;
};

export function createMetadataCorrelationId(): string {
  const crypto = globalThis.crypto;

  if (crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `metadata-ui-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

const resolveLiteral = <T extends string>(
  value: T | null | undefined,
  fallback: T
): T => value ?? fallback;

const resolveBoolean = (
  value: boolean | null | undefined,
  fallback: boolean
): boolean => value ?? fallback;

const resolveNullableString = (
  value: string | null | undefined,
  fallback: string | null
): string | null => value ?? fallback;

const resolveOptional = <T>(
  value: T | null | undefined,
  fallback?: T
): T | undefined => value ?? fallback;

const resolveReadonlyRecord = (
  value: Readonly<Record<string, boolean>> | undefined
): Readonly<Record<string, boolean>> => value ?? {};

export function createMetadataRenderContext(
  context: Partial<MetadataRenderContext> | undefined,
  defaults: MetadataRenderContextDefaults = {}
): MetadataRenderContext {
  const correlationId =
    context?.correlationId ??
    defaults.correlationId ??
    createMetadataCorrelationId();

  return {
    actorId: resolveLiteral(context?.actorId ?? defaults.actorId, "system"),
    actorRole: resolveNullableString(context?.actorRole, null),
    capabilities: resolveReadonlyRecord(context?.capabilities),
    companyId: resolveNullableString(context?.companyId, null),
    correlationId,
    density: (context?.density ?? "default") as MetadataRenderDensity,
    diagnosticsEnabled: resolveBoolean(context?.diagnosticsEnabled, false),
    featureFlags: resolveReadonlyRecord(context?.featureFlags),
    featureId: resolveOptional(context?.featureId ?? defaults.featureId),
    locale: resolveLiteral(context?.locale ?? defaults.locale, "en"),
    mode: (context?.mode ?? defaults.mode ?? "read") as MetadataRenderMode,
    moduleId: resolveOptional(context?.moduleId ?? defaults.moduleId),
    organizationId: resolveNullableString(context?.organizationId, null),
    permissions: resolveReadonlyRecord(context?.permissions),
    readonly: resolveBoolean(context?.readonly, false),
    routeId: resolveOptional(context?.routeId ?? defaults.routeId),
    state: (context?.state ?? defaults.state ?? "ready") as MetadataUiState,
    surfaceId: resolveOptional(context?.surfaceId ?? defaults.surfaceId),
    telemetry: context?.telemetry,
    tenantId: resolveLiteral(context?.tenantId ?? defaults.tenantId, "default"),
    timezone: resolveLiteral(context?.timezone ?? defaults.timezone, "UTC"),
    workspaceId: resolveNullableString(context?.workspaceId, null),
  };
}
