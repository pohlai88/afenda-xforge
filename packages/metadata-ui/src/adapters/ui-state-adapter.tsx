import type { ReactElement, ReactNode } from "react";
import { composeMetadataWithDiagnostics } from "../components/compose-metadata-with-diagnostics";
import type {
  MetadataRenderContext,
  MetadataUiState,
} from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import { ErrorState } from "../renderers/states/error-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { isKnownMetadataUiState } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  createUnsupportedStateDiagnostic,
  mergeRendererDiagnostics,
} from "./diagnostics";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataStateRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataStateAdapterProps = {
  children?: ReactNode;
  context?: Partial<MetadataRenderContext>;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string;
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onRetry?: () => void;
  state: MetadataUiState | string;
};

export function renderMetadataState({
  children,
  context,
  emptyDescription,
  emptyTitle,
  error,
  forbiddenDescription,
  forbiddenTitle,
  loadingDescription,
  loadingTitle,
  onRetry,
  state,
}: MetadataStateAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const resolvedContext = createMetadataRenderContext(context, {
    state: isKnownMetadataUiState(state) ? state : "ready",
  });

  if (!isKnownMetadataUiState(state)) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      createUnsupportedStateDiagnostic(state),
      resolvedContext.correlationId
    ) as MetadataRendererDiagnostic;
    const diagnostics = [diagnostic];

    emitMetadataTelemetry(resolvedContext, "metadata.state.render.started", {
      attributes: {
        state,
      },
      diagnostics,
      level: "debug",
      rendererKey: state,
    });

    emitMetadataTelemetry(resolvedContext, "metadata.renderer.fallback", {
      attributes: {
        reason: diagnostic.code,
        state,
      },
      diagnostics,
      level: "error",
      rendererKey: state,
    });

    return {
      diagnostics,
      element: composeMetadataWithDiagnostics(
        resolvedContext,
        <ErrorState
          context={resolvedContext}
          correlationId={resolvedContext.correlationId}
          description={diagnostic.message}
          title="Unsupported metadata state"
        />,
        diagnostics
      ),
    };
  }

  const resolution = resolveMetadataStateRenderer(state);
  const resolutionDiagnostic = bindRendererDiagnosticCorrelation(
    resolution.diagnostic,
    resolvedContext.correlationId
  );
  const diagnostics = resolutionDiagnostic ? [resolutionDiagnostic] : [];

  emitMetadataTelemetry(resolvedContext, "metadata.state.render.started", {
    diagnostics,
    level: "debug",
    rendererKey: state,
    attributes: {
      state,
    },
  });

  try {
    const element = resolution.renderer({
      children,
      diagnostics,
      emptyDescription,
      emptyTitle,
      error,
      forbiddenDescription,
      forbiddenTitle,
      loadingDescription,
      loadingTitle,
      onRetry,
    });

    if (!element) {
      return { diagnostics, element: null };
    }

    emitMetadataTelemetry(resolvedContext, "metadata.state.render.completed", {
      diagnostics,
      level: "info",
      rendererKey: state,
      attributes: {
        state,
      },
    });

    return {
      diagnostics,
      element: composeMetadataWithDiagnostics(
        resolvedContext,
        element,
        diagnostics
      ),
    };
  } catch (error) {
    const rendererDiagnostic = createMetadataRendererErrorDiagnostic(
      "state",
      state,
      error,
      resolvedContext.correlationId
    );
    const nextDiagnostics = mergeRendererDiagnostics(diagnostics, [
      rendererDiagnostic,
    ]);

    emitMetadataTelemetry(resolvedContext, "metadata.state.render.error", {
      diagnostics: nextDiagnostics,
      level: "error",
      rendererKey: state,
      attributes: {
        message: rendererDiagnostic.message,
        state,
      },
    });

    return {
      diagnostics: nextDiagnostics,
      element: composeMetadataWithDiagnostics(
        resolvedContext,
        <ErrorState
          context={resolvedContext}
          correlationId={resolvedContext.correlationId}
          description={rendererDiagnostic.message}
          title="Failed to render metadata state"
        />,
        nextDiagnostics
      ),
    };
  }
}
