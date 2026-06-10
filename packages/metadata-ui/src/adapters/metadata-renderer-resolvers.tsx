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
import type {
  MetadataStateKind,
  MetadataStateRenderer,
} from "../contracts/state-renderer.contract";
import { defaultActionRegistry } from "../registry/default-action-registry";
import { defaultFieldRegistry } from "../registry/default-field-registry";
import { defaultSectionRegistry } from "../registry/default-section-registry";
import { defaultStateRegistry } from "../registry/default-state-registry";
import type {
  MetadataRendererDiagnostic,
  MetadataRendererResolutionKind,
} from "./diagnostics.ts";
import {
  bindRendererDiagnosticCorrelation,
  createDeprecatedRendererDiagnostic,
  createMissingRendererDiagnostic,
  createRendererErrorDiagnostic,
} from "./diagnostics.ts";
import {
  createMissingActionRenderer,
  createMissingFieldRenderer,
  createMissingSectionRenderer,
  resolveActionSurface,
} from "./fallbacks.tsx";
import { createMissingStateRenderer } from "./state-renderers.tsx";

export type MetadataRendererResolution<TRenderer> = {
  diagnostic?: MetadataRendererDiagnostic;
  renderer: TRenderer;
};

const resolveRegisteredRenderer = <TRenderer,>(
  rendererType: MetadataRendererResolutionKind,
  rendererKey: string,
  registration:
    | {
        deprecated?: boolean;
        renderer: TRenderer;
        version: string;
      }
    | undefined
): MetadataRendererResolution<TRenderer> | undefined => {
  if (!registration) {
    return;
  }

  return {
    diagnostic: registration.deprecated
      ? createDeprecatedRendererDiagnostic(
          rendererType,
          rendererKey,
          registration.version
        )
      : undefined,
    renderer: registration.renderer,
  };
};

export function resolveMetadataFieldRenderer(
  kind: MetadataFieldKind | string | undefined,
  registry = defaultFieldRegistry
): MetadataRendererResolution<MetadataFieldRenderer> {
  const rendererKey = kind ?? "text";
  const registration = registry.resolve(rendererKey as MetadataFieldKind);
  const resolved = resolveRegisteredRenderer(
    "field",
    rendererKey,
    registration
  );

  if (resolved) {
    return resolved;
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
  const resolved = resolveRegisteredRenderer(
    "action",
    rendererKey,
    registration
  );

  if (resolved) {
    return resolved;
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
  const resolved = resolveRegisteredRenderer(
    "section",
    rendererKey,
    registration
  );

  if (resolved) {
    return resolved;
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
  state: MetadataUiState | string | undefined,
  registry = defaultStateRegistry
): MetadataRendererResolution<MetadataStateRenderer> {
  const rendererKey = state ?? "ready";
  const registration = registry.resolve(rendererKey as MetadataStateKind);
  const resolved = resolveRegisteredRenderer(
    "state",
    rendererKey,
    registration
  );

  if (resolved) {
    return resolved;
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
} from "../contracts/state-renderer.contract";
