import type {
  MetadataActionContract,
  MetadataActionRenderer,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import type { MetadataUiState } from "../contracts/render-context.contract";
import type {
  MetadataSectionKind,
  MetadataSectionRenderer,
} from "../contracts/section-renderer.contract";
import { defaultActionRegistry } from "../registry/default-action-registry";
import { defaultFieldRegistry } from "../registry/default-field-registry";
import { defaultSectionRegistry } from "../registry/default-section-registry";
import type {
  MetadataRendererDiagnostic,
  MetadataRendererResolutionKind,
} from "./diagnostics.ts";
import {
  bindRendererDiagnosticCorrelation,
  createMissingRendererDiagnostic,
  createRendererErrorDiagnostic,
} from "./diagnostics.ts";
import {
  createMissingActionRenderer,
  createMissingFieldRenderer,
  createMissingSectionRenderer,
  resolveActionSurface,
} from "./fallbacks.tsx";
import type { MetadataStateRenderer } from "./state-renderers.tsx";
import {
  createMissingStateRenderer,
  stateRenderers,
} from "./state-renderers.tsx";

export type MetadataRendererResolution<TRenderer> = {
  diagnostic?: MetadataRendererDiagnostic;
  renderer: TRenderer;
};

export function resolveMetadataFieldRenderer(
  kind: MetadataFieldKind | string | undefined,
  registry = defaultFieldRegistry
): MetadataRendererResolution<MetadataFieldRenderer> {
  const rendererKey = kind ?? "text";
  const registration = registry.resolve(rendererKey as MetadataFieldKind);

  if (registration) {
    return { renderer: registration.renderer };
  }

  const diagnostic = createMissingRendererDiagnostic(
    "field",
    rendererKey,
    "error-state"
  );

  return {
    diagnostic,
    renderer: createMissingFieldRenderer(diagnostic),
  };
}

export function resolveMetadataActionRenderer(
  actionOrSurface:
    | MetadataActionContract
    | MetadataActionSurface
    | string
    | undefined,
  registry = defaultActionRegistry
): MetadataRendererResolution<MetadataActionRenderer> {
  const rendererKey = resolveActionSurface(actionOrSurface);
  const registration = registry.resolve(rendererKey as MetadataActionSurface);

  if (registration) {
    return { renderer: registration.renderer };
  }

  const diagnostic = createMissingRendererDiagnostic(
    "action",
    rendererKey,
    "error-state"
  );

  return {
    diagnostic,
    renderer: createMissingActionRenderer(diagnostic),
  };
}

export function resolveMetadataSectionRenderer(
  kind: MetadataSectionKind | string | undefined,
  registry = defaultSectionRegistry
): MetadataRendererResolution<MetadataSectionRenderer> {
  const rendererKey = kind ?? "section";
  const registration = registry.resolve(rendererKey as MetadataSectionKind);

  if (registration) {
    return { renderer: registration.renderer };
  }

  const diagnostic = createMissingRendererDiagnostic(
    "section",
    rendererKey,
    "error-state"
  );

  return {
    diagnostic,
    renderer: createMissingSectionRenderer(diagnostic),
  };
}

export function resolveMetadataStateRenderer(
  state: MetadataUiState | string | undefined
): MetadataRendererResolution<MetadataStateRenderer> {
  const rendererKey = state ?? "ready";
  const renderer = stateRenderers[rendererKey];

  if (renderer) {
    return { renderer };
  }

  const diagnostic = createMissingRendererDiagnostic(
    "state",
    rendererKey,
    "error-state"
  );

  return {
    diagnostic,
    renderer: createMissingStateRenderer(diagnostic),
  };
}

export function createMetadataRendererErrorDiagnostic(
  rendererType: MetadataRendererResolutionKind,
  key: string,
  error: unknown,
  correlationId?: string
): MetadataRendererDiagnostic {
  return bindRendererDiagnosticCorrelation(
    createRendererErrorDiagnostic(rendererType, key, error),
    correlationId ??
      createMissingRendererDiagnostic(rendererType, key, key).correlationId
  ) as MetadataRendererDiagnostic;
}

export type {
  MetadataStateRenderer,
  MetadataStateRendererProps,
} from "./state-renderers.tsx";
