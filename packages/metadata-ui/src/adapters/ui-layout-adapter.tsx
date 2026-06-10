import type { ReactElement, ReactNode } from "react";

import type { MetadataLayoutContract } from "../contracts/layout.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { defaultLayoutRegistry } from "../registry/default-layout-registry";
import { ErrorState } from "../renderers/states/error-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { validateMetadataLayoutContract } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  mergeRendererDiagnostics,
} from "./diagnostics";
import { createInvalidContractFallbackResult } from "./invalid-contract-fallback";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataLayoutRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataLayoutAdapterProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  layout: MetadataLayoutContract;
  registry?: typeof defaultLayoutRegistry;
};

export function renderMetadataLayout({
  children,
  context,
  layout,
  registry = defaultLayoutRegistry,
}: MetadataLayoutAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const contractValidation = validateMetadataLayoutContract(layout);

  if (!contractValidation.valid && contractValidation.diagnostic) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      contractValidation.diagnostic,
      context.correlationId
    ) as MetadataRendererDiagnostic;

    return createInvalidContractFallbackResult(
      context,
      diagnostic,
      "Invalid layout contract",
      {
        attributes: {
          layoutKey: layout?.key ?? "unknown",
        },
        rendererKey: layout?.kind ?? "stack",
      }
    );
  }

  const resolution = resolveMetadataLayoutRenderer(
    layout.kind,
    registry,
    context
  );
  const diagnostics = resolution.diagnostic
    ? mergeRendererDiagnostics([
        bindRendererDiagnosticCorrelation(
          resolution.diagnostic,
          context.correlationId
        ) as MetadataRendererDiagnostic,
      ])
    : [];

  emitMetadataTelemetry(context, "metadata.layout.render.started", {
    attributes: {
      layoutKey: layout.key,
      layoutKind: layout.kind,
    },
    diagnostics,
    level: "debug",
    rendererKey: layout.kind,
  });

  try {
    const element = resolution.renderer({
      children,
      context,
      layout,
    });

    emitMetadataTelemetry(context, "metadata.layout.render.completed", {
      attributes: {
        layoutKey: layout.key,
        layoutKind: layout.kind,
      },
      diagnostics,
      level: "info",
      rendererKey: layout.kind,
    });

    return { diagnostics, element };
  } catch (error) {
    const rendererDiagnostic = createMetadataRendererErrorDiagnostic(
      "layout",
      layout.key,
      error,
      context.correlationId
    );

    emitMetadataTelemetry(context, "metadata.layout.render.error", {
      attributes: {
        layoutKey: layout.key,
        message: rendererDiagnostic.message,
      },
      diagnostics: mergeRendererDiagnostics(diagnostics, [rendererDiagnostic]),
      level: "error",
      rendererKey: layout.kind,
    });

    return {
      diagnostics: mergeRendererDiagnostics(diagnostics, [rendererDiagnostic]),
      element: (
        <ErrorState
          context={context}
          correlationId={context.correlationId}
          description={rendererDiagnostic.message}
          title={`Failed to render layout: ${layout.title ?? layout.key}`}
        />
      ),
    };
  }
}
