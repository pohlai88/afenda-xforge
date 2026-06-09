import type { ReactElement, ReactNode } from "react";

import type {
  MetadataRenderContext,
  MetadataUiState,
} from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import { ErrorState } from "../renderers/states/error-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import {
  bindRendererDiagnosticCorrelation,
  mergeRendererDiagnostics,
} from "./diagnostics";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataStateRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { metadataUiStateKeys } from "./state-renderers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

const supportedMetadataStates = new Set<MetadataUiState>(metadataUiStateKeys);

const isMetadataUiState = (value: string): value is MetadataUiState =>
  supportedMetadataStates.has(value as MetadataUiState);

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
    state: isMetadataUiState(state) ? state : "ready",
  });
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

    emitMetadataTelemetry(resolvedContext, "metadata.state.render.completed", {
      diagnostics,
      level: "info",
      rendererKey: state,
      attributes: {
        state,
      },
    });

    return { diagnostics, element };
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
      element: (
        <ErrorState
          description={rendererDiagnostic.message}
          title="Failed to render metadata state"
        />
      ),
    };
  }
}
