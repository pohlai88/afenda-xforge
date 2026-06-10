import type {
  MetadataActionContract,
  MetadataActionRenderer,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import type {
  MetadataLayoutKind,
  MetadataLayoutRenderer,
} from "../contracts/layout.contract";
import type {
  MetadataRenderContext,
  MetadataUiState,
} from "../contracts/render-context.contract";
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
import { defaultLayoutRegistry } from "../registry/default-layout-registry";
import { defaultSectionRegistry } from "../registry/default-section-registry";
import { defaultStateRegistry } from "../registry/default-state-registry";
import type { MetadataRendererVersionConstraint } from "../registry/renderer-version";
import { satisfiesRendererVersionConstraint } from "../registry/renderer-version";
import type {
  MetadataRendererDiagnostic,
  MetadataRendererResolutionKind,
} from "./diagnostics.ts";
import {
  bindRendererDiagnosticCorrelation,
  createDeprecatedRendererDiagnostic,
  createMissingRendererDiagnostic,
  createRendererErrorDiagnostic,
  createUnsupportedRendererVersionDiagnostic,
} from "./diagnostics.ts";
import {
  createMissingActionRenderer,
  createMissingFieldRenderer,
  createMissingLayoutRenderer,
  createMissingSectionRenderer,
  resolveActionSurface,
} from "./fallbacks.tsx";
import { createMissingStateRenderer } from "./state-renderers.tsx";

export type MetadataRendererResolution<TRenderer> = {
  diagnostic?: MetadataRendererDiagnostic;
  renderer: TRenderer;
};

type RegisteredRendererResolution<TRenderer> =
  | {
      diagnostic?: MetadataRendererDiagnostic;
      renderer: TRenderer;
      status: "found";
    }
  | {
      diagnostic: MetadataRendererDiagnostic;
      status: "version-mismatch";
    }
  | { status: "missing" };

const resolveRendererVersionConstraint = (
  context: MetadataRenderContext | undefined,
  rendererType: MetadataRendererResolutionKind,
  rendererKey: string
): MetadataRendererVersionConstraint | undefined => {
  const constraints = context?.rendererVersionConstraints;

  if (!constraints) {
    return;
  }

  return (
    constraints[`${rendererType}:${rendererKey}`] ?? constraints[rendererKey]
  );
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
    | undefined,
  context?: MetadataRenderContext
): RegisteredRendererResolution<TRenderer> => {
  if (!registration) {
    return { status: "missing" };
  }

  const versionConstraint = resolveRendererVersionConstraint(
    context,
    rendererType,
    rendererKey
  );

  if (
    !satisfiesRendererVersionConstraint(registration.version, versionConstraint)
  ) {
    return {
      diagnostic: createUnsupportedRendererVersionDiagnostic(
        rendererType,
        rendererKey,
        registration.version,
        versionConstraint ?? {}
      ),
      status: "version-mismatch",
    };
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
    status: "found",
  };
};

const resolveRendererWithFallback = <TRenderer,>(
  rendererType: MetadataRendererResolutionKind,
  rendererKey: string,
  registration:
    | {
        deprecated?: boolean;
        renderer: TRenderer;
        version: string;
      }
    | undefined,
  context: MetadataRenderContext | undefined,
  createFallback: (diagnostic: MetadataRendererDiagnostic) => TRenderer
): MetadataRendererResolution<TRenderer> => {
  const resolved = resolveRegisteredRenderer(
    rendererType,
    rendererKey,
    registration,
    context
  );

  if (resolved.status === "found") {
    return {
      diagnostic: resolved.diagnostic,
      renderer: resolved.renderer,
    };
  }

  if (resolved.status === "version-mismatch") {
    return {
      diagnostic: resolved.diagnostic,
      renderer: createFallback(resolved.diagnostic),
    };
  }

  const diagnostic = createMissingRendererDiagnostic(
    rendererType,
    rendererKey,
    "error-state"
  );

  return {
    diagnostic,
    renderer: createFallback(diagnostic),
  };
};

export function resolveMetadataFieldRenderer(
  kind: MetadataFieldKind | string | undefined,
  registry = defaultFieldRegistry,
  context?: MetadataRenderContext
): MetadataRendererResolution<MetadataFieldRenderer> {
  const rendererKey = kind ?? "text";
  const registration = registry.resolve(rendererKey as MetadataFieldKind);

  return resolveRendererWithFallback(
    "field",
    rendererKey,
    registration,
    context,
    createMissingFieldRenderer
  );
}

export function resolveMetadataActionRenderer(
  actionOrSurface:
    | MetadataActionContract
    | MetadataActionSurface
    | string
    | undefined,
  registry = defaultActionRegistry,
  context?: MetadataRenderContext
): MetadataRendererResolution<MetadataActionRenderer> {
  const rendererKey = resolveActionSurface(actionOrSurface);
  const registration = registry.resolve(rendererKey as MetadataActionSurface);

  return resolveRendererWithFallback(
    "action",
    rendererKey,
    registration,
    context,
    createMissingActionRenderer
  );
}

export function resolveMetadataSectionRenderer(
  kind: MetadataSectionKind | string | undefined,
  registry = defaultSectionRegistry,
  context?: MetadataRenderContext
): MetadataRendererResolution<MetadataSectionRenderer> {
  const rendererKey = kind ?? "section";
  const registration = registry.resolve(rendererKey as MetadataSectionKind);

  return resolveRendererWithFallback(
    "section",
    rendererKey,
    registration,
    context,
    createMissingSectionRenderer
  );
}

export function resolveMetadataStateRenderer(
  state: MetadataUiState | string | undefined,
  registry = defaultStateRegistry,
  context?: MetadataRenderContext
): MetadataRendererResolution<MetadataStateRenderer> {
  const rendererKey = state ?? "ready";
  const registration = registry.resolve(rendererKey as MetadataStateKind);

  return resolveRendererWithFallback(
    "state",
    rendererKey,
    registration,
    context,
    createMissingStateRenderer
  );
}

export function resolveMetadataLayoutRenderer(
  kind: MetadataLayoutKind | string | undefined,
  registry = defaultLayoutRegistry,
  context?: MetadataRenderContext
): MetadataRendererResolution<MetadataLayoutRenderer> {
  const rendererKey = kind ?? "stack";
  const registration = registry.resolve(rendererKey as MetadataLayoutKind);

  return resolveRendererWithFallback(
    "layout",
    rendererKey,
    registration,
    context,
    createMissingLayoutRenderer
  );
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
